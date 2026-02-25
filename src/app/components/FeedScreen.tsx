'use client'

import { motion } from 'motion/react'
import { HaikuCard } from './haiku-card'
import type { Post } from '@/types'

// モックデータ（匿名・最古順想定）
const MOCK_POSTS: Post[] = [
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
  posts: Post[]
}

export function FeedScreen({ posts }: FeedScreenProps) {
  const allPosts = [...posts, ...MOCK_POSTS]

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
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
          世界中の誰かが撮った一瞬と、言葉
        </p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5">
        {allPosts.map((post, i) => (
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
        ))}
      </div>
    </div>
  )
}
