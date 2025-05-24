import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '吵架包赢 - 永远不输的争论神器',
  description: '输入对方的话，获得完美的反驳回复，让你在任何争论中都能占据上风！',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-wechat-background">
          {children}
        </div>
      </body>
    </html>
  )
} 