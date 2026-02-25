export type AppStep = 'upload' | 'crop' | 'generating' | 'edit'
export type PoemMode = 'haiku' | 'senryu'

export interface Post {
  id: string
  imageUrl: string          // filmTone 済み DataURL or 外部 URL
  haiku: string[]           // 3 行
  poemMode: PoemMode
  textPos: { x: number; y: number } // カードに対するパーセント
  textGray: number          // 0–255
  aspectRatio: number       // width / height
  likes: number
  timestamp: string         // 表示用文字列
  createdAt: number         // Date.now()
}

export interface HaikuResult {
  lines: [string, string, string]
  kigo: string
  season: '春' | '夏' | '秋' | '冬' | '無季'
}

export interface Filter {
  id: string
  name: string
  css: string
}
