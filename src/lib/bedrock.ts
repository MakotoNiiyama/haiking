import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'
import { env } from '@/lib/env'

// S3と同じIAMユーザーのcredentialを明示的に渡す
// (Amplify SSRはLambdaで動くためデフォルトのIAMロール解決が使えない)
export const bedrockClient = new BedrockRuntimeClient({
  region: env.awsRegion,
  ...(env.awsAccessKeyId && env.awsSecretAccessKey
    ? {
        credentials: {
          accessKeyId: env.awsAccessKeyId,
          secretAccessKey: env.awsSecretAccessKey,
        },
      }
    : {}),
})

// Claude Haiku 4.5 — 低コスト・高速
export const BEDROCK_MODEL_ID = env.bedrockModelId
