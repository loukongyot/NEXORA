import {
  Activity,
  Cloud,
  Database,
  Download,
  HardDrive,
  Link,
  MonitorSmartphone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Upload,
  Wifi,
} from 'lucide-react'
import type { WorkspaceSyncStatus } from '../hooks/useWorkspaceSystems'
import type { CloudSyncStatus } from '../lib/supabase'
import type { GoogleWorkspaceStatus } from '../services/googleWorkspaceService'
import type { SystemHealthReport } from '../services/systemHealthService'
import type { DatabaseTestStatus } from '../services/workspaceService'

type SettingsPanelProps = {
  cloudSyncStatus: CloudSyncStatus
  databaseTestStatus: DatabaseTestStatus | null
  googleWorkspaceMessage: string
  googleWorkspaceStatus: GoogleWorkspaceStatus
  healthReport: SystemHealthReport | null
  isHealthChecking: boolean
  isSyncing: boolean
  checklist: {
    backupCreated: boolean
    hasRealSystem: boolean
    hasRecentActivity: boolean
    isInstallable: boolean
    mobileReady: boolean
  }
  onClearRecent: () => void
  onExport: () => void
  onImport: (file: File) => void
  onImportStarterLinks: (links: string) => void
  onReset: () => void
  onTestCloudDatabase: () => void
  onTestGoogleConnection: () => void
  onRunFullSystemCheck: () => void
  onSyncCloudToLocal: () => void
  onForceRefreshCloud: () => void
  onSyncLocalToCloud: () => void
  onThemeChange: (theme: string) => void
  syncMessage: string
  syncStatus: WorkspaceSyncStatus
  lastSyncedAt: string
  theme: string
}

