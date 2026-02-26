import { NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import type { Post } from '@/types'

function createS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? ''
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? ''
  return new S3Client({
    region: process.env.S3_REGION ?? 'ap-northeast-1',
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
  })
}

/**
 * GET /api/posts
 * S3 の posts/*.json をランダムに最大 5 件返す
 */
export async function GET() {
  const bucket = process.env.S3_BUCKET_NAME
  if (!bucket) {
    return NextResponse.json({ posts: [] })
  }

  try {
    const s3 = createS3Client()

    // posts/ 以下の全オブジェクトを一覧 (最大 1000 件)
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'posts/',
    }))

    const jsonKeys = (list.Contents ?? [])
      .map((o) => o.Key!)
      .filter((k) => k.endsWith('.json'))

    if (jsonKeys.length === 0) {
      return NextResponse.json({ posts: [] })
    }

    // Fisher-Yates シャッフルで最大 5 件をランダム選択
    const shuffled = [...jsonKeys].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 5)

    // 並列で取得
    const posts = await Promise.all(
      selected.map(async (key) => {
        const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
        const body = await res.Body!.transformToString()
        return JSON.parse(body) as Post
      }),
    )

    return NextResponse.json({ posts })
  } catch (err) {
    console.error('[posts]', err)
    return NextResponse.json({ posts: [] })
  }
}
