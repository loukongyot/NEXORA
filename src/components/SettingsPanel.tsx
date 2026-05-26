import { Cloud, Download, Link, RotateCcw, Upload } from 'lucide-react'
import type { CloudSyncStatus } from '../lib/supabase'

type SettingsPanelProps = {
  cloudSyncStatus: CloudSyncStatus
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
  onSyncCloudToLocal: () => void
  onSyncLocalToCloud: () => void
  onThemeChange: (theme: string) => void
  theme: string
}

export function SettingsPanel({
  cloudSyncStatus,
  checklist,
  onClearRecent,
  onExport,
  onImport,
  onImportStarterLinks,
  onReset,
  onSyncCloudToLocal,
  onSyncLocalToCloud,
  onThemeChange,
  theme,
}: SettingsPanelProps) {
  const checklistItems = [
    ['Add first real system', checklist.hasRealSystem],
    ['Create backup', checklist.backupCreated],
    ['Install app', checklist.isInstallable],
    ['Test mobile launch', checklist.mobileReady],
    ['Export workspace', checklist.backupCreated],
  ] as const
  const isCloudConnected = cloudSyncStatus === 'connected'

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Control Center
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white">
          Settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Manage local workspace data, backups, recent activity, and future theme
          options.
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
          Clear recent activity
        </button>

        <button
          className="rounded-2xl border border-[#ba5835]/30 bg-[#ba5835]/12 p-4 text-left text-sm font-semibold text-[#ffb08d] transition hover:bg-[#ba5835]/18"
          onClick={onReset}
          type="button"
        >
          Reset workspace
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
        <p className="text-sm font-semibold text-white">Theme System</p>
        <p className="mt-1 text-sm text-slate-400">
          Switch the local visual atmosphere while preserving the NEXORA layout.
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
          Cloud Foundation
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-white">
              Supabase connection
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Cloud sync is prepared while localStorage remains the active daily
              fallback.
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
            Cloud Sync: {isCloudConnected ? 'Connected' : 'Offline / Local Mode'}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 p-4 text-left text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20"
            onClick={onSyncLocalToCloud}
            type="button"
          >
            Sync local data to cloud
          </button>
          <button
            className="rounded-2xl border border-[#6b5095]/35 bg-[#6b5095]/15 p-4 text-left text-sm font-semibold text-[#d9c7ff] transition hover:bg-[#6b5095]/20"
            onClick={onSyncCloudToLocal}
            type="button"
          >
            Sync cloud data to local
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
          Migration
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          Import Starter Workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Paste one link per line. NEXORA will auto-detect Google Forms,
          Sheets, Drive folders, Slides, and Apps Script links where possible.
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
          Import links
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Production Checklist
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          Daily-use readiness
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
                {done ? 'Ready' : 'Todo'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
