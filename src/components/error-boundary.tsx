'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * アプリ全体を包む React エラーバウンダリ。
 * レンダリング中の例外をキャッチして白画面を防ぐ。
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 本番では外部モニタリング (Sentry 等) に送るとよい
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
            >
              予期しないエラーが発生しました
            </p>
            <button
              className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm"
              style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              再試行
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
