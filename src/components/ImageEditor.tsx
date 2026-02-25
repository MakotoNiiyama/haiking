'use client'

import { useState, useCallback } from 'react'
import { FILTERS, renderToCanvas } from '@/lib/filters'
import type { HaikuResult } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  imageUrl: string
  haiku: HaikuResult
  onRegenerate: () => void
  onReset: () => void
}

export default function ImageEditor({ imageUrl, haiku, onRegenerate, onReset }: Props) {
  const [filterIndex, setFilterIndex] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const currentFilter = FILTERS[filterIndex]

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      const dataUrl = await renderToCanvas(imageUrl, currentFilter.css, haiku.lines, 1080)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `haiking-${Date.now()}.png`
      a.click()
      toast.success('画像をダウンロードしました！')
    } catch {
      toast.error('ダウンロードに失敗しました')
    } finally {
      setIsDownloading(false)
    }
  }, [imageUrl, currentFilter.css, haiku.lines])

  const seasonConfig: Record<string, { emoji: string; color: string }> = {
    春: { emoji: '🌸', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    夏: { emoji: '☀️', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    秋: { emoji: '🍂', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    冬: { emoji: '❄️', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  }
  const season = seasonConfig[haiku.season] ?? { emoji: '', color: '' }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {/* ── Image preview with haiku overlay ── */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="生成された俳句"
          className="w-full h-full object-cover filter-transition"
          style={{ filter: currentFilter.css === 'none' ? undefined : currentFilter.css }}
        />
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
        {/* Haiku overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6">
          <div className="text-center space-y-2">
            {haiku.lines.map((line, i) => (
              <p
                key={i}
                className={`font-haiku text-white text-xl leading-relaxed drop-shadow-lg ${
                  i === 0
                    ? 'animate-ink-in'
                    : i === 1
                    ? 'animate-ink-in-delay-1'
                    : 'animate-ink-in-delay-2'
                }`}
              >
                {line}
              </p>
            ))}
          </div>
          <p className="mt-4 text-white/40 text-[11px] tracking-widest">🙌 haiking</p>
        </div>
      </div>

      {/* ── Kigo / season badges ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${season.color}`}>
          {season.emoji} {haiku.season}の句
        </span>
        <Badge variant="outline" className="text-xs font-medium text-stone-600">
          季語: {haiku.kigo}
        </Badge>
      </div>

      {/* ── Explanation ── */}
      <div className="bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100">
        <p className="text-xs text-stone-500 leading-relaxed">{haiku.explanation}</p>
      </div>

      {/* ── Filter selector ── */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
          フィルター
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFilterIndex(i)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-16 h-16 rounded-2xl overflow-hidden transition-all duration-200 ${
                  i === filterIndex
                    ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105 shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={f.name}
                  className="w-full h-full object-cover filter-transition"
                  style={{ filter: f.css === 'none' ? undefined : f.css }}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  i === filterIndex ? 'text-emerald-600' : 'text-stone-400'
                }`}
              >
                {f.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-10 rounded-xl border-stone-200 hover:border-emerald-300 hover:text-emerald-700"
          onClick={onRegenerate}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          俳句を作り直す
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-10 rounded-xl border-stone-200"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          最初からやり直す
        </Button>
      </div>

      <Button
        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-200 transition-all"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ダウンロード中…
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            画像をダウンロード
          </>
        )}
      </Button>
    </div>
  )
}

