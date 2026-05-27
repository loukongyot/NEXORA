import { Activity, AlertTriangle, CheckCircle2, PlayCircle, XCircle } from 'lucide-react'
import type { QaReport, QaStatus } from '../services/qaService'

type QaDashboardProps = {
  isRunning: boolean
  onRun: () => void
  progress: number
  report: QaReport | null
}

const statusStyle: Record<QaStatus, string> = {
  failed: 'border-[#ba5835]/30 bg-[#ba5835]/12 text-[#ffb08d]',
  passed: 'border-[#009FD1]/30 bg-[#009FD1]/12 text-[#70dfff]',
  warning: 'border-[#f05193]/30 bg-[#f05193]/12 text-[#ffd1e4]',
}

const statusIcon = {
  failed: XCircle,
  passed: CheckCircle2,
  warning: AlertTriangle,
}

export function QaDashboard({
  isRunning,
  onRun,
  progress,
  report,
}: QaDashboardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
            Production QA
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white">
            ระบบตรวจสอบการใช้งานจริง
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            ตรวจ Cloud Sync, Google API, localStorage, PWA, asset loading, mobile layout และ Drive link import แบบไม่เปิดเผย secret
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/15 px-4 py-3 text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/20 disabled:cursor-wait disabled:opacity-60"
          disabled={isRunning}
          onClick={onRun}
          type="button"
        >
          <PlayCircle size={17} />
          {isRunning ? 'กำลังตรวจ QA...' : 'Run Full QA'}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f05193] via-[#009FD1] to-[#6b5095] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {report ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {report.checks.map((check) => {
              const Icon = statusIcon[check.status]

              return (
                <div
                  className={`rounded-2xl border p-4 ${statusStyle[check.status]}`}
                  key={check.name}
                >
                  <Icon size={18} />
                  <p className="mt-3 text-sm font-semibold text-white">
                    {check.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {check.detail}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {check.status} - {check.durationMs}ms
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2">
                <Activity className="text-[#70dfff]" size={18} />
                <p className="text-sm font-semibold text-white">
                  Runtime Monitoring
                </p>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                <span>Failed fetch: {report.metrics.failedFetchCount}</span>
                <span>Sync failures: {report.metrics.syncFailureCount}</span>
                <span>API latency: {report.metrics.apiLatencyMs}ms</span>
                <span>Cache restores: {report.metrics.cacheRestoreCount}</span>
                <span>Browser: {report.device.browser}</span>
                <span>OS: {report.device.os}</span>
                <span>Screen: {report.device.screenSize}</span>
                <span>Viewport: {report.device.viewport}</span>
                <span>PWA: {report.device.pwaMode}</span>
                <span>Online: {String(report.device.online)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-sm font-semibold text-white">
                Production Recommendations
              </p>
              <div className="mt-3 space-y-2">
                {report.recommendations.map((recommendation) => (
                  <p
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300"
                    key={recommendation}
                  >
                    {recommendation}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm font-semibold text-white">
              Detailed Error Logs
            </p>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto text-xs text-slate-400">
              {report.checks.flatMap((check) =>
                check.logs.map((log) => (
                  <p
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
                    key={`${check.name}-${log}`}
                  >
                    {check.name}: {log}
                  </p>
                )),
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Last QA run: {new Intl.DateTimeFormat('th-TH', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(report.finishedAt))}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
          ยังไม่มีผล QA กด Run Full QA เพื่อทดสอบ production readiness
        </div>
      )}
    </div>
  )
}
