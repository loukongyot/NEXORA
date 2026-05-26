import { useEffect, useMemo, useRef, useState } from 'react'
import { CollectionPanel } from '../components/CollectionPanel'
import { CommandPalette } from '../components/CommandPalette'
import { DashboardCard } from '../components/DashboardCard'
import { FloatingCreateButton } from '../components/FloatingCreateButton'
import { GoogleWorkspaceWidget } from '../components/GoogleWorkspaceWidget'
import { InstallPrompt } from '../components/InstallPrompt'
import { InsightCard } from '../components/InsightCard'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { OnboardingFlow } from '../components/OnboardingFlow'
import { PremiumEmptyState } from '../components/PremiumEmptyState'
import { SectionHeader } from '../components/SectionHeader'
import { SettingsPanel } from '../components/SettingsPanel'
import { StatsGrid } from '../components/StatsGrid'
import { Sidebar } from '../components/Sidebar'
import { SystemModal } from '../components/SystemModal'
import type { WorkspaceTemplateName } from '../components/TemplatePanel'
import { ToastStack } from '../components/ToastStack'
import type { ToastMessage } from '../components/ToastStack'
import { Topbar } from '../components/Topbar'
import { WorkspaceDetailModal } from '../components/WorkspaceDetailModal'
import { insights } from '../data/insightsData'
import { useWorkspaceSystems } from '../hooks/useWorkspaceSystems'
import { cloudSyncStatus } from '../lib/supabase'
import {
  fetchGoogleWorkspaceData,
  testGoogleWorkspaceConnection,
  type GoogleWorkspaceData,
  type GoogleWorkspaceStatus,
} from '../services/googleWorkspaceService'
import {
  testSupabaseConnection,
  type DatabaseTestStatus,
} from '../services/workspaceService'
import type {
  WorkspaceBackup,
  WorkspaceCategory,
  WorkspaceColor,
  WorkspaceSystem,
  WorkspaceSystemInput,
} from '../types/workspace'
import {
  detectGoogleLinkType,
  generateWorkspaceTags,
  normalizeWorkspaceUrl,
  validateWorkspaceUrl,
} from '../utils/workspaceOptions'

const categoryViews: WorkspaceCategory[] = [
  'Forms',
  'Sheets',
  'Drive',
  'Slides',
  'Apps Script',
  'AI Tools',
]

const viewTitles: Record<string, string> = {
  Dashboard: 'แดชบอร์ด',
  Favorites: '⭐ Starred',
  Forms: '📝 Forms',
  Sheets: '📊 Sheets',
  Drive: '📁 Drive',
  Slides: '🖥️ Slides',
  'Apps Script': '⚡ Apps Script',
  'AI Tools': '🤖 AI Tools',
  Recent: 'การใช้งานล่าสุด',
  Search: 'ค้นหา',
  Settings: 'ตั้งค่า',
}

