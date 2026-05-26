import { useEffect, useMemo, useRef, useState } from 'react'
import { cloudSyncStatus } from '../lib/supabase'
import {
  createActivityLog,
  createCollection as createCloudCollection,
  createWorkspaceSystem,
  deleteWorkspaceSystem,
  getCollections,
  getWorkspaceSystems,
  syncCloudToLocal as syncCloudToLocalService,
  syncLocalToCloud as syncLocalToCloudService,
  updateCollection as updateCloudCollection,
  updateWorkspaceSystem,
} from '../services/workspaceService'
import {
  loadWorkspaceCollections,
  loadWorkspaceSystems,
  saveWorkspaceCollections,
  saveWorkspaceSystems,
  starterCollections,
  starterSystems,
} from '../storage/workspaceStorage'
import type {
  WorkspaceBackup,
  WorkspaceCollection,
  WorkspaceSystem,
  WorkspaceSystemInput,
} from '../types/workspace'
import { fuzzyIncludes, normalizeUrl, validateWorkspaceUrl } from '../utils/workspaceOptions'

const RECENT_SEARCHES_KEY = 'nexora.recentSearches.v1'
const LAST_SYNCED_KEY = 'nexora.lastSyncedAt.v1'

export type WorkspaceSyncStatus =
  | 'synced'
  | 'syncing'
  | 'pending'
  | 'offline'
  | 'local-only'
  | 'error'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `system-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadRecentSearches() {
  try {
    const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY)
    const parsedSearches = savedSearches ? JSON.parse(savedSearches) : []

    return Array.isArray(parsedSearches) ? (parsedSearches as string[]) : []
  } catch {
    return []
  }
}

function loadLastSyncedAt() {
  return localStorage.getItem(LAST_SYNCED_KEY) ?? ''
}

export function useWorkspaceSystems() {
  const [systems, setSystems] = useState<WorkspaceSystem[]>(() =>
    loadWorkspaceSystems(),
  )
  const [collections, setCollections] = useState<WorkspaceCollection[]>(() =>
    loadWorkspaceCollections(),
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearches(),
  )
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(
    cloudSyncStatus === 'connected',
  )
  const [syncStatus, setSyncStatus] = useState<WorkspaceSyncStatus>(
    cloudSyncStatus === 'connected' ? 'syncing' : 'local-only',
  )
  const [syncMessage, setSyncMessage] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState(loadLastSyncedAt)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const pendingSyncCountRef = useRef(0)
  const [shouldPromptCloudMigration, setShouldPromptCloudMigration] =
    useState(false)

  useEffect(() => {
    saveWorkspaceSystems(systems)
  }, [systems])

  useEffect(() => {
    saveWorkspaceCollections(collections)
  }, [collections])

  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

  useEffect(() => {
    let isMounted = true

    async function loadCloudWorkspace() {
      if (cloudSyncStatus !== 'connected') {
        setIsWorkspaceLoading(false)
        setSyncStatus('local-only')
        return
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsWorkspaceLoading(false)
        setSyncStatus('offline')
        return
      }

      try {
        setSyncStatus('syncing')
        const localSystems = loadWorkspaceSystems()
        const [cloudSystems, cloudCollections] = await Promise.all([
          getWorkspaceSystems(),
          getCollections(),
        ])

        if (!isMounted) {
          return
        }

        if (cloudSystems.mode === 'cloud') {
          if (cloudSystems.data.length > 0) {
            setSystems(cloudSystems.data)
          } else if (localSystems.length > 0) {
            setShouldPromptCloudMigration(true)
          }
        }

        if (cloudCollections.mode === 'cloud' && cloudCollections.data.length > 0) {
          setCollections(cloudCollections.data)
        }

        setSyncStatus(
          cloudSystems.mode === 'cloud' && cloudCollections.mode === 'cloud'
            ? 'synced'
            : 'offline',
        )
        setSyncMessage(cloudSystems.message ?? cloudCollections.message ?? '')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setSyncStatus('error')
        setSyncMessage(
          error instanceof Error ? error.message : 'Cloud workspace load failed',
        )
      } finally {
        if (isMounted) {
          setIsWorkspaceLoading(false)
        }
      }
    }

    void loadCloudWorkspace()

    return () => {
      isMounted = false
    }
  }, [lastSyncedAt])

  useEffect(() => {
    function handleOffline() {
      setSyncStatus(cloudSyncStatus === 'connected' ? 'offline' : 'local-only')
      if (pendingSyncCountRef.current > 0) {
        setSyncMessage('Pending Sync - browser is offline')
      }
    }

    function handleOnline() {
      if (cloudSyncStatus !== 'connected') {
        setSyncStatus('local-only')
        return
      }

      if (pendingSyncCountRef.current > 0) {
        setSyncStatus('pending')
        setSyncMessage('Pending Sync - use manual sync to retry')
        return
      }

      setSyncStatus(lastSyncedAt ? 'synced' : 'pending')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [lastSyncedAt])

  function isOffline() {
    return typeof navigator !== 'undefined' && !navigator.onLine
  }

  function setPendingCount(nextCount: number) {
    pendingSyncCountRef.current = Math.max(0, nextCount)
    setPendingSyncCount(pendingSyncCountRef.current)
  }

  function beginCloudOperation(message = 'Pending Sync') {
    if (cloudSyncStatus !== 'connected') {
      setSyncStatus('local-only')
      return false
    }

    setPendingCount(pendingSyncCountRef.current + 1)

    if (isOffline()) {
      setSyncStatus('offline')
      setSyncMessage(`${message} - offline`)
      return false
    }

    setSyncStatus('syncing')
    setSyncMessage(message)
    return true
  }

  function finishCloudOperation(message: string) {
    const nextPendingCount = pendingSyncCountRef.current - 1
    setPendingCount(nextPendingCount)

    if (nextPendingCount > 0) {
      setSyncStatus('pending')
      setSyncMessage(`Pending Sync (${nextPendingCount})`)
      return
    }

    markSynced(message)
  }

  function keepPending(message = 'Pending Sync') {
    setSyncStatus(isOffline() ? 'offline' : 'pending')
    setSyncMessage(message)
  }

  function handleCloudError(error: unknown, fallbackMessage: string) {
    setSyncStatus(
      isOffline() ? 'offline' : 'error',
    )
    setSyncMessage(error instanceof Error ? error.message : fallbackMessage)
  }

  function markSynced(message = 'Workspace synced') {
    const syncedAt = new Date().toISOString()
    localStorage.setItem(LAST_SYNCED_KEY, syncedAt)
    setLastSyncedAt(syncedAt)
    setSyncStatus('synced')
    setSyncMessage(message)
  }

  const filteredSystems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return systems
    }

    return systems.filter((system) => {
      const haystack = [
        system.name,
        system.category,
        system.description,
        system.notes,
        system.tags.join(' '),
      ].join(' ')
      const nameMatch = fuzzyIncludes(system.name, query)
      const categoryMatch = fuzzyIncludes(system.category, query)
      const tagMatch = system.tags.some((tag) =>
        fuzzyIncludes(tag, query),
      )

      return nameMatch || categoryMatch || tagMatch || fuzzyIncludes(haystack, query)
    })
  }, [searchQuery, systems])

  const searchResults = useMemo(
    () => (searchQuery.trim() ? filteredSystems.slice(0, 6) : []),
    [filteredSystems, searchQuery],
  )

  const favoriteSystems = useMemo(
    () =>
      filteredSystems
        .filter((system) => system.favorite)
        .sort((first, second) => first.favoriteOrder - second.favoriteOrder),
    [filteredSystems],
  )

  const pinnedSystems = useMemo(
    () =>
      filteredSystems
        .filter((system) => system.pinned)
        .sort((first, second) => first.pinnedOrder - second.pinnedOrder),
    [filteredSystems],
  )

  const sortedCollections = useMemo(
    () => collections.slice().sort((first, second) => first.order - second.order),
    [collections],
  )

  const recentSystems = useMemo(
    () =>
      systems
        .filter((system) => system.recent || system.openedAt)
        .sort(
          (first, second) =>
            new Date(second.openedAt ?? second.createdAt).getTime() -
            new Date(first.openedAt ?? first.createdAt).getTime(),
        )
        .slice(0, 6),
    [systems],
  )

  const activeSystems = useMemo(
    () =>
      filteredSystems
        .slice()
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime(),
        ),
    [filteredSystems],
  )

  const editedSystems = useMemo(
    () =>
      systems
        .filter((system) => system.editedAt)
        .sort(
          (first, second) =>
            new Date(second.editedAt ?? 0).getTime() -
            new Date(first.editedAt ?? 0).getTime(),
        )
        .slice(0, 6),
    [systems],
  )

  const mostUsedSystems = useMemo(
    () =>
      systems
        .filter((system) => system.openCount > 0)
        .sort((first, second) => second.openCount - first.openCount)
        .slice(0, 6),
    [systems],
  )

  function addSystem(input: WorkspaceSystemInput) {
    if (!validateWorkspaceUrl(input.url)) {
      return false
    }

    const now = new Date().toISOString()
    const nextSystem: WorkspaceSystem = {
      ...input,
      id: createId(),
      url: normalizeUrl(input.url),
      recent: false,
      favoriteOrder: input.favorite ? systems.length + 1 : 0,
      pinnedOrder: input.pinned ? systems.length + 1 : 0,
      openCount: 0,
      createdAt: now,
    }

    setSystems((currentSystems) => [nextSystem, ...currentSystems])
    const shouldSync = beginCloudOperation('Pending Sync - saving system')
    if (!shouldSync) {
      return true
    }
    void createWorkspaceSystem(nextSystem)
      .then((result) => {
        if (result.mode === 'cloud') {
          setSystems((currentSystems) =>
            currentSystems.map((system) =>
              system.id === nextSystem.id ? result.data : system,
            ),
          )
          finishCloudOperation('System saved to cloud')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud save failed'))
    return true
  }

  function updateSystem(id: string, input: WorkspaceSystemInput) {
    if (!validateWorkspaceUrl(input.url)) {
      return false
    }

    const editedAt = new Date().toISOString()

    setSystems((currentSystems) =>
      currentSystems.map((system) =>
        system.id === id
          ? {
              ...system,
              ...input,
              editedAt,
              url: normalizeUrl(input.url),
            }
          : system,
      ),
    )
    const shouldSync = beginCloudOperation('Pending Sync - updating system')
    if (!shouldSync) {
      return true
    }
    void updateWorkspaceSystem(id, {
      ...input,
      editedAt,
      url: normalizeUrl(input.url),
    })
      .then((result) => {
        if (result.mode === 'cloud') {
          finishCloudOperation('System updated in cloud')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud update failed'))
    return true
  }

  function deleteSystem(id: string) {
    setSystems((currentSystems) =>
      currentSystems.filter((system) => system.id !== id),
    )
    const shouldSync = beginCloudOperation('Pending Sync - deleting system')
    if (!shouldSync) {
      return
    }
    void deleteWorkspaceSystem(id)
      .then((result) => {
        if (result.mode === 'cloud') {
          finishCloudOperation('System deleted from cloud')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud delete failed'))
  }

  function toggleFavorite(id: string) {
    const system = systems.find((item) => item.id === id)
    const nextFavorite = !system?.favorite
    setSystems((currentSystems) =>
      currentSystems.map((system) =>
        system.id === id
          ? {
              ...system,
              favorite: !system.favorite,
              favoriteOrder: system.favorite ? 0 : currentSystems.length + 1,
            }
          : system,
      ),
    )
    const shouldSync = beginCloudOperation('Pending Sync - updating starred')
    if (!shouldSync) {
      return
    }
    void updateWorkspaceSystem(id, {
      favorite: nextFavorite,
      favoriteOrder: nextFavorite ? systems.length + 1 : 0,
    })
      .then((result) => {
        if (result.mode === 'cloud') {
          finishCloudOperation('Favorite saved to cloud')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud favorite update failed'))
  }

  function togglePinned(id: string) {
    const system = systems.find((item) => item.id === id)
    const nextPinned = !system?.pinned
    setSystems((currentSystems) =>
      currentSystems.map((system) =>
        system.id === id
          ? {
              ...system,
              pinned: !system.pinned,
              pinnedOrder: system.pinned ? 0 : currentSystems.length + 1,
            }
          : system,
      ),
    )
    const shouldSync = beginCloudOperation('Pending Sync - updating pinned')
    if (!shouldSync) {
      return
    }
    void updateWorkspaceSystem(id, {
      pinned: nextPinned,
      pinnedOrder: nextPinned ? systems.length + 1 : 0,
    })
      .then((result) => {
        if (result.mode === 'cloud') {
          finishCloudOperation('Pinned state saved to cloud')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud pin update failed'))
  }

  function reorderSystems(kind: 'favorite' | 'pinned', sourceId: string, targetId: string) {
    setSystems((currentSystems) => {
      const eligibleSystems = currentSystems
        .filter((system) => (kind === 'favorite' ? system.favorite : system.pinned))
        .sort((first, second) =>
          kind === 'favorite'
            ? first.favoriteOrder - second.favoriteOrder
            : first.pinnedOrder - second.pinnedOrder,
        )
      const sourceIndex = eligibleSystems.findIndex((system) => system.id === sourceId)
      const targetIndex = eligibleSystems.findIndex((system) => system.id === targetId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return currentSystems
      }

      const nextEligibleSystems = eligibleSystems.slice()
      const [sourceSystem] = nextEligibleSystems.splice(sourceIndex, 1)
      nextEligibleSystems.splice(targetIndex, 0, sourceSystem)

      const orderMap = new Map(
        nextEligibleSystems.map((system, index) => [system.id, index + 1]),
      )

      return currentSystems.map((system) => {
        const nextOrder = orderMap.get(system.id)

        if (!nextOrder) {
          return system
        }

        return kind === 'favorite'
          ? { ...system, favoriteOrder: nextOrder }
          : { ...system, pinnedOrder: nextOrder }
      })
    })
  }

  function addCollection(name: string) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    const nextCollection: WorkspaceCollection = {
      id: createId(),
      name: trimmedName,
      color: 'blue',
      order: collections.length + 1,
    }

    setCollections((currentCollections) => [
      ...currentCollections,
      nextCollection,
    ])
    const shouldSync = beginCloudOperation('Pending Sync - saving collection')
    if (!shouldSync) {
      return
    }
    void createCloudCollection(nextCollection)
      .then((result) => {
        if (result.mode === 'cloud') {
          setCollections((currentCollections) =>
            currentCollections.map((collection) =>
              collection.id === nextCollection.id ? result.data : collection,
            ),
          )
          finishCloudOperation('Collection saved to cloud')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud collection save failed'))
  }

  function reorderCollections(sourceId: string, targetId: string) {
    setCollections((currentCollections) => {
      const sorted = currentCollections
        .slice()
        .sort((first, second) => first.order - second.order)
      const sourceIndex = sorted.findIndex((collection) => collection.id === sourceId)
      const targetIndex = sorted.findIndex((collection) => collection.id === targetId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return currentCollections
      }

      const [sourceCollection] = sorted.splice(sourceIndex, 1)
      sorted.splice(targetIndex, 0, sourceCollection)

      return sorted.map((collection, index) => ({
        ...collection,
        order: index + 1,
      }))
    })
    const collection = collections.find((item) => item.id === sourceId)
    if (collection) {
      void updateCloudCollection(sourceId, collection).catch((error) =>
        handleCloudError(error, 'Cloud collection order update failed'),
      )
    }
  }

  function clearRecentActivity() {
    setSystems((currentSystems) =>
      currentSystems.map((system) => ({
        ...system,
        recent: false,
        openedAt: undefined,
      })),
    )
    systems.forEach((system) => {
      if (system.openedAt) {
        void updateWorkspaceSystem(system.id, {
          openedAt: undefined,
          recent: false,
        }).catch((error) => handleCloudError(error, 'Cloud recent update failed'))
      }
    })
  }

  function exportWorkspaceData(): WorkspaceBackup {
    return {
      collections,
      exportedAt: new Date().toISOString(),
      systems,
      version: 1,
    }
  }

  function importWorkspaceData(backup: WorkspaceBackup) {
    if (!Array.isArray(backup.systems) || !Array.isArray(backup.collections)) {
      return
    }

    setSystems(backup.systems)
    setCollections(backup.collections)
  }

  function resetWorkspace() {
    setSystems(starterSystems)
    setCollections(starterCollections)
    setRecentSearches([])
  }

  function commitSearch(query = searchQuery) {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    setRecentSearches((currentSearches) =>
      [
        trimmedQuery,
        ...currentSearches.filter(
          (search) => search.toLowerCase() !== trimmedQuery.toLowerCase(),
        ),
      ].slice(0, 5),
    )
  }

  function clearRecentSearches() {
    setRecentSearches([])
  }

  function openSystem(system: WorkspaceSystem) {
    const openedAt = new Date().toISOString()
    const nextOpenCount = system.openCount + 1

    setSystems((currentSystems) =>
      currentSystems.map((currentSystem) =>
        currentSystem.id === system.id
          ? {
              ...currentSystem,
              recent: true,
              openedAt,
              openCount: currentSystem.openCount + 1,
            }
          : currentSystem,
      ),
    )
    const shouldSync = beginCloudOperation('Pending Sync - saving activity')
    if (!shouldSync) {
      if (validateWorkspaceUrl(system.url)) {
        window.open(system.url, '_blank', 'noopener,noreferrer')
      }
      return
    }
    void updateWorkspaceSystem(system.id, {
      openCount: nextOpenCount,
      openedAt,
      recent: true,
    })
      .then((result) => {
        if (result.mode === 'cloud') {
          finishCloudOperation('Launch activity saved')
        } else {
          keepPending(result.message ?? 'Pending Sync')
        }
      })
      .catch((error) => handleCloudError(error, 'Cloud launch count update failed'))
    void createActivityLog({
      action: 'opened',
      metadata: {
        category: system.category,
        name: system.name,
      },
      system_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        system.id,
      )
        ? system.id
        : null,
    }).catch((error) => handleCloudError(error, 'Cloud activity log failed'))

    if (validateWorkspaceUrl(system.url)) {
      window.open(system.url, '_blank', 'noopener,noreferrer')
    }
  }

  async function syncLocalToCloud() {
    try {
      setSyncStatus('syncing')
      const result = await syncLocalToCloudService()
      if (result.mode === 'cloud') {
        const refreshed = await syncCloudToLocalService()
        if (refreshed.mode === 'cloud') {
          const [cloudSystems, cloudCollections] = await Promise.all([
            getWorkspaceSystems(),
            getCollections(),
          ])
          if (cloudSystems.mode === 'cloud') {
            setSystems(cloudSystems.data)
          }
          if (cloudCollections.mode === 'cloud') {
            setCollections(cloudCollections.data)
          }
        }
        markSynced(`Synced ${result.data.synced} items`)
        setPendingCount(0)
      } else {
        setSyncStatus('local-only')
        setSyncMessage(result.message ?? `Synced ${result.data.synced} items`)
      }
      setShouldPromptCloudMigration(false)
      return result
    } catch (error) {
      handleCloudError(error, 'Local to cloud sync failed')
      return null
    }
  }

  async function syncCloudToLocal() {
    try {
      setSyncStatus('syncing')
      const result = await syncCloudToLocalService()

      if (result.mode === 'cloud') {
        const [cloudSystems, cloudCollections] = await Promise.all([
          getWorkspaceSystems(),
          getCollections(),
        ])

        if (cloudSystems.mode === 'cloud') {
          setSystems(cloudSystems.data)
        }
        if (cloudCollections.mode === 'cloud') {
          setCollections(cloudCollections.data)
        }
      }

      setSyncStatus(result.mode === 'cloud' ? 'synced' : 'local-only')
      if (result.mode === 'cloud') {
        markSynced(`Refreshed ${result.data.synced} cloud items`)
        setPendingCount(0)
      } else {
        setSyncMessage(result.message ?? `Synced ${result.data.synced} items`)
      }
      return result
    } catch (error) {
      handleCloudError(error, 'Cloud to local sync failed')
      return null
    }
  }

  function dismissCloudMigrationPrompt() {
    setShouldPromptCloudMigration(false)
  }

  return {
    activeSystems,
    addCollection,
    addSystem,
    clearRecentSearches,
    clearRecentActivity,
    collections: sortedCollections,
    commitSearch,
    deleteSystem,
    dismissCloudMigrationPrompt,
    editedSystems,
    exportWorkspaceData,
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
    pendingSyncCount,
    systems,
    toggleFavorite,
    togglePinned,
    updateSystem,
  }
}
