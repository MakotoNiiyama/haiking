'use client'

import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { HaikuCard } from './haiku-card'

const feedData = [
  {
    id: '1',
    imageUrl:
      'https://images.unsplash.com/photo-1669668181755-7c5d19898ff5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBza3klMjBjbG91ZHMlMjBhdG1vc3BoZXJpY3xlbnwxfHx8fDE3NzIwMDQ5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    haiku: ['夕焼けに', '染まる帰り道', '影ふたつ'],
    author: 'はる',
    authorAvatar: 'H',
    likes: 142,
    comments: 23,
    timestamp: '2時間前',
    textPosition: 'right' as const,
  },
  {
    id: '2',
    imageUrl:
      'https://images.unsplash.com/photo-1568571022375-ad4f3ef34972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwYmx1ZSUyMGNhbG18ZW58MXx8fHwxNzcyMDA0OTkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    haiku: ['波の音', 'イヤホン外して', 'きく夏よ'],
    author: 'りく',
    authorAvatar: 'R',
    likes: 98,
    comments: 12,
    timestamp: '5時間前',
    textPosition: 'left' as const,
  },
  {
    id: '3',
    imageUrl:
      'https://images.unsplash.com/photo-1571068160251-c8333566dad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBsZWF2ZXMlMjBnb2xkZW4lMjBsaWdodHxlbnwxfHx8fDE3NzIwMDQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    haiku: ['金色の', '葉っぱの絨毯', '踏む二人'],
    author: 'あおい',
    authorAvatar: 'A',
    likes: 215,
    comments: 34,
    timestamp: '昨日',
    textPosition: 'right' as const,
  },
  {
    id: '4',
    imageUrl:
      'https://images.unsplash.com/photo-1771330021649-3104f04934f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbiUyMHN0YXRpb24lMjBwbGF0Zm9ybSUyMG5vc3RhbGdpY3xlbnwxfHx8fDE3NzIwMDQ5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    haiku: ['ホームにて', '来ない電車を', '待つ二月'],
    author: 'そら',
    authorAvatar: 'S',
    likes: 77,
    comments: 9,
    timestamp: '2日前',
    textPosition: 'center' as const,
  },
  {
    id: '5',
    imageUrl:
      'https://images.unsplash.com/photo-1662038271111-5b1c0b4157e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JuaW5nJTIwY29mZmVlJTIwd2luZG93JTIwbGlnaHR8ZW58MXx8fHwxNzcxOTk4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    haiku: ['湯気のぼる', '朝のしずけさ', '猫とわたし'],
    author: 'なな',
    authorAvatar: 'N',
    likes: 189,
    comments: 41,
    timestamp: '3日前',
    textPosition: 'left' as const,
  },
]

interface FeedScreenProps {
  onDiscoverTap: () => void
}

export function FeedScreen({ onDiscoverTap }: FeedScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div>
          <h1
            className="text-2xl text-gray-900 leading-none"
            style={{ fontFamily: "'Klee One', cursive" }}
          >
            haiking
          </h1>
          <p
            className="text-gray-400 mt-0.5"
            style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.65rem' }}
          >
            ことばと写真で、今日を切り取る
          </p>
        </div>
        <button
          onClick={onDiscoverTap}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Search size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5">
        {feedData.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            {/* Author row */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
                style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.7rem' }}
              >
                {item.authorAvatar}
              </div>
              <span
                className="text-gray-700 text-sm"
                style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
              >
                {item.author}
              </span>
              <span
                className="text-gray-300 text-xs ml-auto"
                style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
              >
                {item.timestamp}
              </span>
            </div>
            <HaikuCard {...item} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