const INSTALL_DISMISSED_KEY = 'nexora.installDismissed.v1'

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
  const [backupCreated, setBackupCreated] = useState(
    () => localStorage.getItem('nexora.backupCreated.v1') === 'true',
  )
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null)
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone),
  )
  const [isInstallDismissed, setIsInstallDismissed] = useState(
    () => localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true',
  )
  const [isIos] = useState(() => {
    const navigatorWithPlatform = window.navigator as Navigator & {
      standalone?: boolean
    }
    return (
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
      typeof navigatorWithPlatform.standalone === 'boolean'
    )
  })
  const [theme, setTheme] = useState(
    () => localStorage.getItem('nexora.theme.v1') ?? 'Dark',
  )
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [databaseTestStatus, setDatabaseTestStatus] =
    useState<DatabaseTestStatus | null>(null)
  const [googleWorkspaceData, setGoogleWorkspaceData] =
    useState<GoogleWorkspaceData | null>(null)
  const [googleWorkspaceStatus, setGoogleWorkspaceStatus] =
    useState<GoogleWorkspaceStatus>('missing-url')
  const [googleWorkspaceMessage, setGoogleWorkspaceMessage] =
    useState('ยังไม่ได้เชื่อมต่อ')
  const toastIdRef = useRef(0)
  const lastSyncMessageRef = useRef('')

  const {
    activeSystems,
    addCollection,
    addSystem,
    clearRecentActivity,
    clearRecentSearches,
    collections,
    commitSearch,
    deleteSystem,
    dismissCloudMigrationPrompt,
    exportWorkspaceData,
    editedSystems,
    favoriteSystems,
    filteredSystems,
    importWorkspaceData,
    isWorkspaceLoading,
    lastSyncedAt,
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
    shouldPromptCloudMigration,
    syncCloudToLocal,
    syncLocalToCloud,
    syncMessage,
    syncStatus,
    systems,
    toggleFavorite,
    togglePinned,
    updateSystem,
  } = useWorkspaceSystems()

  const dailyWorkspaceSystems = filteredSystems.filter((system) =>
    ['Forms', 'Sheets', 'LINE', 'Apps Script'].includes(system.category),
  )

  const starredSystems = useMemo(() => {
    const starredMap = new Map<string, WorkspaceSystem>()
    pinnedSystems.forEach((system) => starredMap.set(system.id, system))
    favoriteSystems.forEach((system) => starredMap.set(system.id, system))

    return Array.from(starredMap.values()).slice(0, 6)
  }, [favoriteSystems, pinnedSystems])

  const continueWorkingSystems = useMemo(() => {
    const activeMap = new Map<string, WorkspaceSystem>()

    recentSystems.forEach((system) => activeMap.set(system.id, system))
    editedSystems.forEach((system) => activeMap.set(system.id, system))
    mostUsedSystems.forEach((system) => activeMap.set(system.id, system))
    dailyWorkspaceSystems.forEach((system) => activeMap.set(system.id, system))

    return Array.from(activeMap.values()).slice(0, 6)
  }, [dailyWorkspaceSystems, editedSystems, mostUsedSystems, recentSystems])

  const stats = [
    { label: 'จำนวนระบบ', tone: 'blue' as const, value: systems.length },
    {
      label: 'ระบบล่าสุด',
      tone: 'pink' as const,
      value: recentSystems.length,
    },
    {
      label: 'Cloud status',
      tone: 'purple' as const,
      value: cloudSyncStatus === 'connected' ? 'Cloud' : 'Local',
    },
    {
      label: 'Sync state',
      tone: 'brown' as const,
      value:
        syncStatus === 'synced'
          ? 'Synced'
          : syncStatus === 'syncing'
            ? 'Syncing'
            : syncStatus === 'pending'
              ? 'Pending'
            : syncStatus === 'local-only'
              ? 'Local'
              : syncStatus === 'offline'
                ? 'Offline'
                : 'Error',
    },
  ]
  useEffect(() => {
    localStorage.setItem('nexora.theme.v1', theme)
  }, [theme])

  useEffect(() => {
    function handleInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    function handleInstalled() {
      setInstallPromptEvent(null)
      localStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
      setIsInstallDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  useEffect(() => {
    async function loadGoogleWorkspace() {
      setGoogleWorkspaceStatus('loading')
      const result = await fetchGoogleWorkspaceData()
      setGoogleWorkspaceData(result.data)
      setGoogleWorkspaceStatus(result.status)
      setGoogleWorkspaceMessage(result.message)
    }

    void loadGoogleWorkspace()
  }, [])

  useEffect(() => {
    if (
      syncMessage &&
      syncMessage !== lastSyncMessageRef.current &&
      (syncStatus === 'error' || syncStatus === 'offline')
    ) {
      lastSyncMessageRef.current = syncMessage
      notify(syncMessage)
    }
  }, [syncMessage, syncStatus])

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

  function dismissInstallPrompt() {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
    setIsInstallDismissed(true)
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

    notify(
      didSave
        ? editingSystem
          ? 'บันทึกระบบแล้ว'
          : 'เพิ่มระบบแล้ว'
        : 'ลิงก์ไม่ถูกต้อง',
    )

    if (didSave) {
      closeModal()
    }
  }

  function handleDeleteSystem(id: string) {
    const system = systems.find((item) => item.id === id)
    const confirmed = window.confirm(
      `Delete "${system?.name ?? 'this system'}" from NEXORA?`,
    )
    if (!confirmed) {
      return
    }
    deleteSystem(id)
    notify('System deleted')
  }

  function handleToggleFavorite(id: string) {
    toggleFavorite(id)
    notify('Favorite updated')
  }

  function handleTogglePinned(id: string) {
    togglePinned(id)
    notify('อัปเดต Starred แล้ว')
  }

  function handleOpenSystem(system: WorkspaceSystem) {
    openSystem(system)
    notify('เปิดลิงก์แล้ว')
  }

  function focusSearch() {
    setActiveView('Search')
    document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
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
    localStorage.setItem('nexora.backupCreated.v1', 'true')
    setBackupCreated(true)
    notify('ส่งออก workspace แล้ว')
  }

  async function importData(file: File) {
    try {
      const text = await file.text()
      const backup = JSON.parse(text) as WorkspaceBackup
      if (!Array.isArray(backup.systems) || !Array.isArray(backup.collections)) {
        notify('ไฟล์ backup ไม่ถูกต้อง')
        return
      }
      importWorkspaceData(backup)
      notify('นำเข้า workspace แล้ว')
    } catch {
      notify('นำเข้าไม่สำเร็จ')
    }
  }

  function resetData() {
    const confirmed = window.confirm(
      'รีเซ็ต NEXORA กลับเป็น starter workspace? ควร export backup ก่อนถ้าจำเป็น',
    )
    if (!confirmed) {
      return
    }
    resetWorkspace()
    notify('รีเซ็ต workspace แล้ว')
  }

  function clearRecentData() {
    const confirmed = window.confirm('ล้างการใช้งานล่าสุดทั้งหมด?')
    if (!confirmed) {
      return
    }
    clearRecentActivity()
    notify('ล้างการใช้งานล่าสุดแล้ว')
  }

  function formatRelativeTime(date?: string) {
    if (!date) {
      return 'ยังไม่เคยเปิด'
    }

    const elapsedSeconds = Math.max(
      0,
      Math.round((Date.now() - new Date(date).getTime()) / 1000),
    )

    if (elapsedSeconds < 60) {
      return 'เมื่อสักครู่'
    }

    const elapsedMinutes = Math.round(elapsedSeconds / 60)
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes} นาทีที่แล้ว`
    }

    const elapsedHours = Math.round(elapsedMinutes / 60)
    if (elapsedHours < 24) {
      return `${elapsedHours} ชม. ที่แล้ว`
    }

    return `${Math.round(elapsedHours / 24)} วันที่แล้ว`
  }

  async function handleTestCloudDatabase() {
    const result = await testSupabaseConnection()
    setDatabaseTestStatus(result.status)
    notify(result.message)
  }

  async function refreshGoogleWorkspaceData(shouldNotify = true) {
    setGoogleWorkspaceStatus('loading')
    const result = await fetchGoogleWorkspaceData()
    setGoogleWorkspaceData(result.data)
    setGoogleWorkspaceStatus(result.status)
    setGoogleWorkspaceMessage(result.message)

    if (shouldNotify) {
      notify(result.message)
    }
  }

  async function handleTestGoogleConnection() {
    setGoogleWorkspaceStatus('loading')
    const result = await testGoogleWorkspaceConnection()
    setGoogleWorkspaceData(result.data)
    setGoogleWorkspaceStatus(result.status)
    setGoogleWorkspaceMessage(result.message)
    notify(result.message)
  }

  function inferNameFromUrl(url: string, category: WorkspaceCategory) {
    try {
      const parsedUrl = new URL(normalizeWorkspaceUrl(url))
      const lastSegment = parsedUrl.pathname
        .split('/')
        .filter(Boolean)
        .at(-1)

      if (lastSegment && !['edit', 'viewform', 'folders'].includes(lastSegment)) {
        return `${category} - ${lastSegment.slice(0, 10)}`
      }
    } catch {
      return `${category} System`
    }

    return `${category} System`
  }

  function importStarterLinks(rawLinks: string) {
    const links = rawLinks
      .split(/\r?\n|,/)
      .map((link) => link.trim())
      .filter(Boolean)
    let savedCount = 0
    let invalidCount = 0

    links.forEach((link) => {
      if (!validateWorkspaceUrl(link)) {
        invalidCount += 1
        return
      }

      const detection = detectGoogleLinkType(link)
      const category = detection?.category ?? 'Other'
      const collectionSuggestion =
        collections.find((collection) =>
          collection.name.toLowerCase().includes(category.toLowerCase()),
        )?.id ?? ''
      const input: WorkspaceSystemInput = {
        category,
        collectionId: collectionSuggestion,
        color: detection?.color ?? ('blue' as WorkspaceColor),
        description: `Imported ${category} link.`,
        favorite: false,
        icon: detection?.icon ?? category,
        name: inferNameFromUrl(link, category),
        notes: 'Imported from starter workspace migration.',
        pinned: false,
        tags: generateWorkspaceTags(link, ['Imported']),
        url: normalizeWorkspaceUrl(link),
      }

      if (addSystem(input)) {
        savedCount += 1
      }
    })

    notify(`นำเข้า ${savedCount} ลิงก์${invalidCount ? `, ข้าม ${invalidCount}` : ''}`)
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
              Workspace ส่วนตัวสำหรับงานประจำวัน
            </div>
            <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              รวมระบบ ฟอร์ม โฟลเดอร์ และ AI Tools ไว้ในที่เดียว.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              ค้นหา เปิด และจัดกลุ่มงานสำคัญได้เร็วขึ้น พร้อม Cloud Sync และ localStorage fallback.
            </p>
            <button
              className="mt-5 rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-5 py-3 text-sm font-semibold text-[#70dfff] shadow-lg shadow-[#009FD1]/10 transition hover:bg-[#009FD1]/25"
              onClick={openAddModal}
              type="button"
            >
              เพิ่มระบบ
            </button>
          </div>

          <div>
            <SectionHeader
              action="Local"
              eyebrow="ภาพรวม"
              title="Analytics Mini"
            />
            <StatsGrid stats={stats} />
          </div>
        </div>

        <section className="mb-7">
          <SectionHeader
            action={searchQuery ? `${filteredSystems.length} รายการ` : 'พร้อมค้นหา'}
            eyebrow="Search"
            title="ค้นหา"
          />
          <button
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.065] px-4 py-4 text-left shadow-2xl shadow-black/15 backdrop-blur-2xl transition hover:border-[#009FD1]/35 hover:bg-white/[0.09]"
            onClick={focusSearch}
            type="button"
          >
            <span>
              <span className="block text-base font-semibold text-white">
                ค้นหาระบบ ฟอร์ม หรือโฟลเดอร์
              </span>
              <span className="mt-1 block text-sm text-slate-400">
                ใช้ชื่อ หมวดหมู่ หรือ tag เพื่อเปิด workspace ได้เร็วขึ้น.
              </span>
            </span>
            <span className="rounded-full border border-[#009FD1]/30 bg-[#009FD1]/15 px-3 py-1 text-xs font-semibold text-[#70dfff]">
              ค้นหา
            </span>
          </button>
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_0.9fr]">
          <section>
            <SectionHeader
              action={starredSystems.length ? `${starredSystems.length} ระบบ` : 'พร้อมใช้'}
              eyebrow="โฟกัส"
              title="⭐ Starred"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {renderCards(starredSystems, { dragGroup: 'pinned' })}
            </div>
            {starredSystems.length === 0 ? (
              <PremiumEmptyState
                action="เพิ่มระบบ"
                message="ปักหมุดหรือกดดาวให้ระบบที่ใช้บ่อย แล้วระบบจะมาอยู่ตรงนี้."
                onAction={openAddModal}
                title="ยังไม่มี Starred"
              />
            ) : null}
          </section>

          <section>
            <SectionHeader
              action={continueWorkingSystems.length ? 'พร้อมเปิดต่อ' : 'รอข้อมูล'}
              eyebrow="ทำต่อ"
              title="ทำงานล่าสุด"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {renderCards(continueWorkingSystems)}
            </div>
            {continueWorkingSystems.length === 0 ? (
              <PremiumEmptyState
                message="เปิดระบบที่ใช้งานล่าสุดได้ทันทีเมื่อเริ่มมี activity."
                title="ยังไม่มีงานล่าสุด"
              />
            ) : null}
          </section>
        </div>

        <section className="mt-7">
          <SectionHeader
            action="Mock data"
            eyebrow="เนื้อหาอัจฉริยะ"
            title="🧠 NEXORA Insights"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {insights.map((insight) => (
              <InsightCard insight={insight} key={insight.id} />
            ))}
          </div>
        </section>

        <GoogleWorkspaceWidget
          data={googleWorkspaceData}
          onRefresh={() => void refreshGoogleWorkspaceData()}
          status={googleWorkspaceStatus}
        />

        <section className="mt-7">
          <SectionHeader
            action={syncStatus === 'local-only' ? 'Local mode' : 'Cloud + local'}
            eyebrow="ล่าสุด"
            title="การใช้งานล่าสุด"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentSystems.slice(0, 6).map((system) => (
              <button
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left shadow-2xl shadow-black/15 backdrop-blur-2xl transition hover:border-[#009FD1]/35 hover:bg-white/[0.09]"
                key={system.id}
                onClick={() => setDetailSystem(system)}
                type="button"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#009FD1]">
                  {formatRelativeTime(system.openedAt)}
                </p>
                <h3 className="mt-2 line-clamp-1 text-base font-semibold text-white">
                  {system.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {system.category} - เปิด {system.openCount} ครั้ง
                </p>
              </button>
            ))}
          </div>
          {recentSystems.length === 0 ? (
            <PremiumEmptyState
              message="เปิดระบบที่ใช้งานล่าสุดได้ทันที และ NEXORA จะบันทึก activity ให้อัตโนมัติ."
              title="ยังไม่มีการใช้งานล่าสุด"
            />
          ) : null}
        </section>

        <div className="mt-7">
          <CollectionPanel
            collections={collections}
            onAddCollection={addCollection}
            onReorderCollections={reorderCollections}
            systems={systems}
          />
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
          action={`${filteredSystems.length} รายการ`}
          eyebrow="Command"
          title="ค้นหา"
        />
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.075] p-5 backdrop-blur-2xl">
          <p className="text-sm text-slate-300">
            ค้นหาด้วยชื่อ หมวดหมู่ หรือ tag. ค้นหาล่าสุด:
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
            action="ล้างคำค้นหา"
            message="ยังไม่มีระบบที่ตรงกับคำค้นหา ลองค้นหาด้วยชื่อ หมวด หรือ tag."
            onAction={() => {
              setSearchQuery('')
              clearRecentSearches()
            }}
            title="ไม่พบผลการค้นหา"
          />
        ) : null}
      </section>
    )
  }

  function renderActiveView() {
    if (isWorkspaceLoading) {
      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.075] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Cloud Sync
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
            กำลังโหลด workspace
            </h2>
            <p className="mt-2 text-sm text-slate-400">
            NEXORA กำลังตรวจ Supabase และเตรียม localStorage เป็น fallback.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20"
                key={item}
              />
            ))}
          </div>
        </div>
      )
    }

    if (activeView === 'Dashboard') {
      return renderDashboard()
    }

    if (activeView === 'Settings') {
      return (
        <SettingsPanel
          cloudSyncStatus={cloudSyncStatus}
          databaseTestStatus={databaseTestStatus}
          isSyncing={syncStatus === 'syncing'}
          checklist={{
            backupCreated,
            hasRealSystem: systems.length > 0,
            hasRecentActivity: recentSystems.length > 0,
            isInstallable: Boolean(installPromptEvent) || isStandalone,
            mobileReady: true,
          }}
          onClearRecent={() => {
            clearRecentData()
          }}
          onExport={exportData}
          onImport={importData}
          onImportStarterLinks={importStarterLinks}
          onReset={resetData}
          onTestCloudDatabase={handleTestCloudDatabase}
          googleWorkspaceMessage={googleWorkspaceMessage}
          googleWorkspaceStatus={googleWorkspaceStatus}
          onTestGoogleConnection={handleTestGoogleConnection}
          onForceRefreshCloud={async () => {
            const result = await syncCloudToLocal()
            notify(
              result
                ? result.message ?? `Refreshed ${result.data.synced} cloud items`
                : 'Cloud refresh failed',
            )
          }}
          onSyncCloudToLocal={async () => {
            const result = await syncCloudToLocal()
            notify(
              result
                ? result.message ?? `Synced ${result.data.synced} cloud items`
                : 'Cloud sync failed',
            )
          }}
          onSyncLocalToCloud={async () => {
            const result = await syncLocalToCloud()
            notify(
              result
                ? result.message ?? `Synced ${result.data.synced} local items`
                : 'Cloud sync failed',
            )
          }}
          onThemeChange={setTheme}
          lastSyncedAt={lastSyncedAt}
          syncMessage={syncMessage}
          syncStatus={syncStatus}
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
          title={viewTitles[activeView] ?? activeView}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {renderCards(pageSystems)}
        </div>
        {pageSystems.length === 0 ? (
          <PremiumEmptyState
            action="เพิ่มระบบ"
            message="ยังไม่มีระบบในหมวดนี้ เพิ่มหรือจัดหมวดหมู่ลิงก์เพื่อเริ่มใช้งาน."
            onAction={openAddModal}
            title="ยังไม่มีระบบในหมวดนี้"
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
            syncStatus={syncStatus}
          />

          <section className="mx-auto w-full max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8">
            {renderActiveView()}
            <footer className="mt-8 pb-4 text-sm text-slate-500">
              NEXORA บันทึกระบบ กลุ่มงาน notes และ settings ใน browser นี้ พร้อม Cloud Sync เมื่อพร้อมใช้งาน.
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
        isDismissed={isInstallDismissed}
        isIos={isIos}
        isStandalone={isStandalone}
        onDismiss={dismissInstallPrompt}
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
      {shouldPromptCloudMigration ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#020617]/70 px-4 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a]/95 p-5 shadow-2xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Cloud Migration
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              ย้าย workspace ในเครื่องขึ้น cloud?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Supabase พร้อมใช้งานและ cloud workspace ยังว่างอยู่ สามารถคัดลอกระบบในเครื่องขึ้น cloud โดยข้อมูล local ยังอยู่เหมือนเดิม.
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-[#70dfff]">
              มี {systems.length} ระบบในเครื่องพร้อมย้าย
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                onClick={() => {
                  dismissCloudMigrationPrompt()
                  notify('Cloud migration skipped')
                }}
                type="button"
              >
                ใช้ local ต่อ
              </button>
              <button
                className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-4 py-3 text-sm font-semibold text-[#70dfff] transition hover:bg-[#009FD1]/25"
                onClick={async () => {
                  const result = await syncLocalToCloud()
                  notify(
                    result
                      ? result.message ?? `Migrated ${result.data.synced} items`
                      : 'Cloud migration failed',
                  )
                }}
                type="button"
              >
                ย้ายขึ้น cloud
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
