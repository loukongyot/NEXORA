import { Download, RotateCcw, Upload } from 'lucide-react'

type SettingsPanelProps = {
  onClearRecent: () => void
  onExport: () => void
  onImport: (file: File) => void
  onReset: () => void
  onThemeChange: (theme: string) => void
  theme: string
}

export function SettingsPanel({
  onClearRecent,
  onExport,
  onImport,
  onReset,
  onThemeChange,
  theme,
}: SettingsPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
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
    </section>
  )
}
