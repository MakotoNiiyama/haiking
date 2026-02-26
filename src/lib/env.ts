/**
 * 環境変数の一元管理
 * サーバーサイド専用。クライアントバンドルに含めないこと。
 */

export const env = {
  // AWS Bedrock
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
