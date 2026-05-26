import { ExternalLink, Pencil, Pin, Star, Trash2 } from 'lucide-react'
import type { WorkspaceSystem } from '../types/workspace'
import { categoryIconMap } from '../utils/workspaceOptions'

const accentClasses = {
  pink: 'from-[#f05193]/35 to-[#f05193]/5 text-[#ffd1e4]',
  blue: 'from-[#009FD1]/35 to-[#009FD1]/5 text-[#70dfff]',
  purple: 'from-[#6b5095]/40 to-[#6b5095]/5 text-[#d9c7ff]',
  brown: 'from-[#ba5835]/35 to-[#ba5835]/5 text-[#ffb08d]',
}

type DashboardCardProps = {
  dragGroup?: 'favorite' | 'pinned'
  system: WorkspaceSystem
  onDelete: (id: string) => void
  onEdit: (system: WorkspaceSystem) => void
  onInspect: (system: WorkspaceSystem) => void
  onOpen: (system: WorkspaceSystem) => void
  onToggleFavorite: (id: string) => void
  onTogglePinned: (id: string) => void
  onReorder?: (
    kind: 'favorite' | 'pinned',
    sourceId: string,
    targetId: string,
  ) => void
}

export function DashboardCard({
  dragGroup,
  system,
  onDelete,
  onEdit,
  onInspect,
  onOpen,
  onToggleFavorite,
  onTogglePinned,
  onReorder,
}: DashboardCardProps) {
  const Icon = categoryIconMap[system.category]

  return (
    <article
      className="group min-h-40 rounded-2xl border border-white/10 bg-white/[0.075] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.1]"
      draggable={Boolean(dragGroup)}
      onDragOver={(event) => {
        if (dragGroup) {
          event.preventDefault()
        }
      }}
      onDragStart={(event) => {
        if (dragGroup) {
          event.dataTransfer.setData('system-id', system.id)
        }
      }}
      onDrop={(event) => {
        const sourceId = event.dataTransfer.getData('system-id')
        if (dragGroup && sourceId && onReorder) {
          onReorder(dragGroup, sourceId, system.id)
        }
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accentClasses[system.color]}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label={`Pin ${system.name}`}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
              system.pinned
                ? 'border-[#009FD1]/35 bg-[#009FD1]/15 text-[#70dfff]'
                : 'border-white/10 bg-white/[0.06] text-slate-400 hover:text-white'
            }`}
            onClick={() => onTogglePinned(system.id)}
            type="button"
          >
            <Pin fill={system.pinned ? 'currentColor' : 'none'} size={16} />
          </button>
          <button
            aria-label={`Favorite ${system.name}`}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
              system.favorite
                ? 'border-[#f05193]/35 bg-[#f05193]/15 text-[#ffd1e4]'
                : 'border-white/10 bg-white/[0.06] text-slate-400 hover:text-white'
            }`}
            onClick={() => onToggleFavorite(system.id)}
            type="button"
          >
            <Star
              fill={system.favorite ? 'currentColor' : 'none'}
              size={16}
            />
          </button>
          <button
            aria-label={`Edit ${system.name}`}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:text-white"
            onClick={() => onEdit(system)}
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            aria-label={`Delete ${system.name}`}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:border-[#ba5835]/40 hover:text-[#ffb08d]"
            onClick={() => onDelete(system.id)}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex min-h-32 flex-col justify-between">
        <div>
          <p className={`text-xs font-semibold ${accentClasses[system.color]}`}>
            {system.category}
          </p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-normal text-white">
            {system.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
            {system.description || 'No description yet.'}
          </p>
          {system.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {system.tags.slice(0, 4).map((tag) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-slate-300"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <button
          className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-[#009FD1]/40 hover:text-white"
          onClick={() => onOpen(system)}
          type="button"
        >
          Open system
          <ExternalLink size={15} />
        </button>
        <button
          className="mt-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-left text-xs font-medium text-slate-400 transition hover:text-white"
          onClick={() => onInspect(system)}
          type="button"
        >
          View details
        </button>
        <div className="mt-4 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </div>
    </article>
  )
}
