import { Bot, Lightbulb, Newspaper, Workflow } from 'lucide-react'
import type { InsightItem, InsightKind } from '../data/insightsData'

const insightStyles: Record<
  InsightKind,
  {
    Icon: typeof Bot
    badge: string
    glow: string
    text: string
  }
> = {
  News: {
    Icon: Newspaper,
    badge: 'border-[#6b5095]/40 bg-[#6b5095]/15',
    glow: 'from-[#6b5095]/35 to-[#6b5095]/5',
    text: 'text-[#d9c7ff]',
  },
  Prompt: {
    Icon: Bot,
    badge: 'border-[#f05193]/40 bg-[#f05193]/15',
    glow: 'from-[#f05193]/35 to-[#f05193]/5',
    text: 'text-[#ffd1e4]',
  },
  Tip: {
    Icon: Lightbulb,
    badge: 'border-[#009FD1]/40 bg-[#009FD1]/15',
    glow: 'from-[#009FD1]/35 to-[#009FD1]/5',
    text: 'text-[#70dfff]',
  },
  Workflow: {
    Icon: Workflow,
    badge: 'border-[#ba5835]/40 bg-[#ba5835]/15',
    glow: 'from-[#ba5835]/35 to-[#ba5835]/5',
    text: 'text-[#ffb08d]',
  },
}

type InsightCardProps = {
  insight: InsightItem
}

export function InsightCard({ insight }: InsightCardProps) {
  const style = insightStyles[insight.kind]
  const Icon = style.Icon

  return (
    <article className="group flex min-h-56 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.075] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.1]">
      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div
            className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${style.glow} ${style.text}`}
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${style.badge} ${style.text}`}
          >
            {insight.kind}
          </span>
        </div>
        <h3 className="text-lg font-semibold tracking-normal text-white">
          {insight.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {insight.description}
        </p>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-slate-300 transition group-hover:text-white">
        {insight.action}
      </div>
    </article>
  )
}
