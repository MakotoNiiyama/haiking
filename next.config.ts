import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Amplify WEB_COMPUTE の Lambda では process.env が自動注入されないため、
  // ビルド時に値を確定する。Amplify の環境変数はビルドフェーズで利用可能。
  env: {
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? '',
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? '',
    S3_REGION: process.env.S3_REGION ?? 'ap-northeast-1',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ?? '',
    // BEDROCK_MODEL_ID は未設定時にデフォルト値を使うため空文字を注入しない
    ...(process.env.BEDROCK_MODEL_ID ? { BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID } : {}),
  },
  images: {
    remotePatterns: [
      // Unsplash (モックデータ・開発用)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // CloudFront CDN (本番 S3 画像配信)
      ...(process.env.NEXT_PUBLIC_CDN_DOMAIN
        ? [{ protocol: 'https' as const, hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN }]
        : []),
    ],
  },
}

export default nextConfig
