import { useEffect, useMemo, useRef, useState } from 'react'
import { CollectionPanel } from '../components/CollectionPanel'
import { CommandPalette } from '../components/CommandPalette'
import { DashboardCard } from '../components/DashboardCard'
import { FloatingCreateButton } from '../components/FloatingCreateButton'
import { InstallPrompt } from '../components/InstallPrompt'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { OnboardingFlow } from '../components/OnboardingFlow'
import { PremiumEmptyState } from '../components/PremiumEmptyState'
import { QuickActionButton } from '../components/QuickActionButton'
import { SectionHeader } from '../components/SectionHeader'
import { SettingsPanel } from '../components/SettingsPanel'
import { StatsGrid } from '../components/StatsGrid'
import { Sidebar } from '../components/Sidebar'
import { SystemModal } from '../components/SystemModal'
import { TemplatePanel } from '../components/TemplatePanel'
import type { WorkspaceTemplateName } from '../components/TemplatePanel'
import { ToastStack } from '../components/ToastStack'
import type { ToastMessage } from '../components/ToastStack'
import { Topbar } from '../components/Topbar'
import { WorkspaceDetailModal } from '../components/WorkspaceDetailModal'
import { quickActions } from '../data/dashboardData'
import { useWorkspaceSystems } from '../hooks/useWorkspaceSystems'
import type {
  WorkspaceBackup,
  WorkspaceCategory,
  WorkspaceSystem,
  WorkspaceSystemInput,
} from '../types/workspace'

const categoryViews: WorkspaceCategory[] = [
  'Forms',
  'Sheets',
  'Drive',
  'Slides',
  'Apps Script',
  'AI Tools',
]

const themeBackgrounds: Record<string, string> = {
  Aurora:
    'bg-[radial-gradient(circle_at_15%_15%,rgba(0,159,209,0.24),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(240,81,147,0.2),transparent_28%),radial-gradient(circle_at_65%_88%,rgba(107,80,149,0.28),transparent_32%)]',
  Dark:
    'bg-[radial-gradient(circle_at_16%_18%,rgba(240,81,147,0.24),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(0,159,209,0.22),transparent_28%),radial-gradient(circle_at_70%_86%,rgba(186,88,53,0.14),transparent_30%)]',
  Midnight:
    'bg-[radial-gradient(circle_at_18%_20%,rgba(0,159,209,0.18),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(107,80,149,0.22),transparent_28%),radial-gradient(circle_at_70%_90%,rgba(15,23,42,0.6),transparent_30%)]',
  Neon:
    'bg-[radial-gradient(circle_at_20%_14%,rgba(240,81,147,0.32),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(0,159,209,0.3),transparent_28%),radial-gradient(circle_at_72%_86%,rgba(186,88,53,0.2),transparent_30%)]',
  'Glass Light':
    'bg-[radial-gradient(circle_at_18%_18%,rgba(240,81,147,0.16),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(0,159,209,0.18),transparent_28%),linear-gradient(135deg,#e9f7ff,#fdf2f8_48%,#eef2ff)]',
}

