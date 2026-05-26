import { Download, Share2, X } from 'lucide-react'

type InstallPromptProps = {
  canInstall: boolean
  isDismissed: boolean
  isIos: boolean
  isStandalone: boolean
  onDismiss: () => void
  onInstall: () => void
}

export function InstallPrompt({
  canInstall,
  isDismissed,
  isIos,
  isStandalone,
  onDismiss,
  onInstall,
}: InstallPromptProps) {
  if (isStandalone || isDismissed) {
    return null
  }

  if (isIos) {
    return (
      <div className="fixed left-4 right-4 top-24 z-40 mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0f172a]/85 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:left-auto sm:right-6">
        <div className="flex items-start gap-3">
          <Share2 className="mt-0.5 shrink-0 text-[#70dfff]" size={16} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              ติดตั้งบน iPhone
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              กด Share แล้วเลือก Add to Home Screen
            </p>
          </div>
          <button
            aria-label="ปิดคำแนะนำติดตั้ง"
            className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400"
            onClick={onDismiss}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  if (!canInstall) {
    return null
  }

  return (
    <div className="fixed left-4 right-4 top-24 z-40 mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0f172a]/85 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:left-auto sm:right-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">ติดตั้ง NEXORA</p>
          <p className="text-xs text-slate-400">
            ใช้งานแบบ standalone workspace app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-3 py-2 text-xs font-semibold text-[#70dfff]"
            onClick={onInstall}
            type="button"
          >
            <Download size={14} />
            Install
          </button>
          <button
            aria-label="ปิด"
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400"
            onClick={onDismiss}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
