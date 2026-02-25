/**
 * Browser-side image analysis utilities for haiking.
 * Auto-crop to square and find optimal text placement.
 */

/** Compute brightness variance and mean from raw RGBA pixel data */
function analyzeBlock(
  data: Uint8ClampedArray,
  length: number,
): { variance: number; mean: number } {
  let sum = 0
  let sumSq = 0
  const n = length / 4 // RGBA → pixel count
  for (let i = 0; i < length; i += 4) {
    // BT.601 perceived luminance
    const b = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
    sum += b
    sumSq += b * b
  }
  const mean = sum / n
  return { variance: sumSq / n - mean * mean, mean }
}

/** Decode a DataURL into an HTMLImageElement */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Auto-crop an image to a square by finding the most information-dense
 * (highest brightness variance) crop window on the longer axis.
 * Returns a JPEG DataURL of the square result.
 */
export async function autoCropToSquare(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl)
  const W = img.naturalWidth
  const H = img.naturalHeight
  const size = Math.min(W, H)

  // Output canvas
  const out = document.createElement('canvas')
  out.width = size
  out.height = size
  const outCtx = out.getContext('2d')!

  if (W === H) {
    outCtx.drawImage(img, 0, 0)
    return out.toDataURL('image/jpeg', 0.92)
  }

  // Downscale for fast analysis (max 150px on longer axis)
  const ANALYSIS_MAX = 150
  const scale = ANALYSIS_MAX / Math.max(W, H)
  const aW = Math.round(W * scale)
  const aH = Math.round(H * scale)
  const aCanvas = document.createElement('canvas')
  aCanvas.width = aW
  aCanvas.height = aH
  const aCtx = aCanvas.getContext('2d')!
  aCtx.drawImage(img, 0, 0, aW, aH)

  const scaledSize = Math.round(size * scale)
  const STEPS = 24
  let bestOffset = 0
  let bestVariance = -1

  if (W > H) {
    // Slide window horizontally
    const maxX = aW - scaledSize
    for (let s = 0; s <= STEPS; s++) {
      const x = Math.round((s / STEPS) * maxX)
      const { variance } = analyzeBlock(
        aCtx.getImageData(x, 0, scaledSize, aH).data,
        scaledSize * aH * 4,
      )
      if (variance > bestVariance) {
        bestVariance = variance
        bestOffset = x
      }
    }
    const ax = Math.round(bestOffset / scale)
    outCtx.drawImage(img, ax, 0, size, size, 0, 0, size, size)
  } else {
    // Slide window vertically
    const maxY = aH - scaledSize
    for (let s = 0; s <= STEPS; s++) {
      const y = Math.round((s / STEPS) * maxY)
      const { variance } = analyzeBlock(
        aCtx.getImageData(0, y, aW, scaledSize).data,
        aW * scaledSize * 4,
      )
      if (variance > bestVariance) {
        bestVariance = variance
        bestOffset = y
      }
    }
    const ay = Math.round(bestOffset / scale)
    outCtx.drawImage(img, 0, ay, size, size, 0, 0, size, size)
  }

  return out.toDataURL('image/jpeg', 0.92)
}

export interface TextPlacement {
  /** Horizontal center position as percentage (0–100) */
  x: number
  /** Vertical center position as percentage (0–100) */
  y: number
  /** 0 = black text, 255 = white text */
  gray: number
}

/**
 * Analyze a (square) image and find the best region to overlay vertical haiku text.
 *
 * Strategy:
 *  1. Divide the image into a 6×6 grid of blocks.
 *  2. For each column, compute the total brightness variance of all its blocks.
 *  3. The column with the lowest total variance is the "flattest" strip.
 *  4. Within that column, pick the row block with the lowest variance.
 *  5. Return the center (x, y) of that block as percentages.
 *  6. Derive text color from the mean brightness of that region.
 */
export async function findBestTextPlacement(dataUrl: string): Promise<TextPlacement> {
  const img = await loadImage(dataUrl)

  const SIZE = 120 // analyze at 120×120 for speed
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, SIZE, SIZE)

  const COLS = 6
  const ROWS = 6
  const bW = Math.floor(SIZE / COLS)
  const bH = Math.floor(SIZE / ROWS)

  // Step 1: Find flattest column (lowest sum-of-variances across rows)
  let bestCol = COLS - 1
  let bestColScore = Infinity
  for (let col = 0; col < COLS; col++) {
    let colScore = 0
    for (let row = 0; row < ROWS; row++) {
      const imgData = ctx.getImageData(col * bW, row * bH, bW, bH)
      colScore += analyzeBlock(imgData.data, imgData.data.length).variance
    }
    if (colScore < bestColScore) {
      bestColScore = colScore
      bestCol = col
    }
  }

  // Step 2: Within best column, find flattest row block
  let bestRow = Math.floor(ROWS / 2)
  let bestRowVariance = Infinity
  let bestMean = 0.5
  for (let row = 0; row < ROWS; row++) {
    const imgData = ctx.getImageData(bestCol * bW, row * bH, bW, bH)
    const { variance, mean } = analyzeBlock(imgData.data, imgData.data.length)
    if (variance < bestRowVariance) {
      bestRowVariance = variance
      bestRow = row
      bestMean = mean
    }
  }

  // Center of best block in percentage.
  // Stagger offsets extend DOWNWARD only ([0, 1.2, 2.4]em), so:
  //   - top margin: half text-block height ≈ 18%
  //   - bottom margin: half + stagger extra ≈ 35% from bottom → y ≤ 65%
  //   - horizontal: 3 columns ≈ 20% width → x: 20–80%
  const x = Math.max(20, Math.min(80, ((bestCol + 0.5) / COLS) * 100))
  const y = Math.max(18, Math.min(65, ((bestRow + 0.5) / ROWS) * 100))

  // Always use white text (gray=235) — film-toned images are darker,
  // and white reads universally well on the vignette/gradient overlay.
  const gray = 235

  return { x, y, gray }
}

/**
 * Apply a film-camera color grade to an image.
 *
 * Effect layers:
 *  1. CSS filter: contrast up, saturation down, slight sepia warm tone, slight darken
 *  2. Warm shadow overlay: lifts the "film" feel with a faint amber cast
 *  3. Vignette: radial gradient darkens edges for depth and helps white text pop
 *
 * Returns a JPEG DataURL. Processing happens on Canvas in ~20–50 ms.
 */
export async function applyFilmTone(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl)
  const W = img.naturalWidth
  const H = img.naturalHeight

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 1. Film-grade: boost contrast, desaturate, add warm sepia, darken slightly
  ctx.filter = 'contrast(1.14) saturate(0.72) sepia(0.20) brightness(0.87)'
  ctx.drawImage(img, 0, 0)
  ctx.filter = 'none'

  // 2. Warm amber shadow overlay (faded-film effect)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = 'rgba(20, 12, 3, 0.07)'
  ctx.fillRect(0, 0, W, H)

  // 3. Vignette: dark edges → depth + helps text legibility
  const inner = Math.min(W, H) * 0.30
  const outer = Math.max(W, H) * 0.78
  const vignette = ctx.createRadialGradient(W / 2, H / 2, inner, W / 2, H / 2, outer)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.46)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)

  return canvas.toDataURL('image/jpeg', 0.92)
}
