import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'
import { env } from '@/lib/env'

export const bedrockClient = new BedrockRuntimeClient({
  region: env.awsRegion,
})

// Claude Haiku 4.5 — 低コスト・高速
export const BEDROCK_MODEL_ID = env.bedrockModelId
