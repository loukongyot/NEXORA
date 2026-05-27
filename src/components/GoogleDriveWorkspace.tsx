import { ExternalLink, FilePlus2, Pin, Star } from 'lucide-react'
import type { GoogleWorkspaceData } from '../services/googleWorkspaceService'
import {
  getGoogleFileTypeLabel,
  type GoogleDriveFileMetadata,
} from '../services/googleDriveService'
import { SectionHeader } from './SectionHeader'

type GoogleDriveWorkspaceProps = {
  data: GoogleWorkspaceData | null
  onAttachFile: (file: GoogleDriveFileMetadata) => void
  onImportLinks: () => void
  onOpenPicker: () => void
  onPinFile: (file: GoogleDriveFileMetadata) => void
  onSaveFavorite: (file: GoogleDriveFileMetadata) => void
}

function formatRelativeTime(date?: string) {
  if (!date) return '-'

  const elapsedMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(date).getTime()) / 60000),
  )

  if (elapsedMinutes < 1) return 'เมื่อสักครู่'
  if (elapsedMinutes < 60) return `${elapsedMinutes} นาทีที่แล้ว`
  if (elapsedMinutes < 1440) return 'วันนี้'
  if (elapsedMinutes < 2880) return 'เมื่อวาน'

  return `${Math.round(elapsedMinutes / 1440)} วันที่แล้ว`
}

export function GoogleDriveWorkspace({
  data,
  onAttachFile,
  onImportLinks,
  onOpenPicker,
  onPinFile,
  onSaveFavorite,
}: GoogleDriveWorkspaceProps) {
  const files = data?.latestFiles ?? []
  const suggestedCollections = [
    'รายงานประจำวัน',
    'ระบบนักเรียน',
    'ระบบรับสมัคร',
    'AI Tools',
    'Output Files',
  ]

  return (
    <section className="mt-7">
      <SectionHeader
        action="Picker foundation"
        eyebrow="Google Drive"
        title="Google Drive Workspace"
      />
      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              ฐานสำหรับ Drive file picker ในอนาคต ตอนนี้รองรับ link detection และแนบไฟล์จากข้อมูล Apps Script/cache
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedCollections.map((collection) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-400"
                  key={collection}
                >
                  {collection}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-3 text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20"
              onClick={onOpenPicker}
              type="button"
            >
              <FilePlus2 size={17} />
              Drive Picker
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f05193]/30 bg-[#f05193]/15 px-4 py-3 text-sm font-semibold text-[#ffd1e4] transition hover:bg-[#f05193]/20"
              onClick={onImportLinks}
              type="button"
            >
              <FilePlus2 size={17} />
              Import links
            </button>
          </div>
        </div>

        {files.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {files.slice(0, 6).map((file) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-[#009FD1]/30 hover:bg-white/[0.08]"
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
                      {getGoogleFileTypeLabel(file.type)} - {file.source}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      อัปเดต {formatRelativeTime(file.modifiedAt)}
                    </p>
                  </div>
                  <a
                    aria-label="Open file"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-[#70dfff]"
                    href={file.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    className="rounded-xl border border-[#009FD1]/25 bg-[#009FD1]/12 px-3 py-2 text-left text-xs font-semibold text-[#70dfff]"
                    onClick={() => onAttachFile(file)}
                    type="button"
                  >
                    Attach to Workspace
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-slate-300"
                      onClick={() => onSaveFavorite(file)}
                      type="button"
                    >
                      <Star size={14} />
                      Favorite
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-slate-300"
                      onClick={() => onPinFile(file)}
                      type="button"
                    >
                      <Pin size={14} />
                      Pin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
            ยังไม่มีไฟล์ล่าสุดจาก Google Drive วางลิงก์หรือเชื่อม Apps Script
            เพื่อให้ NEXORA จัดหมวดหมู่ให้อัตโนมัติ
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-slate-400">
          สถานะ Google Picker: ยังไม่ได้เชื่อม OAuth / Picker API
        </div>
      </div>
    </section>
  )
}
