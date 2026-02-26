'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowLeft, Upload, Sparkles, Send, RotateCcw, Scissors, Check, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { findBestTextPlacement, applyFilmTone } from '@/lib/imageAnalysis'
import type { PoemMode, Post } from '@/types'

interface ComposeScreenProps {
  onBack: () => void
  onPost: (post: Post) => void
}

const lineOffsets = [0, 1.2, 2.4]

export function ComposeScreen({ onBack, onPost }: ComposeScreenProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [haiku, setHaiku] = useState<string[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [textGray, setTextGray] = useState(255)
  const [textPos, setTextPos] = useState({ x: 65, y: 40 })
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [poemMode, setPoemMode] = useState<PoemMode>('haiku')
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1)
  // トリミングモード
  const [isCropMode, setIsCropMode] = useState(false)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; size: number } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const textElRef = useRef<HTMLDivElement>(null) // ドラッグ可能テキスト要素（サイズ計測用）
  const croppedForApiRef = useRef<string | null>(null) // AI送信用画像（元アスペクト比）
  // poemModeを useCallback depに依存させず最新値を参照するため refで持つ
  const poemModeRef = useRef<PoemMode>('haiku')
  const cropDragRef = useRef<{
    type: 'move' | 'resize-se'
    startX: number
    startY: number
    startRect: { x: number; y: number; size: number }
  } | null>(null)
  const dragStartRef = useRef<{
    x: number
    y: number
    posX: number
    posY: number
    halfW: number
    halfH: number
  } | null>(null)

  // poemMode 変更を ref に同期
  useEffect(() => { poemModeRef.current = poemMode }, [poemMode])

  const textColor = `rgb(${textGray}, ${textGray}, ${textGray})`

  /**
   * 画像選択時のフロー（自動正方形クロップなし・元アスペクト比を保持）：
   *  ① DataURL 変換 → ② アスペクト比検出 → ③ AIリクエストを即座に開始
   *  ④ 待機中に filmTone + 配置分析を並列実行 → 画像すぐ表示
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

    // ② 元画像のアスペクト比を検出してカードに反映
    const naturalRatio = await new Promise<number>((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
      img.src = rawDataUrl
    })
    setImageAspectRatio(naturalRatio)
    setIsCropMode(false)
    setCropRect(null)

    setIsGenerating(true)
    setHaiku(null)
    setUploadedImage(null)
    croppedForApiRef.current = rawDataUrl

    // ③ AIリクエストを即座に開始 (遅い, 3–10秒)
    const apiPromise = fetch('/api/generate-haiku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: rawDataUrl, mode: poemModeRef.current }),
    })

    // ④ 待機中に filmTone + 配置分析 (高速プレビュー表示)
    try {
      const [filteredUrl, placement] = await Promise.all([
        applyFilmTone(rawDataUrl).catch(() => rawDataUrl),
        findBestTextPlacement(rawDataUrl),
      ])
      setUploadedImage(filteredUrl)
      setTextPos({ x: placement.x, y: placement.y })
    } catch {
      setUploadedImage(rawDataUrl)
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
        body: JSON.stringify({ imageBase64: src, mode: poemModeRef.current }),
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

  /** カード基準でテキスト要素の halfW/halfH (%) を返す。計測できない場合は 0 */
  const measureHalf = useCallback(() => {
    if (!cardRef.current || !textElRef.current) return { halfW: 0, halfH: 0 }
    const rect = cardRef.current.getBoundingClientRect()
    const halfW = (textElRef.current.offsetWidth / rect.width) * 50
    const halfH = (textElRef.current.offsetHeight / rect.height) * 50
    return { halfW, halfH }
  }, [])

  /** textPos を枠内に収まるようクランプして返す */
  const clampPos = useCallback(
    (x: number, y: number, halfW: number, halfH: number) => ({
      x: Math.max(halfW, Math.min(100 - halfW, x)),
      y: Math.max(halfH, Math.min(100 - halfH, y)),
    }),
    [],
  )

  // 俳句テキストが DOM に現れた後（isGenerating=false かつ haiku あり）に
  // 実サイズを計測して初期位置をクランプする
  // ※ haiku だけを依存にすると isGenerating がまだ true で textElRef が null になるため
  //   isGenerating も依存に含め、false になったタイミングで計測する
  useEffect(() => {
    if (!haiku || isGenerating) return
    // 1フレーム待ってから計測（AnimatePresence のアニメ開始後にサイズが確定）
    const id = requestAnimationFrame(() => {
      const { halfW, halfH } = measureHalf()
      if (halfW === 0 && halfH === 0) return
      setTextPos((prev) => clampPos(prev.x, prev.y, halfW, halfH))
    })
    return () => cancelAnimationFrame(id)
  }, [haiku, isGenerating, measureHalf, clampPos])

  // --- Draggable text (pointer events) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!haiku || !cardRef.current) return
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    // PointerDown 時に1度だけ計測して dragStartRef に保存する
    // (Move 中に textElRef が null になっても安全)
    const { halfW, halfH } = measureHalf()
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: textPos.x,
      posY: textPos.y,
      halfW,
      halfH,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100
    const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100
    const { posX, posY, halfW, halfH } = dragStartRef.current
    setTextPos(clampPos(posX + dx, posY + dy, halfW, halfH))
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    dragStartRef.current = null
  }

  // --- Trimming (crop mode) ---

  /** トリミングモードに入る。カードの短辺サイズの正方形を中央に初期化する */
  const enterCropMode = useCallback(() => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const size = Math.min(rect.width, rect.height)
    setCropRect({ x: (rect.width - size) / 2, y: (rect.height - size) / 2, size })
    setIsCropMode(true)
  }, [])

  const cancelCropMode = useCallback(() => {
    setIsCropMode(false)
    setCropRect(null)
  }, [])

  /** cropRect を確定してキャンバスでクロップ適用 */
  const confirmCrop = useCallback(() => {
    if (!cropRect || !cardRef.current || !uploadedImage) return
    const cardRect = cardRef.current.getBoundingClientRect()
    const img = new Image()
    img.onload = () => {
      const scaleX = img.naturalWidth / cardRect.width
      const scaleY = img.naturalHeight / cardRect.height
      const canvas = document.createElement('canvas')
      const s = cropRect.size
      canvas.width = Math.round(s * scaleX)
      canvas.height = Math.round(s * scaleY)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        cropRect.x * scaleX, cropRect.y * scaleY,
        s * scaleX, s * scaleY,
        0, 0, canvas.width, canvas.height,
      )
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92)
      // テキスト位置をクロップ後の座標系に変換
      const textPxX = textPos.x / 100 * cardRect.width
      const textPxY = textPos.y / 100 * cardRect.height
      const newTextX = (textPxX - cropRect.x) / s * 100
      const newTextY = (textPxY - cropRect.y) / s * 100
      setUploadedImage(croppedDataUrl)
      setImageAspectRatio(1)
      setTextPos({ x: newTextX, y: newTextY })
      setIsCropMode(false)
      setCropRect(null)
    }
    img.src = uploadedImage
  }, [cropRect, uploadedImage, textPos])

  /** クロップ枠ドラッグ開始 */
  const handleCropPointerDown = useCallback(
    (e: React.PointerEvent, type: 'move' | 'resize-se') => {
      if (!cropRect) return
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      cropDragRef.current = { type, startX: e.clientX, startY: e.clientY, startRect: { ...cropRect } }
    },
    [cropRect],
  )

  /** クロップ枠ドラッグ移動（テキストが枠外に出ないよう制約） */
  const handleCropPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!cropDragRef.current || !cropRect || !cardRef.current) return
      const cardRect = cardRef.current.getBoundingClientRect()
      const dx = e.clientX - cropDragRef.current.startX
      const dy = e.clientY - cropDragRef.current.startY
      const { type, startRect } = cropDragRef.current
      // テキストのピクセル境界
      const tHalfW = textElRef.current ? textElRef.current.offsetWidth / 2 : 0
      const tHalfH = textElRef.current ? textElRef.current.offsetHeight / 2 : 0
      const tCx = textPos.x / 100 * cardRect.width
      const tCy = textPos.y / 100 * cardRect.height
      const tL = tCx - tHalfW; const tR = tCx + tHalfW
      const tT = tCy - tHalfH; const tB = tCy + tHalfH
      const hasText = tHalfW > 0 || tHalfH > 0
      if (type === 'move') {
        const size = startRect.size
        let nx = startRect.x + dx
        let ny = startRect.y + dy
        // カード内に制限
        nx = Math.max(0, Math.min(cardRect.width - size, nx))
        ny = Math.max(0, Math.min(cardRect.height - size, ny))
        // テキストを枠内に保持
        if (hasText) {
          nx = Math.min(tL, Math.max(tR - size, nx))
          ny = Math.min(tT, Math.max(tB - size, ny))
        }
        setCropRect({ x: nx, y: ny, size })
      } else {
        // SE コーナーリサイズ（左上固定・右下だけ移動）
        const maxSize = Math.min(cardRect.width - startRect.x, cardRect.height - startRect.y)
        const minSize = hasText
          ? Math.max(60, tR - startRect.x, tB - startRect.y)
          : 60
        const newSize = Math.max(minSize, Math.min(maxSize, startRect.size + dx))
        setCropRect({ ...startRect, size: newSize })
      }
    },
    [cropRect, textPos],
  )

  const handleCropPointerUp = useCallback(() => { cropDragRef.current = null }, [])

  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async () => {
    if (!haiku || !uploadedImage || isPosting) return
    setIsPosting(true)
    try {
      // DataURL の場合は S3 へアップロード（設定されていなければ DataURL をそのまま使用）
      let imageUrl = uploadedImage
      let postId = Date.now().toString()
      if (uploadedImage.startsWith('data:')) {
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl: uploadedImage,
              meta: { haiku, poemMode, textPos, textGray, aspectRatio: imageAspectRatio },
            }),
          })
          if (res.ok) {
            const data = await res.json()
            imageUrl = data.url
            if (data.id) postId = data.id
          }
          // S3 未設定 (503) や失敗時は DataURL にフォールバック
        } catch {
          // ネットワークエラー等 → DataURL フォールバック
        }
      }
      onPost({
        id: postId,
        imageUrl,
        haiku,
        poemMode,
        textPos,
        textGray,
        aspectRatio: imageAspectRatio,
        likes: 0,
        timestamp: 'たった今',
        createdAt: Date.now(),
      })
      onBack()
    } finally {
      setIsPosting(false)
    }
  }

  const hasContent = !!haiku && haiku.length > 0

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-black/5">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <span
          className="absolute left-1/2 -translate-x-1/2 text-gray-800"
          style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.95rem' }}
        >
          つくる
        </span>
        <button
          disabled={!hasContent || isPosting}
          onClick={handlePost}
          className={`px-4 py-1.5 rounded-full transition-all ${
            hasContent && !isPosting ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
          }`}
          style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.8rem' }}
        >
          <div className="flex items-center gap-1.5">
            {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {isPosting ? '投稿中…' : '投稿'}
          </div>
        </button>
      </div>

      {/* 俳句 / 川柳 モードトグル */}
      <div className="flex justify-center px-4 py-2 border-b border-black/5">
        <div className="flex bg-gray-100 rounded-full p-0.5">
          {(['haiku', 'senryu'] as const).map((mode) => (
            <button
              key={mode}
              disabled={isGenerating}
              onClick={() => setPoemMode(mode)}
              className={`px-5 py-1.5 rounded-full text-sm transition-all ${
                poemMode === mode
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-400 hover:text-gray-600'
              } ${isGenerating ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.78rem' }}
            >
              {mode === 'haiku' ? '俳句' : '川柳'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Preview Card / Upload Area */}
        <div className="px-5 pt-5 pb-3">
          <div
            ref={cardRef}
            className={`relative w-full overflow-hidden rounded-2xl shadow-md ${
              isDragOver ? 'ring-2 ring-gray-400 ring-offset-2' : ''
            }`}
            style={{ aspectRatio: `${imageAspectRatio} / 1` }}
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
                          AIが{poemMode === 'senryu' ? '川柳' : '俳句'}を詠んでいます…
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draggable haiku text */}
                {/* 位置決め div (transform: translate) と framer-motion アニメ div を分離する。
                    motion.div に style.transform と initial/animate の scale を同時に指定すると
                    framer-motion が transform を上書きして translate(-50%,-50%) が無効になるため。 */}
                <AnimatePresence>
                  {haiku && !isGenerating && (
                    <div
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
                      {/* アニメーション専用 motion.div: transform 系は scale のみ */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          ref={textElRef}
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
                                fontSize: '1.4rem',
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
                    </div>
                  )}
                </AnimatePresence>

                {/* Re-upload button (トリミングモード中は隠す) */}
                {!isCropMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-3 left-3 z-20 bg-black/30 backdrop-blur-sm rounded-full p-2 hover:bg-black/50 transition-colors"
                  >
                    <Upload size={16} className="text-white/80" />
                  </button>
                )}

                {/* トリミングオーバーレイ */}
                {isCropMode && cropRect && (
                  <div
                    className="absolute inset-0 z-30"
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                  >
                    {/* 固定表示の俳句テキスト（配置参考用，操作不可） */}
                    {haiku && (
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
                            <span
                              key={i}
                              style={{
                                writingMode: 'vertical-rl',
                                whiteSpace: 'nowrap',
                                fontSize: '1.4rem',
                                letterSpacing: '0.3em',
                                marginTop: `${lineOffsets[i]}em`,
                                userSelect: 'none',
                              }}
                            >
                              {line}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* クロップ枠（box-shadowで枠外をダークに） */}
                    <div
                      className="absolute cursor-move"
                      style={{
                        left: cropRect.x,
                        top: cropRect.y,
                        width: cropRect.size,
                        height: cropRect.size,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                        touchAction: 'none',
                      }}
                      onPointerDown={(e) => handleCropPointerDown(e, 'move')}
                    >
                      {/* 四隅のガイド線 */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
                      {/* SEリサイズハンドル */}
                      <div
                        className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white cursor-se-resize"
                        style={{ touchAction: 'none' }}
                        onPointerDown={(e) => { e.stopPropagation(); handleCropPointerDown(e, 'resize-se') }}
                      />
                    </div>
                  </div>
                )}
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
            {/* トリミングモード中: confirm / cancel */}
            {isCropMode ? (
              <div className="flex gap-3 justify-center mb-5">
                <button
                  onClick={cancelCropMode}
                  className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm active:scale-95 transition-all"
                >
                  <X size={14} className="text-gray-500" />
                  <span style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.75rem' }} className="text-gray-600">キャンセル</span>
                </button>
                <button
                  onClick={confirmCrop}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-full shadow-sm active:scale-95 transition-all"
                >
                  <Check size={14} />
                  <span style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.75rem' }}>確定</span>
                </button>
              </div>
            ) : (
              <>
                {/* Regenerate */}
                {haiku && !isGenerating && (
                  <button
                    onClick={regenerateHaiku}
                    className="flex items-center gap-2 mx-auto mb-3 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all"
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

                {/* トリミングボタン */}
                {haiku && !isGenerating && (
                  <button
                    onClick={enterCropMode}
                    className="flex items-center gap-2 mx-auto mb-5 px-5 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all"
                  >
                    <Scissors size={14} className="text-gray-500" />
                    <span
                      className="text-gray-600"
                      style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.75rem' }}
                    >
                      正方形にトリミング
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

            {haiku && !isGenerating && !isCropMode && (
              <p
                className="text-center text-gray-300 mt-4"
                style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '0.6rem' }}
              >
                {poemMode === 'senryu' ? '川柳' : '俳句'}をドラッグして配置を調整できます
              </p>
            )}
          </>
          )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
