import { ExternalLink, X } from 'lucide-react'
import type { WorkspaceCollection, WorkspaceSystem } from '../types/workspace'

type WorkspaceDetailModalProps = {
  collections: WorkspaceCollection[]
  onEdit: (system: WorkspaceSystem) => void
  onToggleFavorite: (id: string) => void
  onTogglePinned: (id: string) => void
  onClose: () => void
  onOpen: (system: WorkspaceSystem) => void
  relatedSystems: WorkspaceSystem[]
  system: WorkspaceSystem
}

function formatDate(value?: string) {
  if (!value) {
    return 'Never'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function WorkspaceDetailModal({
  collections,
  onEdit,
  onToggleFavorite,
  onTogglePinned,
  onClose,
  onOpen,
  relatedSystems,
  system,
}: WorkspaceDetailModalProps) {
  const collection = collections.find((item) => item.id === system.collectionId)

  return (
    <div className="fixed inset-0 z-[75] grid place-items-end bg-[#020617]/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0f172a]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Workspace Detail
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white">
              {system.name}
            </h2>
          </div>
          <button
            aria-label="Close details"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-300"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-300">
          {system.description || 'ยังไม่มีคำอธิบาย'}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['หมวดหมู่', system.category],
            ['กลุ่มงาน', collection?.name ?? 'ไม่มีกลุ่มงาน'],
            ['สร้างเมื่อ', formatDate(system.createdAt)],
            ['เปิดล่าสุด', formatDate(system.openedAt)],
            ['จำนวนเปิด', String(system.openCount)],
            ['Activity', system.editedAt ? `แก้ไข ${formatDate(system.editedAt)}` : 'ยังไม่มีการแก้ไข'],
          ].map(([label, value]) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              key={label}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">URL</p>
          <p className="mt-2 break-all text-sm text-[#70dfff]">{system.url}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {system.tags.map((tag) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-300"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {system.notes || 'ยังไม่มี notes'}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Related Systems
          </p>
          <div className="mt-3 space-y-2">
            {relatedSystems.length ? (
              relatedSystems.map((item) => (
                <button
                  className="flex w-full items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2 text-left text-sm text-slate-300 hover:text-white"
                  key={item.id}
                  onClick={() => onOpen(item)}
                  type="button"
                >
                  {item.name}
                  <span className="text-xs text-slate-500">{item.category}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">ยังไม่มีระบบที่เกี่ยวข้อง</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <button
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-5 py-3 text-sm font-semibold text-[#70dfff]"
            onClick={() => onOpen(system)}
            type="button"
          >
            เปิด
            <ExternalLink size={16} />
          </button>
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-slate-300"
            onClick={() => onEdit(system)}
            type="button"
          >
            Edit
          </button>
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-slate-300"
            onClick={() => onToggleFavorite(system.id)}
            type="button"
          >
            Starred
          </button>
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-slate-300"
            onClick={() => onTogglePinned(system.id)}
            type="button"
          >
            Pin
          </button>
        </div>
      </div>
    </div>
  )
}
