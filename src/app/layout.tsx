import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Noto_Serif_JP, Klee_One, Zen_Maru_Gothic } from 'next/font/google'
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

// ── 夕すがら手書きフォント（セルフホスト）───────────────────────────
const yosugaraFont = localFont({
  src: './fonts/yosugaraver1_2.ttf',
  variable: '--font-yusei',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '詠みびとしらず',
  description: 'あなたの写真とAIのことばで、今日を切り取る。',
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
        className={`${kleeOne.variable} ${zenMaruGothic.variable} ${notoSerifJP.variable} ${yosugaraFont.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}

