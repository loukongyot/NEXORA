import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type {
  WorkspaceCategory,
  WorkspaceCollection,
  WorkspaceSystem,
} from '../types/workspace'

type CommandItem = {
  group: string
  id: string
  label: string
  meta: string
  run: () => void
}

type CommandPaletteProps = {
  categories: WorkspaceCategory[]
  collections: WorkspaceCollection[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (view: string) => void
  onNewCollection: () => void
  onNewNote: () => void
  onNewSystem: () => void
  onOpenSystem: (system: WorkspaceSystem) => void
  systems: WorkspaceSystem[]
}

export function CommandPalette({
  categories,
  collections,
  isOpen,
  onClose,
  onNavigate,
  onNewCollection,
  onNewNote,
  onNewSystem,
  onOpenSystem,
  systems,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const commands = useMemo<CommandItem[]>(() => {
    const actionItems: CommandItem[] = [
      { group: 'Actions', id: 'new-system', label: 'เพิ่มระบบ', meta: 'Create', run: onNewSystem },
      { group: 'Actions', id: 'new-collection', label: 'เพิ่มกลุ่มงาน', meta: 'Create', run: onNewCollection },
      { group: 'Actions', id: 'new-note', label: 'เพิ่ม Workspace Note', meta: 'Create', run: onNewNote },
      { group: 'Actions', id: 'dashboard', label: 'เปิดแดชบอร์ด', meta: 'Navigate', run: () => onNavigate('Dashboard') },
      { group: 'Actions', id: 'favorites', label: 'เปิด Starred', meta: 'Navigate', run: () => onNavigate('Favorites') },
    ]
    const systemItems = systems.map((system) => ({
      group: 'Systems',
      id: system.id,
      label: system.name,
      meta: `${system.category}${system.tags.length ? ` - ${system.tags.join(', ')}` : ''}`,
      run: () => onOpenSystem(system),
    }))
    const collectionItems = collections.map((collection) => ({
      group: 'กลุ่มงาน',
      id: collection.id,
      label: collection.name,
      meta: 'Collection',
      run: () => onNavigate('Dashboard'),
    }))
    const categoryItems = categories.map((category) => ({
      group: 'Categories',
      id: category,
      label: category,
      meta: 'Category',
      run: () => onNavigate(category),
    }))

    return [...actionItems, ...systemItems, ...collectionItems, ...categoryItems]
  }, [
    categories,
    collections,
    onNavigate,
    onNewCollection,
    onNewNote,
    onNewSystem,
    onOpenSystem,
    systems,
  ])

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return commands.slice(0, 12)
    }
    return commands
      .filter((command) =>
        `${command.label} ${command.meta} ${command.group}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 12)
  }, [commands, query])

  if (!isOpen) {
    return null
  }

  function runCommand(command: CommandItem) {
    command.run()
    onClose()
    setQuery('')
    setActiveIndex(0)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) =>
        Math.min(current + 1, filteredCommands.length - 1),
      )
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const command = filteredCommands[activeIndex]
      if (command) {
        runCommand(command)
      }
    }
    if (event.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[95] bg-[#020617]/75 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Search className="text-[#70dfff]" size={19} />
          <input
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาระบบ กลุ่มงาน หมวด หรือ action..."
            value={query}
          />
          <button
            aria-label="Close command palette"
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {filteredCommands.length ? (
            filteredCommands.map((command, index) => (
              <button
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  index === activeIndex
                    ? 'border border-[#009FD1]/30 bg-[#009FD1]/15'
                    : 'border border-transparent hover:bg-white/[0.06]'
                }`}
                key={`${command.group}-${command.id}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runCommand(command)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-semibold text-white">
                    {command.label}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {command.group} - {command.meta}
                  </span>
                </span>
                <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-slate-400">
                  Enter
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
              ไม่พบ command
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
