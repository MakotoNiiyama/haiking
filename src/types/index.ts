export type AppStep = 'upload' | 'crop' | 'generating' | 'edit'

export interface HaikuResult {
  lines: [string, string, string]
  kigo: string
  season: '春' | '夏' | '秋' | '冬'
  explanation: string
}

export interface Filter {
  id: string
  name: string
  css: string
}
