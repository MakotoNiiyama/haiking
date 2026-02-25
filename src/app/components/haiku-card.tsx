'use client'

import { useState } from 'react'
import { Heart, Share2, Download } from 'lucide-react'
import { motion } from 'motion/react'
import type { Post } from '@/types'

type HaikuCardProps = Pick<Post, 'imageUrl' | 'haiku' | 'textPos' | 'textGray' | 'aspectRatio' | 'likes' | 'timestamp'>

const lineOffsets = [0, 1.2, 2.4]

export function HaikuCard({
  imageUrl,
  haiku,
  textPos,
  textGray,
  aspectRatio,
  likes: initialLikes,
  timestamp,
}: HaikuCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)

  const textColor = `rgb(${textGray}, ${textGray}, ${textGray})`

  const handleLike = () => {
    setLiked((prev) => !prev)
    setLikes((prev) => (liked ? prev - 1 : prev + 1))
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: '詠みびとしらず', text: haiku.join(' / '), url: location.href })
      } else {
        await navigator.clipboard.writeText(haiku.join(' / '))
      }
    } catch {
      // user cancelled or unsupported
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `yomibito-${Date.now()}.jpg`
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative w-full overflow-hidden rounded-2xl shadow-md"
      style={{ aspectRatio: `${aspectRatio} / 1` }}
    >
      {/* Background Image */}
      <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* Light gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Haiku text – position from textPos (percentage-based) */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          left: `${textPos.x}%`,
          top: `${textPos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="flex flex-row-reverse items-start"
          style={{
            fontFamily: "var(--font-klee-one), 'Hiragino Mincho ProN', cursive",
            color: textColor,
            gap: '0.5em',
          }}
        >
          {haiku.map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.15, duration: 0.5 }}
              style={{
                writingMode: 'vertical-rl',
                whiteSpace: 'nowrap',
                fontSize: '1.4rem',
                letterSpacing: '0.3em',
                marginTop: `${lineOffsets[i]}em`,
              }}
            >
              {line}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 z-20 flex items-center justify-between">
        {/* Timestamp */}
        <span
          className="text-white/50"
          style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.6rem' }}
        >
          {timestamp}
        </span>

        {/* Actions: like / share / download */}
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1">
            <Heart
              size={20}
              className={`transition-all duration-200 ${
                liked ? 'fill-rose-400 text-rose-400 scale-110' : 'text-white/80'
              }`}
            />
            <span className="text-white/70" style={{ fontSize: '0.6rem' }}>
              {likes}
            </span>
          </button>
          <button onClick={handleShare}>
            <Share2 size={19} className="text-white/80" />
          </button>
          <button onClick={handleDownload}>
            <Download size={19} className="text-white/80" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
