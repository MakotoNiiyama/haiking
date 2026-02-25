import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Noto_Serif_JP, Klee_One, Zen_Maru_Gothic, Yusei_Magic } from 'next/font/google'
import { Toaster } from '@/app/components/ui/sonner'
import './globals.css'

const kleeOne = Klee_One({
  variable: '--font-klee-one',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
})

const zenMaruGothic = Zen_Maru_Gothic({
  variable: '--font-zen-maru',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

const notoSerifJP = Noto_Serif_JP({
  variable: '--font-noto-serif-jp',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const yuseiMagic = Yusei_Magic({
  variable: '--font-yusei',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// ── 夕すがら手書きフォント（セルフホスト）───────────────────────────
// 1. src/app/fonts/yosugara.ttf を配置する
// 2. 下のコメントを外す
// 3. <body> classNameの yuseiMagic.variable を yosugaraFont.variable に差し替える
// ─────────────────────────────────────────────────────────
// const yosugaraFont = localFont({
//   src: './fonts/yosugara.ttf',   // .otf の場合は屢子変更
//   variable: '--font-yusei',      // 同じ変数名を別名になるのでCSS変更不要
//   display: 'swap',
// })

export const metadata: Metadata = {
  title: 'haiking — 俳句 × ハイキング',
  description: '写真をアップロードして、情景に合った俳句をAIが生成します。',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${kleeOne.variable} ${zenMaruGothic.variable} ${notoSerifJP.variable} ${yuseiMagic.variable} antialiased`}
        // ↑ 夜すがらフォント適用後はここを yosugaraFont.variable に差し替え
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}

