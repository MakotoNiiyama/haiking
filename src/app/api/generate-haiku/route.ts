import { NextRequest, NextResponse } from 'next/server'
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { AzureOpenAI } from 'openai'
import { createBedrockClient, BEDROCK_MODEL_ID } from '@/lib/bedrock'
import { env } from '@/lib/env'

/** AZURE_OPENAI_API_KEY が設定されていればAOAI優先、なければBedrock */
const useAoai = Boolean(env.azureOpenAiApiKey && env.azureOpenAiEndpoint && env.azureOpenAiDeployment)

const aoaiClient = useAoai
  ? new AzureOpenAI({
      apiKey: env.azureOpenAiApiKey,
      endpoint: env.azureOpenAiEndpoint,
      apiVersion: env.azureOpenAiApiVersion,
    })
  : null

const HAIKU_SYSTEM_PROMPT = `あなたは江戸時代から続く俳人の系譜を受け継ぐ、現代の俳人です。
送られてくる画像を深く観察し、その情景に合った俳句を一句詠んでください。

【厳守するルール】
1. 季語（kigo）を含めること
3. 五・七・五の拍数（モーラ）を正確に守ること（漢字は読み仮名の文字数でカウント。長音・促音・撥音は1音、拗音は0音でカウント）
4. 情景から思い起こされる感情・感覚・特定の光景を想起させる鋭い表現を使うこと
5. できるだけ「風景の外側にあるもの」「なぜその風景が生まれたか」「写真の枠の外で何が起きているか」といった想像力豊かなメタ視点を取り入れること
6. 月並みな表現・陳腐な比喩を避け、読んだ人が「ハッ」とする一句を詠むこと

【出力形式】
必ず以下のJSONのみを返してください（コードブロック不要）：
{
  "lines": ["上の句", "中の句", "下の句"],
  "kigo": "季語",
  "season": "春 or 夏 or 秋 or 冬 or 無季"
}`

const SENRYU_SYSTEM_PROMPT = `あなたは日常の風景に温かい目を向ける、現代川柳の作者です。
送られてくる画像を見て、その情景に合った川柳を一句詠んでください。

【大切にしてほしいこと】
- 肩の力を抜いた、気軽で素直な言葉を選ぶこと
- 「あるある」と思わず笑顔になるような、日常の発見や共感を大切にすること
- 難しく考えすぎず、見たままの感想や素直な感情を口語でそのまま表現してもよい
- ユーモアがあっても、皮肉や冷笑ではなく、温かみや愛嬌のある表現にすること

【音数ルール】
- 句全体の合計音数を17音にすること（最優先）
- 16音・18音は許容する
- 15音以下・19音以上は絶対に不可
- 上の句・中の句・下の句への音の割り振りは自由。5-7-5でなくてもよい（例：3-4-10、7-5-5 など）
- 音数は「読み仮名の一音ずつ」で数える
- 長音（ー）は1音：「コーヒー」= 4音
- 促音（っ）は1音：「きって」= 3音
- 撥音（ん）は1音：「おんせん」= 4音
- 拗音（ゃゅょ）は直前の子音と合わせて1音、それ自体は0音：「きゃ」= 1音、「しゅ」= 1音
- 例：「春がきた」→ は(1)る(2)が(3)き(4)た(5) = 5音 ✓
- 例：「ちゃんぽんを」→ ちゃ(1)ん(2)ぽ(3)ん(4)を(5) = 5音 ✓

【許容範囲】
- 合計16音（例：4-7-5、5-6-5、5-7-4）または18音（例：6-7-5、5-7-6、5-8-5）は許容する
- 合計15音以下、または19音以上は絶対に認めない

【検証手順（必ず実行）】
一句を詠んだら、出力前に必ず以下を確認すること：
1. 句全体（上の句＋中の句＋下の句）の音を一つずつ数え、合計音数を出す
2. 合計音数が16〜18音の範囲内であることを確認する
3. 範囲外（15音以下または19音以上）であれば語を置き換え、再度数えてから出力する

【その他のルール】
- 季語・切れ字は不要。kigoフィールドは空文字、seasonフィールドは「無季」にすること
- 難解な語句や格調ばった表現を避け、読んだ人が「わかる〜」「くすっ」となるような等身大の一句を詠むこと
- できるだけ「風景の外側にあるもの」「なぜその風景が生まれたか」「写真の枠の外で何が起きているか」といった想像力豊かなメタ視点を取り入れること

【出力形式】
必ず以下のJSONのみを返してください（コードブロック不要）：
{
  "lines": ["上の句", "中の句", "下の句"],
  "kigo": "",
  "season": "無季"
}`

/**
 * ThrottlingException / 429 に対して exponential backoff で最大 maxAttempts 回リトライ
 * 500ms → 1000ms → 2000ms
 */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const isRetryable =
        err instanceof Error &&
        (err.name === 'ThrottlingException' ||
          err.name === 'ServiceUnavailableException' ||
          (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 429 ||
          (err as { status?: number }).status === 429)
      if (isRetryable && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2 ** (attempt - 1) * 500))
        continue
      }
      throw err
    }
  }
  throw lastErr
}

/** data:image/jpeg;base64,XXXX → { mediaType, data } に分解 */
function parseDataUrl(dataUrl: string): { mediaType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid data URL')
  return { mediaType: match[1], data: match[2] }
}

/** JSONを文字列から安全に取り出す */
function extractJson(text: string): string {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('JSON not found in response')
  return m[0]
}

async function generateWithAoai(
  imageBase64: string,
  systemPrompt: string,
  userText: string,
): Promise<string> {
  const response = await withRetry(() => aoaiClient!.chat.completions.create({
    model: env.azureOpenAiDeployment,
    max_completion_tokens: 512,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageBase64, detail: 'high' } },
          { type: 'text', text: userText },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  }))
  return response.choices[0].message.content ?? ''
}

async function generateWithBedrock(
  imageBase64: string,
  systemPrompt: string,
  userText: string,
): Promise<string> {
  const { mediaType, data } = parseDataUrl(imageBase64)
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: userText },
        ],
      },
    ],
  }
  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  })
  const res = await withRetry(() => createBedrockClient().send(command))
  const body = JSON.parse(new TextDecoder().decode(res.body))
  return body.content?.[0]?.text ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mode = 'haiku' } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: '画像が必要です' }, { status: 400 })
    }

    const systemPrompt = mode === 'senryu' ? SENRYU_SYSTEM_PROMPT : HAIKU_SYSTEM_PROMPT
    const userText =
      mode === 'senryu'
        ? 'この画像の情景に合った川柳を一句詠んでください。'
        : 'この画像の情景に合った俳句を一句詠んでください。'

    console.log(`[generate-haiku] backend=${useAoai ? 'AOAI' : 'Bedrock'} mode=${mode}`)

    const raw = useAoai
      ? await generateWithAoai(imageBase64, systemPrompt, userText)
      : await generateWithBedrock(imageBase64, systemPrompt, userText)

    if (!raw) {
      return NextResponse.json({ error: '生成に失敗しました' }, { status: 500 })
    }

    const result = JSON.parse(extractJson(raw))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Haiku generation error:', error)
    return NextResponse.json(
      { error: '俳句の生成中にエラーが発生しました' },
      { status: 500 },
    )
  }
}
