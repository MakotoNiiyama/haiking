import { AzureOpenAI } from 'openai'

export const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2025-01-01-preview',
})

// デプロイメント名 = モデル名として使用
export const MODEL = process.env.AZURE_OPENAI_DEPLOYMENT ?? 'gpt-5'
