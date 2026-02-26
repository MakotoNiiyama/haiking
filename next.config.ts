import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
