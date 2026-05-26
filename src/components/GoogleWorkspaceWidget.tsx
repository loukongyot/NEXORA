import {
  Activity,
  Clock3,
  ExternalLink,
  FileStack,
  RefreshCw,
  Sheet,
  Sparkles,
} from 'lucide-react'
import type {
  GoogleRealtimeStatus,
  GoogleWorkspaceData,
  GoogleWorkspaceStatus,
} from '../services/googleWorkspaceService'
import { getGoogleFileTypeLabel } from '../services/googleDriveService'
import { SectionHeader } from './SectionHeader'

type GoogleWorkspaceWidgetProps = {
  data: GoogleWorkspaceData | null
  onRefresh: () => void
  realtimeStatus: GoogleRealtimeStatus
  status: GoogleWorkspaceStatus
}

const statusLabel: Record<GoogleWorkspaceStatus, string> = {
  connected: 'เชื่อมต่อสำเร็จ',
  empty: 'ยังไม่มีข้อมูล',
  error: 'เชื่อมต่อไม่สำเร็จ',
  loading: 'กำลังโหลด',
  'missing-url': 'ยังไม่ได้เชื่อมต่อ',
}

const realtimeLabel: Record<GoogleRealtimeStatus, string> = {
  failed: 'Failed',
  fetching: 'Fetching',
  stale: 'Stale Cache',
  synced: 'Live Synced',
}

function formatThaiDate(date?: string) {
  if (!date) {
    return '-'
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

function formatRelativeTime(date?: string) {
  if (!date) return '-'

  const now = Date.now()
  const value = new Date(date).getTime()
  const diffMinutes = Math.max(0, Math.round((now - value) / 60000))

  if (diffMinutes < 1) return 'เมื่อสักครู่'
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`

  const diffDays = Math.floor(diffMinutes / 1440)
  if (diffDays === 0) return 'วันนี้'
  if (diffDays === 1) return 'เมื่อวาน'

  return `${diffDays} วันที่แล้ว`
}

export function GoogleWorkspaceWidget({
  data,
  onRefresh,
  realtimeStatus,
  status,
}: GoogleWorkspaceWidgetProps) {
  const widgets = [
    {
      icon: Sparkles,
      label: 'ผู้ตอบฟอร์มวันนี้',
      source: 'Google Forms',
      value: data?.formResponsesToday ?? 0,
    },
    {
      icon: Sheet,
      label: 'รายงานล่าสุด',
      source: 'Google Sheets',
      value: data?.latestReportTotal ?? 0,
    },
    {
      icon: FileStack,
      label: 'ไฟล์ Output',
      source: 'Google Drive',
      value: data?.outputFileCount ?? 0,
    },
    {
      icon: Clock3,
      label: 'อัปเดตล่าสุด',
      source: data?.source === 'cache' ? 'Local cache' : 'Live API',
      value: data?.updatedAt ? formatRelativeTime(data.updatedAt) : '-',
    },
  ]
  const isLoading = status === 'loading' || realtimeStatus === 'fetching'

  return (
    <section className="mt-7">
      <SectionHeader
        action={statusLabel[status]}
        eyebrow="Live Google Workspace"
        title="ข้อมูลจริงจาก Google Workspace"
      />
      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Dashboard สดจาก Apps Script Web App API พร้อม cache fallback เมื่อ API ใช้งานไม่ได้
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  realtimeStatus === 'synced'
                    ? 'border-[#009FD1]/30 bg-[#009FD1]/15 text-[#70dfff]'
                    : realtimeStatus === 'stale'
                      ? 'border-[#f05193]/30 bg-[#f05193]/15 text-[#ffd1e4]'
                      : realtimeStatus === 'failed'
                        ? 'border-[#ba5835]/30 bg-[#ba5835]/15 text-[#ffb08d]'
                        : 'border-white/10 bg-white/[0.06] text-slate-300'
                }`}
              >
                {realtimeLabel[realtimeStatus]}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-400">
                Last sync: {formatThaiDate(data?.updatedAt)}
              </span>
              <span className="rounded-full border border-[#009FD1]/25 bg-[#009FD1]/10 px-3 py-1 text-xs font-semibold text-[#70dfff]">
                Source: {data?.source === 'cache' ? 'Local cache' : 'Cloud live'}
              </span>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-2 text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            Refresh all
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]"
                key={item}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {widgets.map((widget) => {
              const Icon = widget.icon

              return (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  key={widget.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="text-[#70dfff]" size={18} />
                    <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-slate-400">
                      {widget.source}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {widget.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{widget.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {status === 'missing-url' ? (
          <p className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
            ยังไม่ได้เชื่อมต่อ Google Workspace API URL ตั้งค่า
            VITE_GOOGLE_WORKSPACE_API_URL เพื่อเริ่มใช้งานข้อมูลจริง
          </p>
        ) : null}

        {status === 'error' || realtimeStatus === 'failed' ? (
          <div className="mt-4 rounded-2xl border border-[#ba5835]/30 bg-[#ba5835]/12 p-4 text-sm text-[#ffb08d]">
            <p>
              เชื่อมต่อ Google Workspace ไม่สำเร็จ ระบบจะไม่ทำให้หน้าเว็บล่ม
              และจะใช้ cache ล่าสุดถ้ามี
            </p>
            <button
              className="mt-3 rounded-xl border border-[#ba5835]/30 bg-[#ba5835]/15 px-3 py-2 text-xs font-semibold"
              onClick={onRefresh}
              type="button"
            >
              ลองใหม่
            </button>
          </div>
        ) : null}

        {status === 'empty' && realtimeStatus !== 'stale' ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
            เชื่อมต่อสำเร็จ แต่ยังไม่มีข้อมูลล่าสุดจาก Apps Script
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-2">
              <Activity className="text-[#d9c7ff]" size={18} />
              <p className="text-sm font-semibold text-white">
                อัปเดตล่าสุด
              </p>
            </div>
            {data?.latestUpdates?.length ? (
              <div className="mt-3 space-y-2">
                {data.latestUpdates.slice(0, 5).map((update) => (
                  <div
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2"
                    key={update.id}
                  >
                    <p className="text-sm font-medium text-slate-200">
                      {update.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {update.source} - {formatRelativeTime(update.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                ยังไม่มี activity timeline จาก Google Workspace
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-2">
              <FileStack className="text-[#70dfff]" size={18} />
              <p className="text-sm font-semibold text-white">ไฟล์ล่าสุด</p>
            </div>
            {data?.latestFiles?.length ? (
              <div className="mt-3 space-y-2">
                {data.latestFiles.slice(0, 5).map((file) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2"
                    key={file.id}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-200">
                        {file.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {getGoogleFileTypeLabel(file.type)} - {formatRelativeTime(file.modifiedAt)}
                      </span>
                    </span>
                    <a
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-[#70dfff]"
                      href={file.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                ยังไม่มีไฟล์ล่าสุดจาก Apps Script
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
