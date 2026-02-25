'use client'

import { useCallback, useRef } from 'react'
import { Upload, ImagePlus } from 'lucide-react'

interface Props {
  onImageSelected: (dataUrl: string) => void
}

export default function ImageUploader({ onImageSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) onImageSelected(result)
      }
      reader.readAsDataURL(file)
    },
    [onImageSelected],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-sm mx-auto"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex flex-col items-center justify-center w-full aspect-square rounded-3xl border-2 border-dashed border-stone-300 bg-stone-50 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="p-4 rounded-full bg-stone-100 group-hover:bg-emerald-100 transition-colors">
            <ImagePlus className="w-10 h-10 text-stone-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div>
            <p className="text-base font-medium text-stone-600 group-hover:text-emerald-700">
              写真をアップロード
            </p>
            <p className="text-sm text-stone-400 mt-1">
              タップまたはドラッグ＆ドロップ
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              写真を選ぶ
            </span>
          </div>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <p className="mt-4 text-xs text-stone-400">
        JPG / PNG / WEBP — 最大 20MB
      </p>
    </div>
  )
}
