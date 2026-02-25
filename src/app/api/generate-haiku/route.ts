import { NextRequest, NextResponse } from 'next/server'
import { openai, MODEL } from '@/lib/openai'

const SYSTEM_PROMPT = `あなたは江戸時代から続く俳人の系譜を受け継ぐ、現代の俳人です。
送られてくる画像を深く観察し、その情景に合った俳句を一句詠んでください。

【厳守するルール】
1. 季節を表現するときには季語（kigo）を含めること
2. 季語を含めない場合は、seasonフィールドには無季と入れること
3. 必ず上・中・下の3句からなる合計17語の俳句で表現すること。俳句の型式は5・7・5でなくても良いが17語で文字数を調整すること（漢字は読み仮名の文字数でカウントする。助詞や助動詞も1語としてカウントする）
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

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: '画像が必要です' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8000,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
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
              text: 'この画像の情景に合った俳句を一句詠んでください。',
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
