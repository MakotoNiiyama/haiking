/**
 * AOAI 疎通テストスクリプト
 * 実行: node scripts/test-aoai.mjs
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// .env.local を手動で読み込む
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '../.env.local')
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
    .filter(([k]) => k)
    .map(([k, ...v]) => [k, v.join('=')])
)

const { AzureOpenAI } = await import('openai')

const client = new AzureOpenAI({
  apiKey: envVars.AZURE_OPENAI_API_KEY,
  endpoint: envVars.AZURE_OPENAI_ENDPOINT,
  apiVersion: envVars.AZURE_OPENAI_API_VERSION ?? '2025-04-01-preview',
})

const deployment = envVars.AZURE_OPENAI_DEPLOYMENT

console.log('─── AOAI 疎通テスト ───────────────────────────')
console.log(`Endpoint  : ${envVars.AZURE_OPENAI_ENDPOINT}`)
console.log(`Deployment: ${deployment}`)
console.log(`API Ver   : ${envVars.AZURE_OPENAI_API_VERSION}`)
console.log('──────────────────────────────────────────────')
console.log('リクエスト送信中...\n')

try {
  const response = await client.chat.completions.create({
    model: deployment,
    max_completion_tokens: 5000,
    messages: [
      {
        role: 'system',
        content: 'あなたは俳人です。',
      },
      {
        role: 'user',
        content: '青空の写真を見て、俳句を一句詠んでください。JSON形式で lines, kigo, season, explanation を返してください。',
      },
    ],
  })

  const content = response.choices[0].message.content
  const parsed = JSON.parse(content)

  console.log('✅ 接続成功！\n')
  console.log('生成された俳句:')
  console.log(`  ${parsed.lines?.[0]}`)
  console.log(`  ${parsed.lines?.[1]}`)
  console.log(`  ${parsed.lines?.[2]}`)
  console.log(`\n季語: ${parsed.kigo}（${parsed.season}）`)
  console.log(`解説: ${parsed.explanation}`)
  console.log(`\nModel: ${response.model}`)
  console.log(`Tokens: ${response.usage?.total_tokens}`)
} catch (err) {
  console.error('❌ エラーが発生しました:\n')
  console.error(err.message ?? err)
  if (err.status) console.error(`HTTP Status: ${err.status}`)
  if (err.error) console.error('Error body:', JSON.stringify(err.error, null, 2))
  process.exit(1)
}
