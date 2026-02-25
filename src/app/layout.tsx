import type { Metadata } from 'next'
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
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}

