'use client'

import { useState, useRef } from 'react'
import { Heart, Share2, Download, Loader2 } from 'lucide-react'
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
  const [isDownloading, setIsDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

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

  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      // 1. 画像を crossOrigin=anonymous で再取得（CORS対応）
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = reject
        // キャッシュバスターを付けて確実にCORSヘッダ付きで取得
        image.src = imageUrl.includes('?')
          ? `${imageUrl}&_cb=${Date.now()}`
          : `${imageUrl}?_cb=${Date.now()}`
      })

      // 2. カードの実レンダリングサイズを取得
      const cardEl = cardRef.current
      const cardW = cardEl ? cardEl.getBoundingClientRect().width : 390
      const cardH = cardW / aspectRatio
      const scale = 2 // Retina品質

      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(cardW * scale)
      canvas.height = Math.round(cardH * scale)
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)

      // 3. 画像を object-cover 相当で描画
      const imgAspect = img.naturalWidth / img.naturalHeight
      const canvasAspect = cardW / cardH
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      if (imgAspect > canvasAspect) {
        sw = img.naturalHeight * canvasAspect
        sx = (img.naturalWidth - sw) / 2
      } else {
        sh = img.naturalWidth / canvasAspect
        sy = (img.naturalHeight - sh) / 2
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cardW, cardH)

      // 4. グラデーションオーバーレイ（CSS と同じ from-black/30 via-transparent to-black/50）
      const grad = ctx.createLinearGradient(0, 0, 0, cardH)
      grad.addColorStop(0,   'rgba(0,0,0,0.18)')
      grad.addColorStop(0.4, 'rgba(0,0,0,0)')
      grad.addColorStop(1,   'rgba(0,0,0,0.50)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, cardW, cardH)

      // 5. 俳句テキストを縦書きで描画
      //    CSS: flex-row-reverse + vertical-rl + fontSize 1.4rem + letterSpacing 0.3em
      await document.fonts.ready
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const fontSize     = 1.4 * rootFontSize          // px
      const lineGap      = 0.5 * fontSize               // gap between columns
      const charSpacing  = 0.3 * fontSize               // letter-spacing
      const charStep     = fontSize + charSpacing        // vertical advance per char

      ctx.font      = `${fontSize}px 'Klee One', 'Hiragino Mincho ProN', cursive`
      ctx.fillStyle = `rgb(${textGray},${textGray},${textGray})`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'

      // ブロック中心座標
      const cx = (textPos.x / 100) * cardW
      const cy = (textPos.y / 100) * cardH

      // 各列の幅 = fontSize, 列間 = lineGap
      // flex-row-reverse なので index=0 が右端
      const totalCols     = haiku.length
      const blockW        = totalCols * fontSize + (totalCols - 1) * lineGap
      const blockStartX   = cx - blockW / 2 + fontSize / 2   // 右端列の中心X

      haiku.forEach((line, lineIdx) => {
        // 列のX: lineIdx=0 → 右端
        const colX       = blockStartX + (totalCols - 1 - lineIdx) * (fontSize + lineGap)
        // marginTop (lineOffsets[i] em)
        const marginTop  = lineOffsets[lineIdx] * fontSize
        const chars      = Array.from(line)
        const textH      = chars.length * charStep - charSpacing
        const startY     = cy - textH / 2 + marginTop

        chars.forEach((char, ci) => {
          ctx.fillText(char, colX, startY + ci * charStep + fontSize / 2)
        })
      })

      // 6. PNG として保存
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `yomibito-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed:', e)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.div
      ref={cardRef}
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
          <button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading
              ? <Loader2 size={19} className="text-white/60 animate-spin" />
              : <Download size={19} className="text-white/80" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
