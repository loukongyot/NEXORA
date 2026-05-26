import { Bot, FileText, FolderPlus, Lightbulb, Plus } from 'lucide-react'
import { useState } from 'react'

type FloatingCreateButtonProps = {
  onNewAiPrompt: () => void
  onNewCollection: () => void
  onNewNote: () => void
  onNewSystem: () => void
}

export function FloatingCreateButton({
  onNewAiPrompt,
  onNewCollection,
  onNewNote,
  onNewSystem,
}: FloatingCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const actions = [
    { label: 'New System', icon: Plus, onClick: onNewSystem },
    { label: 'New Collection', icon: FolderPlus, onClick: onNewCollection },
    { label: 'New AI Prompt', icon: Bot, onClick: onNewAiPrompt },
    { label: 'New Workspace Note', icon: FileText, onClick: onNewNote },
  ]

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3 lg:bottom-6">
      {isOpen ? (
        <div className="w-64 rounded-3xl border border-white/10 bg-[#0f172a]/90 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                key={action.label}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                type="button"
              >
                <Icon size={17} className="text-[#70dfff]" />
                {action.label}
              </button>
            )
          })}
        </div>
      ) : null}
      <button
        aria-label="Create workspace item"
        className="grid h-14 w-14 place-items-center rounded-2xl border border-[#f05193]/35 bg-[#f05193]/25 text-[#ffd1e4] shadow-2xl shadow-[#f05193]/20 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-[#f05193]/30"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Lightbulb size={23} />
      </button>
    </div>
  )
}
