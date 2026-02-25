'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/app/components/ui/button'
import { Crop as CropIcon } from 'lucide-react'

interface Props {
  imageUrl: string
  onCropComplete: (croppedDataUrl: string) => void
  onBack: () => void
}

function centerAspectCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
    width,
    height,
  )
}

export default function ImageCropper({ imageUrl, onCropComplete, onBack }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centerAspectCrop(w, h))
  }, [])

  const handleConfirm = useCallback(() => {
    const img = imgRef.current
    if (!img || !crop) return

    const canvas = document.createElement('canvas')
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const size = Math.round(Math.min(
      (crop.width / 100) * img.naturalWidth,
      (crop.height / 100) * img.naturalHeight,
    ))

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      img,
      (crop.x / 100) * img.naturalWidth,
      (crop.y / 100) * img.naturalHeight,
      (crop.width / 100) * img.naturalWidth,
      (crop.height / 100) * img.naturalHeight,
      0,
      0,
      size,
      size,
    )

    onCropComplete(canvas.toDataURL('image/jpeg', 0.95))
  }, [crop, onCropComplete])

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <p className="text-sm text-stone-500 text-center">
        正方形の範囲を選択してください
      </p>
      <div className="w-full rounded-2xl overflow-hidden shadow-lg">
        <ReactCrop
          crop={crop}
          onChange={(_, pct) => setCrop(pct)}
          aspect={1}
          circularCrop={false}
          className="w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="トリミング対象"
            className="w-full"
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
      <div className="flex gap-3 w-full">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          戻る
        </Button>
        <Button
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={handleConfirm}
        >
          <CropIcon className="w-4 h-4 mr-2" />
          この範囲で決定
        </Button>
      </div>
    </div>
  )
}
