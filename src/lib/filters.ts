import type { Filter } from '@/types'

export const FILTERS: Filter[] = [
  {
    id: 'original',
    name: 'オリジナル',
    css: 'none',
  },
  {
    id: 'vintage',
    name: 'ヴィンテージ',
    css: 'sepia(0.45) contrast(1.1) brightness(1.08) saturate(0.75)',
  },
  {
    id: 'cool',
    name: 'クール',
    css: 'hue-rotate(20deg) saturate(1.3) brightness(1.02)',
  },
  {
    id: 'mono',
    name: 'モノクロ',
    css: 'grayscale(1) contrast(1.15) brightness(1.05)',
  },
  {
    id: 'vivid',
    name: 'ビビッド',
    css: 'saturate(2) contrast(1.1) brightness(1.02)',
  },
  {
    id: 'fade',
    name: 'フェード',
    css: 'brightness(1.15) contrast(0.82) saturate(0.6)',
  },
  {
    id: 'drama',
    name: 'ドラマ',
    css: 'contrast(1.45) brightness(0.88) saturate(1.25)',
  },
]

/**
 * Draw the cropped square image onto a canvas with a filter and haiku overlay,
 * then return the canvas as a data URL.
 */
export async function renderToCanvas(
  imageUrl: string,
  filterCss: string,
  haikuLines: [string, string, string],
  outputSize = 1080,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas context unavailable'))

      // Apply photogenic filter
      ctx.filter = filterCss === 'none' ? 'none' : filterCss
      ctx.drawImage(img, 0, 0, outputSize, outputSize)
      ctx.filter = 'none'

      // Bottom gradient scrim
      const gradient = ctx.createLinearGradient(0, outputSize * 0.45, 0, outputSize)
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.72)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, outputSize, outputSize)

      // Wait for Japanese font
      await document.fonts.ready

      const fontSize = Math.round(outputSize * 0.056)
      const lineHeight = Math.round(outputSize * 0.08)
      const startY = Math.round(outputSize * 0.68)

      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 8

      // Haiku lines
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.font = `${fontSize}px "Noto Serif JP", "Hiragino Mincho ProN", serif`
      haikuLines.forEach((line, i) => {
        ctx.fillText(line, outputSize / 2, startY + i * lineHeight)
      })

      // Branding
      ctx.shadowBlur = 0
      ctx.font = `${Math.round(outputSize * 0.028)}px "Noto Sans JP", sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillText('🙌 haiking', outputSize / 2, outputSize * 0.975)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageUrl
  })
}
