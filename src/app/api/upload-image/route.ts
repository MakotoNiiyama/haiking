import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@/lib/env'

const s3 = new S3Client({
  region: env.awsRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  },
})

/**
 * POST /api/upload-image
 * Body: { dataUrl: string }  (filmTone 済みの DataURL)
 * Returns: { url: string }   (CloudFront or S3 の公開 URL)
 */
export async function POST(req: NextRequest) {
  try {
    if (!env.awsS3BucketName || !env.awsAccessKeyId) {
      return NextResponse.json({ error: 'S3 not configured' }, { status: 503 })
    }

    const { dataUrl } = (await req.json()) as { dataUrl: string }
    if (!dataUrl?.startsWith('data:image/')) {
      return NextResponse.json({ error: 'invalid dataUrl' }, { status: 400 })
    }

    // DataURL → Buffer
    const [meta, base64] = dataUrl.split(',')
    const mimeMatch = meta.match(/data:([^;]+);/)
    const mimeType = mimeMatch?.[1] ?? 'image/png'
    const ext = mimeType.split('/')[1] ?? 'png'
    const buffer = Buffer.from(base64, 'base64')

    const key = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    await s3.send(
      new PutObjectCommand({
        Bucket: env.awsS3BucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // CloudFront 経由で公開するため S3 オブジェクト自体を public にしない
        // （バケットポリシーで CloudFront OAC からのアクセスのみ許可する）
      }),
    )

    // CloudFront ドメインが設定されていれば CDN URL、なければ S3 URL
    const url = env.cdnDomain
      ? `https://${env.cdnDomain}/${key}`
      : `https://${env.awsS3BucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`

    return NextResponse.json({ url })
  } catch (err) {
    console.error('[upload-image]', err)
    return NextResponse.json({ error: 'upload failed' }, { status: 500 })
  }
}
