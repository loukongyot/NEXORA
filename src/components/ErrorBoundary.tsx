import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NEXORA UI boundary caught an error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#0f172a] px-4 text-white">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.075] p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
              NEXORA Recovery
            </p>
            <h1 className="mt-3 text-2xl font-semibold">แอปหยุดทำงานชั่วคราว</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              ระบบป้องกัน white screen ทำงานแล้ว ลองรีเฟรชหน้าอีกครั้ง
              ข้อมูล localStorage จะยังอยู่เหมือนเดิม
            </p>
            <button
              className="mt-5 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-5 py-3 text-sm font-semibold text-[#70dfff]"
              onClick={() => window.location.reload()}
              type="button"
            >
              รีเฟรช NEXORA
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
