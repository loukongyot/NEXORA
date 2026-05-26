import { Clock3, FileStack, RefreshCw, Sheet, Sparkles } from 'lucide-react'
import type {
  GoogleWorkspaceData,
  GoogleWorkspaceStatus,
} from '../services/googleWorkspaceService'
import { SectionHeader } from './SectionHeader'

type GoogleWorkspaceWidgetProps = {
  data: GoogleWorkspaceData | null
  onRefresh: () => void
  status: GoogleWorkspaceStatus
}

const statusLabel: Record<GoogleWorkspaceStatus, string> = {
  connected: 'เชื่อมต่อสำเร็จ',
  empty: 'ยังไม่มีข้อมูล',
  error: 'เชื่อมต่อไม่สำเร็จ',
  loading: 'กำลังโหลด',
  'missing-url': 'ยังไม่ได้เชื่อมต่อ',
}

export function GoogleWorkspaceWidget({
  data,
  onRefresh,
  status,
}: GoogleWorkspaceWidgetProps) {
  const widgets = [
    {
      icon: Sparkles,
      label: 'จำนวนผู้ตอบฟอร์มวันนี้',
      value: data?.formResponsesToday ?? 0,
    },
    {
      icon: Sheet,
      label: 'ยอดรายงานล่าสุด',
      value: data?.latestReportTotal ?? 0,
    },
    {
      icon: FileStack,
      label: 'จำนวนไฟล์ Output',
      value: data?.outputFileCount ?? 0,
    },
    {
      icon: Clock3,
      label: 'อัปเดตล่าสุด',
      value: data?.updatedAt
        ? new Intl.DateTimeFormat('th-TH', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(data.updatedAt))
        : '-',
    },
  ]

  return (
    <section className="mt-7">
      <SectionHeader
        action={statusLabel[status]}
        eyebrow="Google Workspace"
        title="ข้อมูลจาก Google Workspace"
      />
      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            ดึงข้อมูลจริงจาก Apps Script Web App API เมื่อเชื่อมต่อ URL แล้ว
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-2 text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw
              className={status === 'loading' ? 'animate-spin' : ''}
              size={16}
            />
            รีเฟรช
          </button>
        </div>

        {status === 'loading' ? (
          <div className="grid gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]"
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
                  <Icon className="text-[#70dfff]" size={18} />
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
            VITE_GOOGLE_WORKSPACE_API_URL เพื่อเริ่มใช้งาน
          </p>
        ) : null}

        {status === 'error' ? (
          <div className="mt-4 rounded-2xl border border-[#ba5835]/30 bg-[#ba5835]/12 p-4 text-sm text-[#ffb08d]">
            <p>
              เชื่อมต่อ Google Workspace ไม่สำเร็จ ตรวจสอบ Web App URL,
              สิทธิ์ Anyone with the link และรูปแบบ JSON
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

        {status === 'empty' ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
            เชื่อมต่อสำเร็จ แต่ยังไม่มีข้อมูลล่าสุดจาก Apps Script
          </p>
        ) : null}

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-white">อัปเดตล่าสุด</p>
          {data?.latestUpdates?.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {data.latestUpdates.slice(0, 4).map((update) => (
                <li key={update}>{update}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              ยังไม่มีรายการอัปเดตล่าสุด
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
