import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'
import { env } from '@/lib/env'

// クライアントをリクエスト時に生成する（モジュール初期化時はenv varsが未解決の場合があるため）
export function createBedrockClient(): BedrockRuntimeClient {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? ''
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? ''
  return new BedrockRuntimeClient({
    region: process.env.S3_REGION ?? 'ap-northeast-1',
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  })
}

// Claude Haiku 4.5 — 新世代モデルはInference Profile経由が必須
// ?? でなく || を使う（next.config.tsが空文字を注入する場合に対応）
export const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || 'jp.anthropic.claude-haiku-4-5-20251001-v1:0'
