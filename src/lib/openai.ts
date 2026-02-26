import { AzureOpenAI } from 'openai'
import { env } from '@/lib/env'

export const openai = new AzureOpenAI({
  apiKey: env.azureOpenAiApiKey,
  endpoint: env.azureOpenAiEndpoint,
  apiVersion: env.azureOpenAiApiVersion,
})

// デプロイメント名 = モデル名として使用
export const MODEL = env.azureOpenAiDeployment
