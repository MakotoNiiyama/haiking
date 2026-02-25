import { NextRequest, NextResponse } from 'next/server'
import { openai, MODEL } from '@/lib/openai'

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

【ルール】
1. 季語・切れ字は不要。kigoフィールドは空文字、seasonフィールドは「無季」にすること
2. 17音の口語文を基本形式とする（漢字は読み仮名の文字数でカウント。長音・促音・撥音は1音、拗音は0音でカウント）
3. リズムが心地よければ多少の字余り・字足らずも許容する
4. 難解な語句や格調ばった表現を避け、読んだ人が「わかる〜」「くすっ」となるような等身大の一句を詠むこと

【出力形式】
必ず以下のJSONのみを返してください（コードブロック不要）：
{
  "lines": ["上の句", "中の句", "下の句"],
  "kigo": "",
  "season": "無季"
}`

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mode = 'haiku' } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: '画像が必要です' }, { status: 400 })
    }

    const systemPrompt = mode === 'senryu' ? SENRYU_SYSTEM_PROMPT : HAIKU_SYSTEM_PROMPT

    const response = await openai.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8000,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: mode === 'senryu'
                ? 'この画像の情景に合った川柳を一句詠んでください。'
                : 'この画像の情景に合った俳句を一句詠んでください。',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content
    if (!content) {
      return NextResponse.json({ error: '生成に失敗しました' }, { status: 500 })
    }

    const result = JSON.parse(content)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Haiku generation error:', error)
    return NextResponse.json(
      { error: '俳句の生成中にエラーが発生しました' },
      { status: 500 },
    )
  }
}