export function SettingsPanel({
  cloudSyncStatus,
  databaseTestStatus,
  googleWorkspaceMessage,
  googleWorkspaceStatus,
  healthReport,
  isHealthChecking,
  isSyncing,
  checklist,
  onClearRecent,
  onExport,
  onImport,
  onImportStarterLinks,
  onReset,
  onRunFullSystemCheck,
  onTestCloudDatabase,
  onTestGoogleConnection,
  onSyncCloudToLocal,
  onForceRefreshCloud,
  onSyncLocalToCloud,
  onThemeChange,
  syncMessage,
  syncStatus,
  lastSyncedAt,
  theme,
}: SettingsPanelProps) {
  const checklistItems = [
    ['เพิ่มระบบจริงรายการแรก', checklist.hasRealSystem],
    ['สร้าง backup', checklist.backupCreated],
    ['ติดตั้งแอป', checklist.isInstallable],
    ['ทดสอบบนมือถือ', checklist.mobileReady],
    ['Export workspace', checklist.backupCreated],
  ] as const
  const isCloudConnected = cloudSyncStatus === 'connected'
  const syncStatusLabel: Record<WorkspaceSyncStatus, string> = {
    error: 'Error',
    offline: 'Offline',
    'local-only': 'Local Only',
    pending: 'Pending Sync',
    synced: 'Synced',
    syncing: 'Syncing',
  }
  const databaseStatusLabel =
    databaseTestStatus === 'ready'
      ? 'Database Ready'
      : databaseTestStatus === 'missing'
        ? 'Tables Missing'
        : databaseTestStatus === 'local'
          ? 'Local Mode'
          : 'Not tested'
  const googleWorkspaceStatusLabel: Record<GoogleWorkspaceStatus, string> = {
    connected: 'เชื่อมต่อแล้ว',
    empty: 'เชื่อมต่อแล้ว แต่ยังไม่มีข้อมูล',
    error: 'เชื่อมต่อไม่สำเร็จ',
    loading: 'กำลังตรวจสอบ',
    'missing-url': 'ยังไม่ได้เชื่อมต่อ',
  }
  const lastSyncedLabel = lastSyncedAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(lastSyncedAt))
    : 'Not synced yet'
  const modeLabel = {
    cloud: 'Cloud Mode',
    hybrid: 'Hybrid Mode',
    local: 'Local Mode',
    offline: 'Offline Mode',
  }[healthReport?.mode ?? 'local']
  const healthLabel = {
    error: 'Error',
    healthy: 'Healthy',
    local: 'Local Mode',
    offline: 'Offline',
    partial: 'Partial',
  }[healthReport?.overall ?? 'local']
  const diagnosticIcon = {
    'Cloud Database': Database,
    'Google Workspace': Cloud,
    'Local Storage': HardDrive,
    Network: Wifi,
    PWA: MonitorSmartphone,
    'Sync Engine': Activity,
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Real System Health
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white">
              สถานะระบบจริง
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              ตรวจสถานะจริงของ Cloud, localStorage, Google Workspace, Network และ PWA โดยไม่เปิดเผย secret keys
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-3 text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20 disabled:cursor-wait disabled:opacity-60"
            disabled={isHealthChecking}
            onClick={onRunFullSystemCheck}
            type="button"
          >
            <ShieldCheck size={17} />
            {isHealthChecking ? 'กำลังตรวจสอบ...' : 'Run Full System Check'}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['โหมดการใช้งาน', modeLabel],
            ['Supabase status', healthReport?.supabase.message ?? 'ยังไม่ได้ตรวจสอบ'],
            ['Google Workspace status', healthReport?.googleWorkspace.message ?? 'ยังไม่ได้ตรวจสอบ'],
            ['Local Storage status', healthReport?.localStorage.message ?? 'ยังไม่ได้ตรวจสอบ'],
            ['Network status', healthReport?.browserOnline ? 'Online' : 'Offline / ยังไม่ได้ตรวจ'],
            ['PWA install status', healthReport?.pwa.message ?? 'ยังไม่ได้ตรวจสอบ'],
            ['Last Sync time', lastSyncedLabel],
            [
              'Last Health Check',
              healthReport?.lastHealthCheck
                ? new Intl.DateTimeFormat('th-TH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(healthReport.lastHealthCheck))
                : 'ยังไม่ได้ตรวจสอบ',
            ],
          ].map(([label, value]) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-[#009FD1]/25 bg-[#009FD1]/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70dfff]">
              System Badge
            </p>
            <p className="mt-2 text-sm font-semibold text-white">{healthLabel}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(healthReport?.diagnostics ?? []).map((check) => {
            const Icon = diagnosticIcon[check.label as keyof typeof diagnosticIcon] ?? Activity

            return (
              <div
                className={`rounded-2xl border p-4 ${
                  check.status === 'ok'
                    ? 'border-[#009FD1]/25 bg-[#009FD1]/10'
                    : check.status === 'error'
                      ? 'border-[#ba5835]/30 bg-[#ba5835]/12'
                      : 'border-white/10 bg-white/[0.055]'
                }`}
                key={check.label}
              >
                <Icon
                  className={
                    check.status === 'ok'
                      ? 'text-[#70dfff]'
                      : check.status === 'error'
                        ? 'text-[#ffb08d]'
                        : 'text-slate-400'
                  }
                  size={18}
                />
                <p className="mt-3 text-sm font-semibold text-white">
                  {check.label}
                </p>
                <p className="mt-1 text-sm text-slate-400">{check.detail}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-white">Safe Debug</p>
          <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
            <span>Supabase env detected: {String(healthReport?.supabase.envDetected ?? false)}</span>
            <span>Table check: {String(healthReport?.supabase.tableCheck ?? false)}</span>
            <span>Google API detected: {String(healthReport?.googleWorkspace.apiUrlDetected ?? false)}</span>
            <span>Google valid JSON: {String(healthReport?.googleWorkspace.validJson ?? false)}</span>
            <span>Sync state: {syncStatus}</span>
            <span>App: {healthReport?.app.version ?? 'NEXORA HUB V1.0 Alpha'}</span>
            <span>Build date: {healthReport?.app.buildDate ?? '-'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Control Center
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white">
          ตั้งค่า
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          จัดการข้อมูล localStorage, backup, activity และการตั้งค่าการซิงก์.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-[#009FD1]/35"
          onClick={onExport}
          type="button"
        >
          <Download className="text-[#70dfff]" size={18} />
          Export workspace JSON
        </button>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-[#009FD1]/35">
          <Upload className="text-[#d9c7ff]" size={18} />
          Import workspace JSON
          <input
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                onImport(file)
              }
              event.target.value = ''
            }}
            type="file"
          />
        </label>

        <button
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-[#ba5835]/35"
          onClick={onClearRecent}
          type="button"
        >
          <RotateCcw className="text-[#ffb08d]" size={18} />
          ล้างการใช้งานล่าสุด
        </button>

        <button
          className="rounded-2xl border border-[#ba5835]/30 bg-[#ba5835]/12 p-4 text-left text-sm font-semibold text-[#ffb08d] transition hover:bg-[#ba5835]/18"
          onClick={onReset}
          type="button"
        >
          รีเซ็ต workspace
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
        <p className="text-sm font-semibold text-white">Theme System</p>
        <p className="mt-1 text-sm text-slate-400">
          ปรับบรรยากาศของ UI โดยยังคง layout ของ NEXORA.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {['Dark', 'Midnight', 'Aurora', 'Neon', 'Glass Light'].map((themeName) => (
            <button
              className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                theme === themeName
                  ? 'border-[#009FD1]/40 bg-[#009FD1]/15 text-[#70dfff]'
                  : 'border-white/10 bg-white/[0.06] text-slate-400 hover:text-white'
              }`}
              key={themeName}
              onClick={() => onThemeChange(themeName)}
              type="button"
            >
              {themeName}
            </button>
          ))}
        </div>
      </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Cloud Status
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-white">
              สถานะ Supabase
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Cloud sync is optional. localStorage remains available as the
              offline-safe fallback.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              ซิงก์ล่าสุด: {lastSyncedLabel}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              isCloudConnected
                ? 'border-[#009FD1]/35 bg-[#009FD1]/15 text-[#70dfff]'
                : 'border-white/10 bg-white/[0.06] text-slate-400'
            }`}
          >
            <Cloud size={17} />
            Cloud Sync: {syncStatusLabel[syncStatus]}
          </div>
        </div>
        {syncMessage ? (
          <p className="mt-3 text-sm text-slate-400">{syncMessage}</p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
          Sync Controls
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 p-4 text-left text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20 disabled:cursor-wait disabled:opacity-60"
            disabled={isSyncing}
            onClick={onSyncLocalToCloud}
            type="button"
          >
            {isSyncing ? 'กำลังซิงก์...' : 'Sync local data to cloud'}
          </button>
          <button
            className="rounded-2xl border border-[#6b5095]/35 bg-[#6b5095]/15 p-4 text-left text-sm font-semibold text-[#d9c7ff] transition hover:bg-[#6b5095]/20 disabled:cursor-wait disabled:opacity-60"
            disabled={isSyncing}
            onClick={onSyncCloudToLocal}
            type="button"
          >
            {isSyncing ? 'กำลังซิงก์...' : 'Sync cloud data to local'}
          </button>
          <button
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-[#009FD1]/35 disabled:cursor-wait disabled:opacity-60"
            disabled={isSyncing}
            onClick={onForceRefreshCloud}
            type="button"
          >
            <RefreshCw
              className={isSyncing ? 'animate-spin text-[#70dfff]' : 'text-[#70dfff]'}
              size={17}
            />
            Force refresh cloud workspace
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b5095]">
          Database Health
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-[#009FD1]/35"
            onClick={onTestCloudDatabase}
            type="button"
          >
            <Database className="text-[#d9c7ff]" size={18} />
            <span>
              Test Cloud Database
              <span
                className={`mt-2 block text-xs ${
                databaseTestStatus === 'ready'
                  ? 'text-[#70dfff]'
                  : databaseTestStatus === 'missing'
                    ? 'text-[#ffb08d]'
                    : 'text-slate-400'
                }`}
              >
                {databaseStatusLabel}
              </span>
            </span>
          </button>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-400">
            RLS and authentication remain disabled for this early development
            sync stage.
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Google Workspace
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-sm font-semibold text-white">
              Google Workspace API URL
            </p>
            <p
              className={`mt-2 text-sm ${
                googleWorkspaceStatus === 'connected'
                  ? 'text-[#70dfff]'
                  : googleWorkspaceStatus === 'error'
                    ? 'text-[#ffb08d]'
                    : 'text-slate-400'
              }`}
            >
              {googleWorkspaceStatusLabel[googleWorkspaceStatus]}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {googleWorkspaceMessage}
            </p>
          </div>
          <button
            className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 p-4 text-left text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20"
            onClick={onTestGoogleConnection}
            type="button"
          >
            Test Google Connection
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b5095]">
          Google Drive
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          Google Drive Integration
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          เตรียมโครงสร้างสำหรับ Drive file metadata, link detection และ Google Picker ในอนาคต โดยยังไม่ใช้ OAuth
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-semibold text-slate-300">
          สถานะ: ยังไม่ได้เชื่อม Google Drive Picker
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
          Migration Tools
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          นำเข้า Starter Workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          วางลิงก์บรรทัดละ 1 รายการ NEXORA จะตรวจจับ Google Forms, Sheets,
          Drive folders, Slides และ Apps Script ให้อัตโนมัติ.
        </p>
        <textarea
          className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#009FD1]/50"
          id="starter-links"
          placeholder="https://docs.google.com/forms/...\nhttps://docs.google.com/spreadsheets/...\nhttps://drive.google.com/drive/folders/..."
        />
        <button
          className="mt-3 flex items-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-5 py-3 text-sm font-semibold text-[#70dfff]"
          onClick={() => {
            const textarea = document.getElementById(
              'starter-links',
            ) as HTMLTextAreaElement | null
            onImportStarterLinks(textarea?.value ?? '')
            if (textarea) {
              textarea.value = ''
            }
          }}
          type="button"
        >
          <Link size={16} />
          นำเข้าลิงก์
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Production Checklist
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          ความพร้อมใช้งานประจำวัน
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {checklistItems.map(([label, done]) => (
            <div
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3"
              key={label}
            >
              <span className="text-sm font-medium text-slate-200">{label}</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  done
                    ? 'bg-[#009FD1]/15 text-[#70dfff]'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {done ? 'พร้อม' : 'รอทำ'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
