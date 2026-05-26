import type { QuickAction } from '../data/dashboardData'

const actionClasses = {
  pink: 'border-[#f05193]/25 bg-[#f05193]/10 text-[#ffd1e4]',
  blue: 'border-[#009FD1]/25 bg-[#009FD1]/10 text-[#70dfff]',
  purple: 'border-[#6b5095]/35 bg-[#6b5095]/15 text-[#d9c7ff]',
  brown: 'border-[#ba5835]/30 bg-[#ba5835]/12 text-[#ffb08d]',
}

type QuickActionButtonProps = {
  action: QuickAction
  onClick?: () => void
}

export function QuickActionButton({ action, onClick }: QuickActionButtonProps) {
  const Icon = action.icon

  return (
    <button
      className="group flex min-h-28 items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.075] p-4 text-left shadow-2xl shadow-black/20 backdrop-blur-2xl transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.1] hover:shadow-[#009FD1]/10"
      onClick={onClick}
      type="button"
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${actionClasses[action.accent]}`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">
          {action.label}
        </span>
        <span className="mt-1 block text-sm leading-5 text-slate-400">
          {action.description}
        </span>
      </span>
    </button>
  )
}
