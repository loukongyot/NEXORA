import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    saveWorkspaceSystems(systems)
  }, [systems])

  useEffect(() => {
    saveWorkspaceCollections(collections)
  }, [collections])

  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

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
    return true
  }

  function deleteSystem(id: string) {
    setSystems((currentSystems) =>
      currentSystems.filter((system) => system.id !== id),
    )
  }

  function toggleFavorite(id: string) {
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
  }

  function togglePinned(id: string) {
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
  }

  function clearRecentActivity() {
    setSystems((currentSystems) =>
      currentSystems.map((system) => ({
        ...system,
        recent: false,
        openedAt: undefined,
      })),
    )
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

    if (validateWorkspaceUrl(system.url)) {
      window.open(system.url, '_blank', 'noopener,noreferrer')
    }
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
    editedSystems,
    exportWorkspaceData,
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
  }
}
