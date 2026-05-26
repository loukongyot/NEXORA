import { Sparkles } from 'lucide-react'

type PremiumEmptyStateProps = {
  action?: string
  message: string
  onAction?: () => void
  title: string
}

export function PremiumEmptyState({
  action,
  message,
  onAction,
  title,
}: PremiumEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.045] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#6b5095]/30 bg-[#6b5095]/15 text-[#d9c7ff]">
          <Sparkles size={20} />
        </span>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{message}</p>
          {action ? (
            <button
              className="mt-4 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-2 text-sm font-semibold text-[#70dfff]"
              onClick={onAction}
              type="button"
            >
              {action}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
