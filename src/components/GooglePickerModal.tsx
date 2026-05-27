import { ExternalLink, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  getGoogleFileTypeLabel,
  type GoogleDriveFileMetadata,
  type GoogleDriveFileType,
} from '../services/googleDriveService'
import type { GooglePickerStatus } from '../services/googlePickerService'

type GooglePickerModalProps = {
  files: GoogleDriveFileMetadata[]
  isOpen: boolean
  message: string
  onAttach: (file: GoogleDriveFileMetadata) => void
  onClose: () => void
  onFavorite: (file: GoogleDriveFileMetadata) => void
  onPin: (file: GoogleDriveFileMetadata) => void
  onPreparePicker: () => void
  status: GooglePickerStatus
}

const filters: Array<GoogleDriveFileType | 'all'> = [
  'all',
  'sheet',
  'form',
  'document',
  'slide',
  'folder',
  'pdf',
  'image',
]

export function GooglePickerModal({
  files,
  isOpen,
  message,
  onAttach,
  onClose,
  onFavorite,
  onPin,
  onPreparePicker,
  status,
}: GooglePickerModalProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<GoogleDriveFileType | 'all'>('all')
  const visibleFiles = useMemo(
    () =>
      files.filter((file) => {
        const matchesFilter = filter === 'all' || file.type === filter
        const matchesQuery =
          !query.trim() ||
          [file.name, file.type, file.source].join(' ').toLowerCase().includes(
            query.trim().toLowerCase(),
          )

        return matchesFilter && matchesQuery
      }),
    [files, filter, query],
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-[#020617]/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0f172a]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Google Drive Picker
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              เลือกไฟล์จาก Google Drive
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {message || 'รองรับ cached files, recent files และ future Google Picker API'}
            </p>
          </div>
          <button
            aria-label="Close picker"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-300"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-slate-400">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาไฟล์ โฟลเดอร์ หรือชนิดไฟล์..."
              value={query}
            />
          </div>
          <button
            className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-3 text-sm font-semibold text-[#70dfff] disabled:cursor-wait disabled:opacity-60"
            disabled={status === 'connecting' || status === 'loading-picker'}
            onClick={onPreparePicker}
            type="button"
          >
            {status === 'connecting' || status === 'loading-picker'
              ? 'กำลังเชื่อมต่อ...'
              : 'Connect Picker'}
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                filter === item
                  ? 'border-[#009FD1]/35 bg-[#009FD1]/15 text-[#70dfff]'
                  : 'border-white/10 bg-white/[0.06] text-slate-400'
              }`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item === 'all' ? 'ทั้งหมด' : getGoogleFileTypeLabel(item)}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {visibleFiles.map((file) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              key={file.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-xl border border-[#009FD1]/25 bg-[#009FD1]/15 px-3 py-2 text-xs font-semibold text-[#70dfff]">
                    {file.icon}
                  </span>
                  <h3 className="mt-4 truncate text-base font-semibold text-white">
                    {file.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {getGoogleFileTypeLabel(file.type)} - Owner: Google Drive
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Updated: {new Intl.DateTimeFormat('th-TH', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(file.modifiedAt))}
                  </p>
                </div>
                <a
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-[#70dfff]"
                  href={file.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  className="rounded-xl border border-[#009FD1]/25 bg-[#009FD1]/12 px-3 py-2 text-xs font-semibold text-[#70dfff]"
                  onClick={() => onAttach(file)}
                  type="button"
                >
                  Attach
                </button>
                <button
                  className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-slate-300"
                  onClick={() => onFavorite(file)}
                  type="button"
                >
                  Favorite
                </button>
                <button
                  className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-slate-300"
                  onClick={() => onPin(file)}
                  type="button"
                >
                  Pin
                </button>
              </div>
            </div>
          ))}
        </div>

        {visibleFiles.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
            ยังไม่มีไฟล์ให้เลือก ใช้ Import Google links หรือเชื่อม Google Picker API ในขั้นถัดไป
          </div>
        ) : null}
      </div>
    </div>
  )
}
