import { Download } from 'lucide-react'

type InstallPromptProps = {
  canInstall: boolean
  isStandalone: boolean
  onInstall: () => void
}

export function InstallPrompt({
  canInstall,
  isStandalone,
  onInstall,
}: InstallPromptProps) {
  if (isStandalone) {
    return null
  }

  return (
    <div className="fixed left-4 right-4 top-24 z-40 mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0f172a]/85 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:left-auto sm:right-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Install NEXORA</p>
          <p className="text-xs text-slate-400">
            Use it as a standalone workspace app.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-3 py-2 text-xs font-semibold text-[#70dfff] disabled:opacity-50"
          disabled={!canInstall}
          onClick={onInstall}
          type="button"
        >
          <Download size={14} />
          Install
        </button>
      </div>
    </div>
  )
}
