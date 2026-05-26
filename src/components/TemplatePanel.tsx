import { Layers } from 'lucide-react'

export type WorkspaceTemplateName =
  | 'Admissions'
  | 'AI Toolkit'
  | 'Custom Workspace'
  | 'Daily Report'
  | 'LINE Automation'
  | 'Student System'

type TemplatePanelProps = {
  onApplyTemplate: (template: WorkspaceTemplateName) => void
}

const templates: WorkspaceTemplateName[] = [
  'Daily Report',
  'Student System',
  'Admissions',
  'AI Toolkit',
  'LINE Automation',
  'Custom Workspace',
]

export function TemplatePanel({ onApplyTemplate }: TemplatePanelProps) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
          Smart Templates
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          Prebuilt Workspaces
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <button
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.075] p-4 text-left shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-[#009FD1]/35 hover:bg-white/[0.1]"
            key={template}
            onClick={() => onApplyTemplate(template)}
            type="button"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#009FD1]/25 bg-[#009FD1]/10 text-[#70dfff]">
              <Layers size={19} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">
                {template}
              </span>
              <span className="mt-1 block text-sm leading-5 text-slate-400">
                Generate a starter set of systems and notes.
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
