'use client'

import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, Upload, Sparkles, Send, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { autoCropToSquare, findBestTextPlacement, applyFilmTone } from '@/lib/imageAnalysis'

interface ComposeScreenProps {
  onBack: () => void
}

const lineOffsets = [0, 1.2, 2.4]

export function ComposeScreen({ onBack }: ComposeScreenProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [haiku, setHaiku] = useState<string[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [textGray, setTextGray] = useState(255)
  const [textPos, setTextPos] = useState({ x: 65, y: 40 })
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const croppedForApiRef = useRef<string | null>(null) // フィルムトーン前のクロップ済画像（AI送信用）
  const dragStartRef = useRef<{
    x: number
    y: number
    posX: number
    posY: number
  } | null>(null)

  const textColor = `rgb(${textGray}, ${textGray}, ${textGray})`

  /**
   * 画像選択時のフロー：
   *  ① DataURL 変換 → ② 自動クロップ → ③ AIリクエストを即座に開始
   *  ④ 待機中に filmTone + 配置分析を並列実行 (高速, ~50ms) → 番画すぐ表示
   *  ⑤ AI 完了時に俳句をテキストとしてアニメーション表示
   */
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return

    // ① DataURL 変換
    const rawDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // ② 自動クロップ
    setIsGenerating(true)
    setHaiku(null)
    setUploadedImage(null)
    let croppedUrl = rawDataUrl
    try {
      croppedUrl = await autoCropToSquare(rawDataUrl)
    } catch (e) {
      console.warn('autoCropToSquare failed, using original', e)
    }
    croppedForApiRef.current = croppedUrl

    // ③ AIリクエストを即座に開始 (遅い, 3–10秒)
    const apiPromise = fetch('/api/generate-haiku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: croppedUrl }),
    })

    // ④ 待機中に filmTone + 配置分析 (高速プレビュー表示)
    try {
      const [filteredUrl, placement] = await Promise.all([
        applyFilmTone(croppedUrl).catch(() => croppedUrl),
        findBestTextPlacement(croppedUrl),
      ])
      setUploadedImage(filteredUrl) // スピナーが乗ったまま画像が即座に出る
      setTextPos({ x: placement.x, y: placement.y })
      setTextGray(placement.gray)
    } catch {
      setUploadedImage(croppedUrl)
    }

    // ⑤ AI 完了待ち (スピナーはここまで続く)
    try {
      const apiRes = await apiPromise
      if (!apiRes.ok) throw new Error(await apiRes.text())
      const data = await apiRes.json()
      setHaiku(data.lines as string[])
    } catch (err) {
      console.error(err)
      toast.error('俳句の生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  /** 同じ画像で再度俳句だけ再生成（クロップ・フィルムトーン・配置は変更しない） */
  const regenerateHaiku = async () => {
    const src = croppedForApiRef.current
    if (!src) return
    setIsGenerating(true)
    setHaiku(null)
    try {
      const res = await fetch('/api/generate-haiku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: src }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setHaiku(data.lines as string[])
    } catch (err) {
      console.error(err)
      toast.error('俳句の再生成に失敗しました。')
    } finally {
      setIsGenerating(false)
    }
  }

  // --- Draggable text (pointer events) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!haiku || !cardRef.current) return
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: textPos.x,
      posY: textPos.y,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100
    const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100
    const newX = Math.max(20, Math.min(80, dragStartRef.current.posX + dx))
    const newY = Math.max(30, Math.min(62, dragStartRef.current.posY + dy))
    setTextPos({ x: newX, y: newY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    dragStartRef.current = null
  }

  const hasContent = !!haiku && haiku.length > 0

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <span
          className="text-gray-800"
          style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.95rem' }}
        >
          つくる
        </span>
        <button
          disabled={!hasContent}
          className={`px-4 py-1.5 rounded-full transition-all ${
            hasContent ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
          }`}
          style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.8rem' }}
        >
          <div className="flex items-center gap-1.5">
            <Send size={14} />
            投稿
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Preview Card / Upload Area */}
        <div className="px-5 pt-5 pb-3">
          <div
            ref={cardRef}
            className={`relative w-full overflow-hidden rounded-2xl shadow-md ${
              isDragOver ? 'ring-2 ring-gray-400 ring-offset-2' : ''
            }`}
            style={{ aspectRatio: '1/1' }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {uploadedImage ? (
              <>
                <img
                  src={uploadedImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Generating overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 z-20"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles size={28} className="text-white" />
                        </motion.div>
                        <p
                          className="text-white/90"
                          style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.8rem' }}
                        >
                          AIが俳句を詠んでいます…
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draggable haiku text */}
                <AnimatePresence>
                  {haiku && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute z-10"
                      style={{
                        left: `${textPos.x}%`,
                        top: `${textPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        touchAction: 'none',
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
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
                            key={`${line}-${i}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            style={{
                              writingMode: 'vertical-rl',
                              whiteSpace: 'nowrap',
                              fontSize: '1.3rem',
                              letterSpacing: '0.3em',
                              marginTop: `${lineOffsets[i]}em`,
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                            }}
                          >
                            {line}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Re-upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-3 left-3 z-20 bg-black/30 backdrop-blur-sm rounded-full p-2 hover:bg-black/50 transition-colors"
                >
                  <Upload size={16} className="text-white/80" />
                </button>
              </>
            ) : (
              /* Empty state */
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Upload size={26} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-gray-500"
                      style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.85rem' }}
                    >
                      写真をアップロード
                    </p>
                    <p
                      className="text-gray-400 mt-1"
                      style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.65rem' }}
                    >
                      タップまたはドラッグ&ドロップ
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
            e.target.value = ''
          }}
        />

        {/* Controls */}
        {uploadedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-2 pb-6"
          >
            {/* Regenerate */}
            {haiku && !isGenerating && (
              <button
                onClick={regenerateHaiku}
                className="flex items-center gap-2 mx-auto mb-5 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                <RotateCcw size={14} className="text-gray-500" />
                <span
                  className="text-gray-600"
                  style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.75rem' }}
                >
                  もう一句よむ
                </span>
              </button>
            )}

            {/* Color slider */}
            {haiku && !isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-gray-400"
                    style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.7rem' }}
                  >
                    文字の色
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: textColor }}
                  />
                </div>
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      height: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'linear-gradient(to right, #000000, #ffffff)',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={textGray}
                    onChange={(e) => setTextGray(Number(e.target.value))}
                    className="color-slider w-full relative z-10 appearance-none bg-transparent cursor-pointer"
                    style={{ height: '24px' }}
                  />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-gray-300"
                    style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.55rem' }}
                  >
                    くろ
                  </span>
                  <span
                    className="text-gray-300"
                    style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.55rem' }}
                  >
                    しろ
                  </span>
                </div>
              </div>
            )}

            {haiku && !isGenerating && (
              <p
                className="text-center text-gray-300 mt-4"
                style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.6rem' }}
              >
                俳句をドラッグして配置を調整できます
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
