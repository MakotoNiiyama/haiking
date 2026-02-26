import { describe, it, expect } from 'vitest'
import type { TextPlacement } from '../imageAnalysis'
import type { Post, PoemMode, AppStep } from '@/types'

describe('TextPlacement 型', () => {
  it('必須フィールドを満たすオブジェクトを代入できる', () => {
    const p: TextPlacement = { x: 50, y: 30, gray: 255 }
    expect(p.x).toBe(50)
    expect(p.y).toBe(30)
    expect(p.gray).toBe(255)
  })

  it('x / y はパーセント値として 0–100 の範囲が期待される', () => {
    const p: TextPlacement = { x: 0, y: 100, gray: 128 }
    expect(p.x).toBeGreaterThanOrEqual(0)
    expect(p.y).toBeLessThanOrEqual(100)
  })
})

describe('types/index.ts', () => {
  it('Post オブジェクトが正しく組み立てられる', () => {
    const post: Post = {
      id: 'test-1',
      imageUrl: 'https://example.com/img.jpg',
      haiku: ['春の朝', 'コーヒーの湯気', '漂いて'],
      poemMode: 'haiku',
      textPos: { x: 65, y: 40 },
      textGray: 255,
      aspectRatio: 1,
      likes: 0,
      timestamp: 'たった今',
      createdAt: Date.now(),
    }
    expect(post.haiku).toHaveLength(3)
    expect(post.poemMode).toBe('haiku')
    expect(post.textPos).toMatchObject({ x: 65, y: 40 })
  })

  it('PoemMode は "haiku" か "senryu" のどちらか', () => {
    const modes: PoemMode[] = ['haiku', 'senryu']
    expect(modes).toContain('haiku')
    expect(modes).toContain('senryu')
  })

  it('AppStep は想定値を含む', () => {
    const steps: AppStep[] = ['upload', 'crop', 'generating', 'edit']
    expect(steps).toHaveLength(4)
  })
})
