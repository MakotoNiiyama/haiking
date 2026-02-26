import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { Post, PoemMode } from '@/types'

function createS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? ''
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? ''
  return new S3Client({
    region: process.env.S3_REGION ?? 'ap-northeast-1',
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
  })
}

interface UploadMeta {
  haiku: string[]
  poemMode: PoemMode
  textPos: { x: number; y: number }
  textGray: number
  aspectRatio: number
}

/**
 * POST /api/upload-image
 * Body: { dataUrl: string, meta?: UploadMeta }
 * Returns: { url: string, id: string }
 */
export async function POST(req: NextRequest) {
  const bucket = process.env.S3_BUCKET_NAME
  const accessKeyId = process.env.S3_ACCESS_KEY_ID

  if (!bucket || !accessKeyId) {
    return NextResponse.json({ error: 'S3 not configured' }, { status: 503 })
  }

  try {
    const { dataUrl, meta } = (await req.json()) as { dataUrl: string; meta?: UploadMeta }
    if (!dataUrl?.startsWith('data:image/')) {
      return NextResponse.json({ error: 'invalid dataUrl' }, { status: 400 })
    }

    const [metaStr, base64] = dataUrl.split(',')
    const mimeMatch = metaStr.match(/data:([^;]+);/)
    const mimeType = mimeMatch?.[1] ?? 'image/png'
    const ext = mimeType.split('/')[1] ?? 'png'
    const buffer = Buffer.from(base64, 'base64')

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const imageKey = `posts/${id}.${ext}`

    const s3 = createS3Client()

    // 画像をアップロード
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: imageKey,
      Body: buffer,
      ContentType: mimeType,
    }))

    const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN
    const imageUrl = cdnDomain
      ? `https://${cdnDomain}/${imageKey}`
      : `https://${bucket}.s3.${process.env.S3_REGION ?? 'ap-northeast-1'}.amazonaws.com/${imageKey}`

    // メタデータが送られてきた場合はJSONも保存
    if (meta) {
      const post: Post = {
        id,
        imageUrl,
        haiku: meta.haiku,
        poemMode: meta.poemMode,
        textPos: meta.textPos,
        textGray: meta.textGray,
        aspectRatio: meta.aspectRatio,
        likes: 0,
        timestamp: 'たった今',
        createdAt: Date.now(),
      }
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `posts/${id}.json`,
        Body: JSON.stringify(post),
        ContentType: 'application/json',
      }))
    }

    return NextResponse.json({ url: imageUrl, id })
  } catch (err) {
    console.error('[upload-image]', err)
    return NextResponse.json({ error: 'upload failed' }, { status: 500 })
  }
}

