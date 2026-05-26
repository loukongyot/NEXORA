import { Sparkles, X } from 'lucide-react'
import type { WorkspaceTemplateName } from './TemplatePanel'

type OnboardingFlowProps = {
  onAddSystem: () => void
  onApplyTemplate: (template: WorkspaceTemplateName) => void
  onClose: () => void
}

export function OnboardingFlow({
  onAddSystem,
  onApplyTemplate,
  onClose,
}: OnboardingFlowProps) {
  return (
    <div className="fixed inset-0 z-[96] grid place-items-end bg-[#020617]/80 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <div className="w-full max-w-3xl rounded-t-3xl border border-white/10 bg-[#0f172a]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Welcome
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">
              Build your NEXORA workspace
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Start with one real link, or generate a ready-made setup for daily
              reports, students, admissions, AI, or LINE automation.
            </p>
          </div>
          <button
            aria-label="Close onboarding"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-300"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {(['Daily Report', 'Student System', 'AI Toolkit'] as WorkspaceTemplateName[]).map(
            (template) => (
              <button
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-left transition hover:border-[#009FD1]/35 hover:bg-white/[0.1]"
                key={template}
                onClick={() => {
                  onApplyTemplate(template)
                  onClose()
                }}
                type="button"
              >
                <Sparkles className="text-[#70dfff]" size={19} />
                <span className="mt-3 block text-sm font-semibold text-white">
                  {template}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">
                  Generate starter systems and notes.
                </span>
              </button>
            ),
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-5 py-3 text-sm font-semibold text-[#70dfff]"
            onClick={() => {
              onAddSystem()
              onClose()
            }}
            type="button"
          >
            Create first system
          </button>
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-slate-300"
            onClick={onClose}
            type="button"
          >
            Explore dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
