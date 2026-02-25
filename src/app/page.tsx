'use client'

import { useState, useCallback } from 'react'
import type { AppStep, HaikuResult } from '@/types'
import ImageUploader from '@/components/ImageUploader'
import ImageCropper from '@/components/ImageCropper'
import ImageEditor from '@/components/ImageEditor'
import { toast } from 'sonner'

const STEP_LABELS: Record<Exclude<AppStep, 'generating'>, string> = {
  upload: '写真を選ぶ',
  crop: 'トリミング',
  edit: '仕上げ',
}

const DISPLAY_STEPS: Exclude<AppStep, 'generating'>[] = ['upload', 'crop', 'edit']

export default function HomePage() {
  const [step, setStep] = useState<AppStep>('upload')
  const [originalImageUrl, setOriginalImageUrl] = useState('')
  const [croppedImageUrl, setCroppedImageUrl] = useState('')
  const [haiku, setHaiku] = useState<HaikuResult | null>(null)

  const generateHaiku = useCallback(async (imageUrl: string) => {
    setStep('generating')
    try {
      const res = await fetch('/api/generate-haiku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageUrl }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: HaikuResult = await res.json()
      setHaiku(data)
      setStep('edit')
    } catch (err) {
      console.error(err)
      toast.error('俳句の生成に失敗しました。もう一度お試しください。')
      setStep('crop')
    }
  }, [])

  const handleImageSelected = useCallback((dataUrl: string) => {
    setOriginalImageUrl(dataUrl)
    setStep('crop')
  }, [])

  const handleCropComplete = useCallback(
    (croppedDataUrl: string) => {
      setCroppedImageUrl(croppedDataUrl)
      generateHaiku(croppedDataUrl)
    },
    [generateHaiku],
  )

  const handleRegenerate = useCallback(() => {
    if (croppedImageUrl) generateHaiku(croppedImageUrl)
  }, [croppedImageUrl, generateHaiku])

  const handleReset = useCallback(() => {
    setStep('upload')
    setOriginalImageUrl('')
    setCroppedImageUrl('')
    setHaiku(null)
  }, [])

  const currentDisplayIndex = step === 'generating'
    ? 2
    : DISPLAY_STEPS.indexOf(step as Exclude<AppStep, 'generating'>)

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl" aria-label="haiking logo">🙌</span>
          <span className="text-xl font-bold tracking-tight text-stone-800">
            haiking
          </span>
          <span className="ml-auto text-[11px] text-stone-400 font-medium">
            俳句 × ハイキング
          </span>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Step indicator */}
        {step !== 'upload' && (
          <div className="flex items-center mb-6">
            {DISPLAY_STEPS.map((s, i) => {
              const isDone = i < currentDisplayIndex
              const isActive = i === currentDisplayIndex
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className="text-[10px] mt-0.5 text-stone-400 whitespace-nowrap">
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < DISPLAY_STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 mb-3 mx-1 transition-colors ${
                        isDone ? 'bg-emerald-400' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="flex flex-col items-center gap-8 animate-fade-in-up">
            {/* Hero: サンプルモックアップ */}
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
              {/* 仮の背景グラデーション（山×空イメージ） */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-emerald-400 to-emerald-800" />
              {/* 山のシルエット */}
              <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 360 200"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0,200 L0,120 L60,60 L120,100 L180,30 L240,90 L300,50 L360,80 L360,200Z"
                  fill="rgba(16,60,30,0.85)" />
                <path d="M0,200 L0,150 L80,110 L160,140 L240,100 L320,130 L360,120 L360,200Z"
                  fill="rgba(10,40,20,0.9)" />
              </svg>
              {/* 星 */}
              <div className="absolute top-4 left-8 w-1 h-1 bg-white/80 rounded-full" />
              <div className="absolute top-8 left-20 w-0.5 h-0.5 bg-white/60 rounded-full" />
              <div className="absolute top-6 right-12 w-1 h-1 bg-white/70 rounded-full" />
              <div className="absolute top-10 right-24 w-0.5 h-0.5 bg-white/50 rounded-full" />
              {/* グラデーションスクリム */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              {/* サンプル俳句テキスト */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
                <div className="text-center space-y-1.5">
                  <p className="font-haiku text-white text-xl leading-relaxed drop-shadow-lg">
                    頂きに
                  </p>
                  <p className="font-haiku text-white text-xl leading-relaxed drop-shadow-lg">
                    雲かかる朝の
                  </p>
                  <p className="font-haiku text-white text-xl leading-relaxed drop-shadow-lg">
                    静けさよ
                  </p>
                </div>
                <p className="mt-3 text-white/40 text-xs tracking-widest">🙌 haiking</p>
              </div>
              {/* 「サンプル」バッジ */}
              <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white/70 text-[10px] px-2 py-0.5 rounded-full">
                サンプル
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-stone-800 mb-2 leading-snug">
                ハイキングの一瞬を<br />俳句に刻もう
              </h1>
              <p className="text-sm text-stone-500 leading-relaxed">
                写真をアップロードすると<br />
                AIがその情景にぴったりの俳句を詠みます
              </p>
            </div>

            <ImageUploader onImageSelected={handleImageSelected} />

            {/* 使い方ヒント */}
            <div className="flex items-center gap-6 text-center">
              {[
                { icon: '📷', label: '写真を選ぶ' },
                { icon: '✂️', label: 'トリミング' },
                { icon: '🙌', label: '俳句が完成' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] text-stone-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Crop */}
        {step === 'crop' && originalImageUrl && (
          <ImageCropper
            imageUrl={originalImageUrl}
            onCropComplete={handleCropComplete}
            onBack={() => setStep('upload')}
          />
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center gap-8 py-16 animate-fade-in-up">
            {/* 書道風のローディング演出 */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-300 animate-spin" />
              <span className="text-4xl select-none">🙌</span>
            </div>
            <div className="text-center space-y-3">
              <p className="font-bold text-stone-700 text-lg">俳句を詠んでいます</p>
              <p className="text-sm text-stone-400">情景から言葉を紡いでいます</p>
              <div className="flex justify-center gap-1.5 pt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step: Edit */}
        {step === 'edit' && croppedImageUrl && haiku && (
          <div className="animate-fade-in-up">
            <ImageEditor
              imageUrl={croppedImageUrl}
              haiku={haiku}
              onRegenerate={handleRegenerate}
              onReset={handleReset}
            />
          </div>
        )}
      </div>
    </main>
  )
}


