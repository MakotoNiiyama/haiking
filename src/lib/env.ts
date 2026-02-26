/**
 * 環境変数の一元管理
 * サーバーサイド専用。クライアントバンドルに含めないこと。
 */

export const env = {
  // Azure OpenAI (ローカル開発用・任意)
  // 設定されている場合はBedrockより優先して使用される
  azureOpenAiApiKey: process.env.AZURE_OPENAI_API_KEY ?? '',
  azureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? '',
  azureOpenAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? '',
  azureOpenAiApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2025-01-01-preview',

  // AWS Bedrock (本番用・AOAIが未設定の場合に使用)
  bedrockModelId:
    process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-haiku-4-5-20251001-v1:0',

  // AWS S3
  awsAccessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
  awsSecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  awsRegion: process.env.S3_REGION ?? 'ap-northeast-1',
  awsS3BucketName: process.env.S3_BUCKET_NAME ?? '',

  // CloudFront CDN (optional — 未設定時はS3 URLをそのまま使用)
  cdnDomain: process.env.NEXT_PUBLIC_CDN_DOMAIN ?? '',
} as const