export function HomeScreen() {
  const [activeView, setActiveView] = useState('Dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false)
  const [editingSystem, setEditingSystem] = useState<WorkspaceSystem | null>(
    null,
  )
  const [detailSystem, setDetailSystem] = useState<WorkspaceSystem | null>(null)
  const [createTemplate, setCreateTemplate] =
    useState<Partial<WorkspaceSystemInput> | null>(null)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(
    () => localStorage.getItem('nexora.onboarded.v1') !== 'true',
  )
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null)
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches,
  )
  const [theme, setTheme] = useState(
    () => localStorage.getItem('nexora.theme.v1') ?? 'Dark',
  )
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const toastIdRef = useRef(0)

  const {
    activeSystems,
    addCollection,
    addSystem,
    clearRecentActivity,
    clearRecentSearches,
    collections,
    commitSearch,
    deleteSystem,
    exportWorkspaceData,
    editedSystems,
    favoriteSystems,
    filteredSystems,
    importWorkspaceData,
    mostUsedSystems,
    openSystem,
    pinnedSystems,
    recentSystems,
    recentSearches,
    reorderCollections,
    reorderSystems,
    resetWorkspace,
    searchQuery,
    searchResults,
    setSearchQuery,
    systems,
    toggleFavorite,
    togglePinned,
    updateSystem,
  } = useWorkspaceSystems()

  const dailyWorkspaceSystems = filteredSystems.filter((system) =>
    ['Forms', 'Sheets', 'LINE', 'Apps Script'].includes(system.category),
  )

  const stats = [
    { label: 'Systems', tone: 'blue' as const, value: systems.length },
    { label: 'Favorites', tone: 'pink' as const, value: favoriteSystems.length },
    { label: 'Collections', tone: 'purple' as const, value: collections.length },
    { label: 'Recent', tone: 'brown' as const, value: recentSystems.length },
  ]
  const totalLaunches = systems.reduce(
    (total, system) => total + system.openCount,
    0,
  )
  const activityTrend = recentSystems.length + editedSystems.length

  useEffect(() => {
    localStorage.setItem('nexora.theme.v1', theme)
  }, [theme])

  useEffect(() => {
    function handleInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () =>
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandPaletteOpen(true)
        return
      }

      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() === 'n') {
        openAddModal()
      }
      if (event.key.toLowerCase() === 'd') {
        setActiveView('Dashboard')
      }
      if (event.key.toLowerCase() === 'f') {
        setActiveView('Favorites')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const pageSystems = useMemo(() => {
    if (categoryViews.includes(activeView as WorkspaceCategory)) {
      return filteredSystems.filter((system) => system.category === activeView)
    }

    if (activeView === 'Favorites') {
      return favoriteSystems
    }

    if (activeView === 'Recent') {
      return recentSystems
    }

    if (activeView === 'Search') {
      return filteredSystems
    }

    return activeSystems
  }, [
    activeSystems,
    activeView,
    favoriteSystems,
    filteredSystems,
    recentSystems,
  ])

  function notify(message: string) {
    toastIdRef.current += 1
    const id = `toast-${toastIdRef.current}`

    setToasts((currentToasts) => [...currentToasts, { id, message }])
    window.setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id),
      )
    }, 2600)
  }

  function openAddModal() {
    setCreateTemplate(null)
    setEditingSystem(null)
    setIsSystemModalOpen(true)
  }

  function openCreateWithTemplate(template: Partial<WorkspaceSystemInput>) {
    setEditingSystem(null)
    setCreateTemplate(template)
    setIsSystemModalOpen(true)
  }

  function openNewCollectionPrompt() {
    const name = window.prompt('Collection name')
    if (name) {
      addCollection(name)
      notify('Collection added')
    }
  }

  function openNewAiPrompt() {
    openCreateWithTemplate({
      category: 'AI Tools',
      color: 'purple',
      description: 'AI prompt workspace item.',
      favorite: true,
      name: 'New AI Prompt',
      notes: 'Prompt idea:\n\nUse case:\n\nNext action:',
      pinned: true,
      tags: ['AI', 'Active'],
      url: 'https://chatgpt.com',
    })
  }

  function openNewWorkspaceNote() {
    openCreateWithTemplate({
      category: 'Other',
      color: 'blue',
      description: 'Workspace note and reminder.',
      name: 'Workspace Note',
      notes: 'Reminder:\n\nContext:\n\nFollow-up:',
      tags: ['Important'],
      url: 'https://example.com',
    })
  }

  function closeOnboarding() {
    localStorage.setItem('nexora.onboarded.v1', 'true')
    setIsOnboardingOpen(false)
  }

  async function installApp() {
    if (!installPromptEvent) {
      return
    }

    await (
      installPromptEvent as Event & {
        prompt: () => Promise<void>
      }
    ).prompt()
    setInstallPromptEvent(null)
  }

  function openEditModal(system: WorkspaceSystem) {
    setCreateTemplate(null)
    setEditingSystem(system)
    setIsSystemModalOpen(true)
  }

  function closeModal() {
    setEditingSystem(null)
    setIsSystemModalOpen(false)
  }

  function saveSystem(input: WorkspaceSystemInput) {
    const didSave = editingSystem
      ? updateSystem(editingSystem.id, input)
      : addSystem(input)

    notify(didSave ? (editingSystem ? 'System saved' : 'System added') : 'Invalid workspace link')

    if (didSave) {
      closeModal()
    }
  }

  function handleDeleteSystem(id: string) {
    deleteSystem(id)
    notify('System deleted')
  }

  function handleToggleFavorite(id: string) {
    toggleFavorite(id)
    notify('Favorite updated')
  }

  function handleTogglePinned(id: string) {
    togglePinned(id)
    notify('Pinned workspace updated')
  }

  function handleOpenSystem(system: WorkspaceSystem) {
    openSystem(system)
    notify('Link opened')
  }

  function focusSearch() {
    setActiveView('Search')
    document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
  }

  function handleQuickAction(label: string) {
    if (label === 'Add System') {
      openAddModal()
      return
    }

    const queryMap: Record<string, string> = {
      'AI Prompt': 'AI',
      'Daily Report': 'Daily',
      'New Form': 'Forms',
      'New Sheet': 'Sheets',
    }

    if (label === 'Open Drive') {
      const driveSystem = systems.find((system) => system.category === 'Drive')
      if (driveSystem) {
        handleOpenSystem(driveSystem)
      } else {
        setSearchQuery('Drive')
        setActiveView('Search')
      }
      return
    }

    const query = queryMap[label]
    if (query) {
      setSearchQuery(query)
      commitSearch(query)
      setActiveView('Search')
      focusSearch()
    }
  }

  function renderCards(
    items: WorkspaceSystem[],
    options: { dragGroup?: 'favorite' | 'pinned' } = {},
  ) {
    return items.map((system) => (
      <DashboardCard
        dragGroup={options.dragGroup}
        key={system.id}
        onDelete={handleDeleteSystem}
        onEdit={openEditModal}
        onInspect={setDetailSystem}
        onOpen={handleOpenSystem}
        onReorder={reorderSystems}
        onToggleFavorite={handleToggleFavorite}
        onTogglePinned={handleTogglePinned}
        system={system}
      />
    ))
  }

  function exportData() {
    const backup = exportWorkspaceData()
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nexora-workspace-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    notify('Workspace exported')
  }

  async function importData(file: File) {
    const text = await file.text()
    const backup = JSON.parse(text) as WorkspaceBackup
    importWorkspaceData(backup)
    notify('Workspace imported')
  }

  function resetData() {
    resetWorkspace()
    notify('Workspace reset')
  }

  function templateItems(template: WorkspaceTemplateName): WorkspaceSystemInput[] {
    const base = {
      collectionId: '',
      favorite: false,
      icon: 'Other',
      pinned: false,
      tags: ['Active'],
    }
    const templates: Record<WorkspaceTemplateName, WorkspaceSystemInput[]> = {
      Admissions: [
        {
          ...base,
          category: 'Forms',
          color: 'pink',
          description: 'Admissions inquiry and intake form.',
          name: 'Admissions Intake Form',
          notes: 'Replace with your real admissions form link.',
          tags: ['Admissions', 'Important'],
          url: 'https://docs.google.com/forms',
        },
        {
          ...base,
          category: 'Sheets',
          color: 'blue',
          description: 'Admissions tracking sheet.',
          name: 'Admissions Tracker',
          notes: 'Track inquiries, interviews, and status changes.',
          tags: ['Admissions', 'Admin'],
          url: 'https://docs.google.com/spreadsheets',
        },
      ],
      'AI Toolkit': [
        {
          ...base,
          category: 'AI Tools',
          color: 'purple',
          description: 'AI prompt workspace.',
          name: 'AI Prompt Library',
          notes: 'Store prompt patterns and classroom workflows.',
          pinned: true,
          tags: ['AI', 'Important'],
          url: 'https://chatgpt.com',
        },
      ],
      'Custom Workspace': [
        {
          ...base,
          category: 'Other',
          color: 'blue',
          description: 'Custom workspace starter.',
          name: 'Custom Workspace Home',
          notes: 'Add links, notes, and tags for this custom workflow.',
          tags: ['Custom', 'Active'],
          url: 'https://example.com',
        },
      ],
      'Daily Report': [
        {
          ...base,
          category: 'Forms',
          color: 'pink',
          description: 'Daily report submission form.',
          name: 'Daily Report Form',
          notes: 'Use this for daily reporting routines.',
          pinned: true,
          tags: ['Daily', 'Important'],
          url: 'https://docs.google.com/forms',
        },
        {
          ...base,
          category: 'Sheets',
          color: 'blue',
          description: 'Daily report response tracker.',
          name: 'Daily Report Sheet',
          notes: 'Review and summarize daily responses.',
          tags: ['Daily', 'Reports'],
          url: 'https://docs.google.com/spreadsheets',
        },
      ],
      'LINE Automation': [
        {
          ...base,
          category: 'LINE',
          color: 'brown',
          description: 'LINE notification control link.',
          name: 'LINE Notify Console',
          notes: 'Connect Apps Script or LINE workflow docs later.',
          tags: ['Automation', 'LINE'],
          url: 'https://notify-bot.line.me',
        },
        {
          ...base,
          category: 'Apps Script',
          color: 'purple',
          description: 'Apps Script automation link.',
          name: 'LINE Apps Script',
          notes: 'Replace with deployed script or editor link.',
          tags: ['Automation', 'Google'],
          url: 'https://script.google.com',
        },
      ],
      'Student System': [
        {
          ...base,
          category: 'Drive',
          color: 'blue',
          description: 'Student system folder.',
          name: 'Student Drive Folder',
          notes: 'Main folder for student documents and outputs.',
          tags: ['Student', 'Folder'],
          url: 'https://drive.google.com/drive/folders',
        },
      ],
    }

    return templates[template]
  }

  function applyTemplate(template: WorkspaceTemplateName) {
    const savedCount = templateItems(template).filter((item) => addSystem(item)).length
    notify(`${template} template added (${savedCount})`)
  }

  function renderDashboard() {
    return (
      <>
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl sm:p-6">
            <div className="inline-flex rounded-full border border-[#f05193]/35 bg-[#f05193]/10 px-4 py-2 text-sm font-medium text-[#ffd1e4] backdrop-blur-xl">
              Personal intelligent workspace launcher
            </div>
            <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              Your school automation universe, organized in one command center.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Quick access to forms, sheets, folders, slides, Apps Script, AI
              tools, LINE notification tools, outputs, and master links.
            </p>
            <button
              className="mt-5 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-5 py-3 text-sm font-semibold text-[#70dfff] shadow-lg shadow-[#009FD1]/10 transition hover:bg-[#009FD1]/25"
              onClick={openAddModal}
              type="button"
            >
              Add New System
            </button>
          </div>

          <StatsGrid stats={stats} />
        </div>

        <section>
          <SectionHeader
            action={searchQuery ? `${filteredSystems.length} found` : 'Saved'}
            eyebrow="Launch"
            title="Quick Access"
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {quickActions.map((action) => (
              <QuickActionButton
                action={action}
                key={action.label}
                onClick={() => handleQuickAction(action.label)}
              />
            ))}
          </div>
        </section>

        <div className="mt-7">
          <TemplatePanel onApplyTemplate={applyTemplate} />
        </div>

        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.82fr]">
          <section>
            <SectionHeader
              action="Drag to sort"
              eyebrow="Pinned"
              title="Pinned Workspace"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {renderCards(pinnedSystems, { dragGroup: 'pinned' })}
            </div>
            {pinnedSystems.length === 0 ? (
              <PremiumEmptyState
                action="Add pinned system"
                message="Pinned systems stay separate from favorites for the links you need at command-center speed."
                onAction={openAddModal}
                title="No pinned systems yet"
              />
            ) : null}
          </section>

          <section>
            <SectionHeader
              action="Drag to sort"
              eyebrow="Saved"
              title="Favorites"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {renderCards(favoriteSystems, { dragGroup: 'favorite' })}
            </div>
            {favoriteSystems.length === 0 ? (
              <PremiumEmptyState
                message="Favorite systems will appear here when you tap the star on a card."
                title="No favorites yet"
              />
            ) : null}
          </section>
        </div>

        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.82fr]">
          <section>
            <SectionHeader
              action="Edited"
              eyebrow="Momentum"
              title="Recently Edited"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {renderCards(editedSystems)}
            </div>
            {editedSystems.length === 0 ? (
              <PremiumEmptyState
                message="Edited systems will appear here after you update a workspace item."
                title="No edits tracked yet"
              />
            ) : null}
          </section>

          <section>
            <SectionHeader
              action="Usage"
              eyebrow="Intelligence"
              title="Most Used Systems"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {renderCards(mostUsedSystems)}
            </div>
            {mostUsedSystems.length === 0 ? (
              <PremiumEmptyState
                message="Open systems to let NEXORA learn which links matter most."
                title="No usage data yet"
              />
            ) : null}
          </section>
        </div>

        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.82fr]">
          <section>
            <SectionHeader eyebrow="Today" title="Daily Workspace" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {renderCards(dailyWorkspaceSystems.slice(0, 4))}
            </div>
          </section>

          <section>
            <SectionHeader
              action="History"
              eyebrow="Activity"
              title="Recent Systems"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {renderCards(recentSystems)}
            </div>
            {recentSystems.length === 0 ? (
              <PremiumEmptyState
                message="Opened systems will appear here automatically after you launch a link."
                title="No recent activity"
              />
            ) : null}
          </section>
        </div>

        <div className="mt-7">
          <CollectionPanel
            collections={collections}
            onAddCollection={addCollection}
            onReorderCollections={reorderCollections}
            systems={systems}
          />
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Analytics
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Launch Counts
            </h3>
            <p className="mt-3 text-4xl font-semibold text-[#70dfff]">
              {totalLaunches}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Total system launches tracked locally.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
              Trend
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Recent Activity Trend
            </h3>
            <p className="mt-3 text-4xl font-semibold text-[#ffd1e4]">
              {activityTrend}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Opened and edited systems currently visible in activity streams.
            </p>
          </div>
        </div>
      </>
    )
  }

  function renderSearchPage() {
    const grouped = categoryViews.map((category) => ({
      category,
      systems: filteredSystems.filter((system) => system.category === category),
    }))

    return (
      <section>
        <SectionHeader
          action={`${filteredSystems.length} results`}
          eyebrow="Command"
          title="Global Search"
        />
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.075] p-5 backdrop-blur-2xl">
          <p className="text-sm text-slate-300">
            Search by name, category, or tag. Recent searches:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-300"
                key={search}
                onClick={() => setSearchQuery(search)}
                type="button"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {grouped.map((group) =>
            group.systems.length ? (
              <div key={group.category}>
                <SectionHeader title={group.category} />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {renderCards(group.systems)}
                </div>
              </div>
            ) : null,
          )}
        </div>
        {filteredSystems.length === 0 ? (
          <PremiumEmptyState
            action="Clear search"
            message="No systems match this query yet. Try a category, tag, or system name."
            onAction={() => {
              setSearchQuery('')
              clearRecentSearches()
            }}
            title="No search results"
          />
        ) : null}
      </section>
    )
  }

  function renderActiveView() {
    if (activeView === 'Dashboard') {
      return renderDashboard()
    }

    if (activeView === 'Settings') {
      return (
        <SettingsPanel
          onClearRecent={() => {
            clearRecentActivity()
            notify('Recent activity cleared')
          }}
          onExport={exportData}
          onImport={importData}
          onReset={resetData}
          onThemeChange={setTheme}
          theme={theme}
        />
      )
    }

    if (activeView === 'Search') {
      return renderSearchPage()
    }

    return (
      <section>
        <SectionHeader
          action={`${pageSystems.length} systems`}
          eyebrow="Workspace"
          title={activeView}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {renderCards(pageSystems)}
        </div>
        {pageSystems.length === 0 ? (
          <PremiumEmptyState
            action="Add system"
            message="This view is ready for workspace systems when you add or categorize links."
            onAction={openAddModal}
            title={`${activeView} is empty`}
          />
        ) : null}
      </section>
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0f172a] text-white">
      <div
        className={`fixed inset-0 ${themeBackgrounds[theme] ?? themeBackgrounds.Dark}`}
      />
      <div className="fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#009FD1] to-transparent opacity-80" />

      <div className="relative z-10 lg:grid lg:grid-cols-[18rem_1fr]">
        <Sidebar
          activeView={activeView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={setActiveView}
          systemCount={systems.length}
        />

        <div className="min-w-0">
          <Topbar
            onCommitSearch={commitSearch}
            onMenuClick={() => setIsSidebarOpen(true)}
            onOpenSystem={handleOpenSystem}
            onSearchChange={setSearchQuery}
            recentSearches={recentSearches}
            searchQuery={searchQuery}
            searchResults={searchResults}
          />

          <section className="mx-auto w-full max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8">
            {renderActiveView()}
            <footer className="mt-8 pb-4 text-sm text-slate-500">
              Local workspace OS. Systems, collections, notes, and settings are
              saved in this browser.
            </footer>
          </section>
        </div>
      </div>

      {isSystemModalOpen ? (
        <SystemModal
          collections={collections}
          createTemplate={createTemplate}
          editingSystem={editingSystem}
          key={editingSystem?.id ?? 'new-system'}
          onClose={closeModal}
          onSave={saveSystem}
        />
      ) : null}
      {detailSystem ? (
        <WorkspaceDetailModal
          collections={collections}
          onEdit={openEditModal}
          onToggleFavorite={handleToggleFavorite}
          onTogglePinned={handleTogglePinned}
          onClose={() => setDetailSystem(null)}
          onOpen={handleOpenSystem}
          relatedSystems={systems
            .filter(
              (system) =>
                system.id !== detailSystem.id &&
                (system.category === detailSystem.category ||
                  system.collectionId === detailSystem.collectionId ||
                  system.tags.some((tag) => detailSystem.tags.includes(tag))),
            )
            .slice(0, 4)}
          system={detailSystem}
        />
      ) : null}
      {isOnboardingOpen ? (
        <OnboardingFlow
          onAddSystem={openAddModal}
          onApplyTemplate={applyTemplate}
          onClose={closeOnboarding}
        />
      ) : null}
      <InstallPrompt
        canInstall={Boolean(installPromptEvent)}
        isStandalone={isStandalone}
        onInstall={installApp}
      />
      <MobileBottomNav
        onAdd={openAddModal}
        onNavigate={setActiveView}
        onSearchFocus={focusSearch}
      />
      <FloatingCreateButton
        onNewAiPrompt={openNewAiPrompt}
        onNewCollection={openNewCollectionPrompt}
        onNewNote={openNewWorkspaceNote}
        onNewSystem={openAddModal}
      />
      <CommandPalette
        categories={categoryViews}
        collections={collections}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveView}
        onNewCollection={openNewCollectionPrompt}
        onNewNote={openNewWorkspaceNote}
        onNewSystem={openAddModal}
        onOpenSystem={handleOpenSystem}
        systems={systems}
      />
      <ToastStack toasts={toasts} />
    </main>
  )
}
