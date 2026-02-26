/**
 * 環境変数の一元管理・バリデーション
 * サーバーサイド専用。クライアントバンドルに含めないこと。
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `[env] 必須環境変数 "${key}" が設定されていません。.env.example を確認してください。`,
    )
  }
  return value
}

export const env = {
  // Azure OpenAI
  azureOpenAiApiKey: requireEnv('AZURE_OPENAI_API_KEY'),
  azureOpenAiEndpoint: requireEnv('AZURE_OPENAI_ENDPOINT'),
  azureOpenAiDeployment: requireEnv('AZURE_OPENAI_DEPLOYMENT'),
  azureOpenAiApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2025-01-01-preview',

  // AWS S3
  awsAccessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
  awsSecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  awsRegion: process.env.S3_REGION ?? 'ap-northeast-1',
  awsS3BucketName: process.env.S3_BUCKET_NAME ?? '',

  // CloudFront CDN (optional — 未設定時はS3 URLをそのまま使用)
  cdnDomain: process.env.NEXT_PUBLIC_CDN_DOMAIN ?? '',
} as const
