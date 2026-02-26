'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { Loader2, RefreshCw } from 'lucide-react'
import { HaikuCard } from './haiku-card'
import type { Post } from '@/types'

// モックデータは開発環境のみ表示（本番デプロイ時は空配列）
const MOCK_POSTS: Post[] = process.env.NODE_ENV === 'production' ? [] : [
  {
    id: 'mock-1',
    imageUrl:
      'https://images.unsplash.com/photo-1669668181755-7c5d19898ff5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    haiku: ['夕焼けに', '染まる帰り道', '影ふたつ'],
    poemMode: 'haiku',
    textPos: { x: 75, y: 50 },
    textGray: 255,
    aspectRatio: 1,
    likes: 142,
    timestamp: '2時間前',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'mock-2',
    imageUrl:
      'https://images.unsplash.com/photo-1568571022375-ad4f3ef34972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    haiku: ['波の音', 'イヤホン外して', 'きく夏よ'],
    poemMode: 'haiku',
    textPos: { x: 25, y: 50 },
    textGray: 255,
    aspectRatio: 1,
    likes: 98,
    timestamp: '5時間前',
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
  },
  {
    id: 'mock-3',
    imageUrl:
      'https://images.unsplash.com/photo-1571068160251-c8333566dad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    haiku: ['金色の', '葉っぱの絨毯', '踏む二人'],
    poemMode: 'haiku',
    textPos: { x: 75, y: 50 },
    textGray: 255,
    aspectRatio: 1,
    likes: 215,
    timestamp: '昨日',
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: 'mock-4',
    imageUrl:
      'https://images.unsplash.com/photo-1771330021649-3104f04934f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    haiku: ['ホームにて', '来ない電車を', '待つ二月'],
    poemMode: 'haiku',
    textPos: { x: 50, y: 50 },
    textGray: 255,
    aspectRatio: 1,
    likes: 77,
    timestamp: '2日前',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'mock-5',
    imageUrl:
      'https://images.unsplash.com/photo-1662038271111-5b1c0b4157e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    haiku: ['湯気のぼる', '朝のしずけさ', '猫とわたし'],
    poemMode: 'haiku',
    textPos: { x: 25, y: 50 },
    textGray: 255,
    aspectRatio: 1,
    likes: 189,
    timestamp: '3日前',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
]

interface FeedScreenProps {
  featuredPost?: Post | null
}

export function FeedScreen({ featuredPost }: FeedScreenProps) {
  const [remotePosts, setRemotePosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/posts')
      if (res.ok) {
        const { posts } = await res.json()
        setRemotePosts(posts ?? [])
      }
    } catch {
      // ネットワークエラー → 空配列のまま
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // featuredPost を先頭に、重複を除いたリストを構築
  const deduplicated = remotePosts.filter((p) => p.id !== featuredPost?.id)
  const displayPosts = featuredPost ? [featuredPost, ...deduplicated] : deduplicated

  // ローカル開発用フォールバック
  const fallback = displayPosts.length === 0 ? MOCK_POSTS : displayPosts

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl text-gray-900 leading-none"
            style={{ fontFamily: "'Klee One', cursive" }}
          >
            詠みびとしらず
          </h1>
          <p
            className="text-gray-400 mt-1"
            style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.65rem' }}
          >
            あなたの写真とAIのことばで、今日を切り取る。
          </p>
        </div>
        {/* 更新ボタン */}
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="p-1 mt-1 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
          aria-label="フィードを更新"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5">
        {loading && fallback.length === 0 ? (
          <div className="flex justify-center items-center pt-20">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : (
          fallback.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <HaikuCard
                imageUrl={post.imageUrl}
                haiku={post.haiku}
                textPos={post.textPos}
                textGray={post.textGray}
                aspectRatio={post.aspectRatio}
                likes={post.likes}
                timestamp={post.timestamp}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )}