import { supabase } from '../lib/supabase'
import {
  loadWorkspaceCollections,
  loadWorkspaceSystems,
  saveWorkspaceCollections,
  saveWorkspaceSystems,
} from '../storage/workspaceStorage'
import type {
  Json,
  SupabaseActivityLog,
  SupabaseActivityLogInsert,
  SupabaseActivityLogUpdate,
  SupabaseCollection,
  SupabaseCollectionInsert,
  SupabaseCollectionUpdate,
  SupabaseInsight,
  SupabaseInsightInsert,
  SupabaseInsightUpdate,
  SupabaseWorkspaceSystem,
  SupabaseWorkspaceSystemInsert,
  SupabaseWorkspaceSystemUpdate,
} from '../types/supabase'
import type {
  WorkspaceCategory,
  WorkspaceCollection,
  WorkspaceColor,
  WorkspaceSystem,
} from '../types/workspace'

export type WorkspaceServiceResult<T> = {
  data: T
  mode: 'cloud' | 'local'
  message?: string
}

export type DatabaseTestStatus = 'ready' | 'missing' | 'local'

export type DatabaseTestResult = {
  message: string
  status: DatabaseTestStatus
}

function localModeMessage() {
  return 'Supabase is not configured. NEXORA is using localStorage mode.'
}

function systemSignature(system: Pick<WorkspaceSystem, 'name' | 'url'>) {
  return `${system.name.trim().toLowerCase()}::${system.url.trim().toLowerCase()}`
}

function mergeSystems(
  localSystems: WorkspaceSystem[],
  cloudSystems: WorkspaceSystem[],
) {
  const mergedSystems = new Map<string, WorkspaceSystem>()

  localSystems.forEach((system) => {
    mergedSystems.set(systemSignature(system), system)
  })

  cloudSystems.forEach((system) => {
    const signature = systemSignature(system)
    const existingSystem = mergedSystems.get(signature)

    if (!existingSystem) {
      mergedSystems.set(signature, system)
      return
    }

    const existingTime = new Date(
      existingSystem.editedAt ??
        existingSystem.openedAt ??
        existingSystem.createdAt,
    ).getTime()
    const cloudTime = new Date(
      system.editedAt ?? system.openedAt ?? system.createdAt,
    ).getTime()

    mergedSystems.set(signature, cloudTime >= existingTime ? system : existingSystem)
  })

  return Array.from(mergedSystems.values()).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  )
}

function mergeCollections(
  localCollections: WorkspaceCollection[],
  cloudCollections: WorkspaceCollection[],
) {
  const mergedCollections = new Map<string, WorkspaceCollection>()

  localCollections.forEach((collection) => {
    mergedCollections.set(collection.name.trim().toLowerCase(), collection)
  })

  cloudCollections.forEach((collection) => {
    mergedCollections.set(collection.name.trim().toLowerCase(), collection)
  })

  return Array.from(mergedCollections.values()).sort(
    (first, second) => first.order - second.order,
  )
}

function dbSystemSignature(system: SupabaseWorkspaceSystem) {
  return `${system.name.trim().toLowerCase()}::${system.url.trim().toLowerCase()}`
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function colorFromValue(value: string | null): WorkspaceColor {
  if (value === 'pink' || value === 'blue' || value === 'purple' || value === 'brown') {
    return value
  }

  return 'blue'
}

function categoryFromValue(value: string): WorkspaceCategory {
  const categories: WorkspaceCategory[] = [
    'Forms',
    'Sheets',
    'Drive',
    'Slides',
    'Apps Script',
    'AI Tools',
    'Output',
    'LINE',
    'Other',
  ]

  return categories.includes(value as WorkspaceCategory)
    ? (value as WorkspaceCategory)
    : 'Other'
}

function toDbWorkspaceSystem(
  system: WorkspaceSystem,
): SupabaseWorkspaceSystemInsert {
  return {
    category: system.category,
    collection_id:
      system.collectionId && isUuid(system.collectionId)
        ? system.collectionId
        : null,
    color: system.color,
    created_at: system.createdAt,
    description: system.description,
    favorite: system.favorite,
    icon: system.icon,
    id: isUuid(system.id) ? system.id : undefined,
    last_opened_at: system.openedAt ?? null,
    launch_count: system.openCount,
    name: system.name,
    notes: system.notes,
    pinned: system.pinned,
    tags: system.tags,
    url: system.url,
  }
}

function fromDbWorkspaceSystem(row: SupabaseWorkspaceSystem): WorkspaceSystem {
  return {
    category: categoryFromValue(row.category),
    collectionId: row.collection_id ?? '',
    color: colorFromValue(row.color),
    createdAt: row.created_at,
    description: row.description ?? '',
    favorite: row.favorite,
    favoriteOrder: row.favorite ? 1 : 0,
    icon: row.icon ?? row.category,
    id: row.id,
    notes: row.notes ?? '',
    openCount: row.launch_count,
    openedAt: row.last_opened_at ?? undefined,
    pinned: row.pinned,
    pinnedOrder: row.pinned ? 1 : 0,
    recent: Boolean(row.last_opened_at),
    tags: row.tags ?? [],
    url: row.url,
    name: row.name,
  }
}

function toDbCollection(
  collection: WorkspaceCollection,
): SupabaseCollectionInsert {
  return {
    color: collection.color,
    id: isUuid(collection.id) ? collection.id : undefined,
    name: collection.name,
    sort_order: collection.order,
  }
}

function fromDbCollection(row: SupabaseCollection): WorkspaceCollection {
  return {
    color: colorFromValue(row.color),
    id: row.id,
    name: row.name,
    order: row.sort_order,
  }
}

export async function testSupabaseConnection(): Promise<DatabaseTestResult> {
  if (!supabase) {
    return {
      message: 'Local Mode',
      status: 'local',
    }
  }

  const { error } = await supabase.from('workspace_systems').select('id').limit(1)

  if (error) {
    return {
      message: 'Tables Missing',
      status: 'missing',
    }
  }

  return {
    message: 'Database Ready',
    status: 'ready',
  }
}

export async function getWorkspaceSystems(): Promise<
  WorkspaceServiceResult<WorkspaceSystem[]>
> {
  if (!supabase) {
    return {
      data: loadWorkspaceSystems(),
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('workspace_systems')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return {
      data: loadWorkspaceSystems(),
      message: error.message,
      mode: 'local',
    }
  }

  return {
    data: (data ?? []).map(fromDbWorkspaceSystem),
    mode: 'cloud',
  }
}

export async function createWorkspaceSystem(
  system: WorkspaceSystem,
): Promise<WorkspaceServiceResult<WorkspaceSystem>> {
  if (!supabase) {
    const systems = [system, ...loadWorkspaceSystems()]
    saveWorkspaceSystems(systems)

    return {
      data: system,
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('workspace_systems')
    .insert(toDbWorkspaceSystem(system))
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: fromDbWorkspaceSystem(data),
    mode: 'cloud',
  }
}

export async function updateWorkspaceSystem(
  id: string,
  updates: Partial<WorkspaceSystem>,
): Promise<WorkspaceServiceResult<WorkspaceSystem | null>> {
  if (!supabase || !isUuid(id)) {
    const systems = loadWorkspaceSystems()
    let updatedSystem: WorkspaceSystem | null = null
    const nextSystems = systems.map((system) => {
      if (system.id !== id) {
        return system
      }

      updatedSystem = { ...system, ...updates }
      return updatedSystem
    })

    saveWorkspaceSystems(nextSystems)

    return {
      data: updatedSystem,
      message: !supabase
        ? localModeMessage()
        : 'Legacy local item will sync after cloud migration.',
      mode: 'local',
    }
  }

  const updateInput: SupabaseWorkspaceSystemUpdate = {}

  if (updates.name !== undefined) updateInput.name = updates.name
  if (updates.category !== undefined) updateInput.category = updates.category
  if (updates.url !== undefined) updateInput.url = updates.url
  if (updates.description !== undefined) updateInput.description = updates.description
  if (updates.icon !== undefined) updateInput.icon = updates.icon
  if (updates.color !== undefined) updateInput.color = updates.color
  if (updates.tags !== undefined) updateInput.tags = updates.tags
  if (updates.favorite !== undefined) updateInput.favorite = updates.favorite
  if (updates.pinned !== undefined) updateInput.pinned = updates.pinned
  if (updates.collectionId !== undefined) {
    updateInput.collection_id =
      updates.collectionId && isUuid(updates.collectionId)
        ? updates.collectionId
        : null
  }
  if (updates.notes !== undefined) updateInput.notes = updates.notes
  if (updates.openCount !== undefined) updateInput.launch_count = updates.openCount
  if (updates.openedAt !== undefined) {
    updateInput.last_opened_at = updates.openedAt ?? null
  }

  const { data, error } = await supabase
    .from('workspace_systems')
    .update(updateInput)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: fromDbWorkspaceSystem(data),
    mode: 'cloud',
  }
}

export async function deleteWorkspaceSystem(
  id: string,
): Promise<WorkspaceServiceResult<string>> {
  if (!supabase || !isUuid(id)) {
    saveWorkspaceSystems(
      loadWorkspaceSystems().filter((system) => system.id !== id),
    )

    return {
      data: id,
      message: !supabase
        ? localModeMessage()
        : 'Legacy local item was deleted locally.',
      mode: 'local',
    }
  }

  const { error } = await supabase.from('workspace_systems').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: id,
    mode: 'cloud',
  }
}

export async function getCollections(): Promise<
  WorkspaceServiceResult<WorkspaceCollection[]>
> {
  if (!supabase) {
    return {
      data: loadWorkspaceCollections(),
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return {
      data: loadWorkspaceCollections(),
      message: error.message,
      mode: 'local',
    }
  }

  return {
    data: (data ?? []).map(fromDbCollection),
    mode: 'cloud',
  }
}

export async function createCollection(
  collection: WorkspaceCollection,
): Promise<WorkspaceServiceResult<WorkspaceCollection>> {
  if (!supabase) {
    const collections = [...loadWorkspaceCollections(), collection]
    saveWorkspaceCollections(collections)

    return {
      data: collection,
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('collections')
    .insert(toDbCollection(collection))
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: fromDbCollection(data),
    mode: 'cloud',
  }
}

export async function updateCollection(
  id: string,
  updates: Partial<WorkspaceCollection>,
): Promise<WorkspaceServiceResult<WorkspaceCollection | null>> {
  if (!supabase || !isUuid(id)) {
    const collections = loadWorkspaceCollections()
    let updatedCollection: WorkspaceCollection | null = null
    const nextCollections = collections.map((collection) => {
      if (collection.id !== id) {
        return collection
      }

      updatedCollection = { ...collection, ...updates }
      return updatedCollection
    })

    saveWorkspaceCollections(nextCollections)

    return {
      data: updatedCollection,
      message: !supabase
        ? localModeMessage()
        : 'Legacy local collection will sync after cloud migration.',
      mode: 'local',
    }
  }

  const updateInput: SupabaseCollectionUpdate = {
    color: updates.color,
    name: updates.name,
    sort_order: updates.order,
  }

  const { data, error } = await supabase
    .from('collections')
    .update(updateInput)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: fromDbCollection(data),
    mode: 'cloud',
  }
}

export async function deleteCollection(
  id: string,
): Promise<WorkspaceServiceResult<string>> {
  if (!supabase || !isUuid(id)) {
    saveWorkspaceCollections(
      loadWorkspaceCollections().filter((collection) => collection.id !== id),
    )

    return {
      data: id,
      message: !supabase
        ? localModeMessage()
        : 'Legacy local collection was deleted locally.',
      mode: 'local',
    }
  }

  const { error } = await supabase.from('collections').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: id,
    mode: 'cloud',
  }
}

export async function getInsights(): Promise<
  WorkspaceServiceResult<SupabaseInsight[]>
> {
  if (!supabase) {
    return {
      data: [],
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return {
      data: [],
      message: error.message,
      mode: 'local',
    }
  }

  return {
    data: data ?? [],
    mode: 'cloud',
  }
}

export async function createInsight(
  insight: SupabaseInsightInsert,
): Promise<WorkspaceServiceResult<SupabaseInsight>> {
  if (!supabase) {
    return {
      data: {
        active: insight.active ?? true,
        content: insight.content,
        created_at: insight.created_at ?? new Date().toISOString(),
        id: insight.id ?? `local-insight-${Date.now()}`,
        source_url: insight.source_url ?? null,
        tags: insight.tags ?? [],
        title: insight.title,
        type: insight.type,
      },
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('insights')
    .insert(insight)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data,
    mode: 'cloud',
  }
}

export async function updateInsight(
  id: string,
  updates: SupabaseInsightUpdate,
): Promise<WorkspaceServiceResult<SupabaseInsight | null>> {
  if (!supabase) {
    return {
      data: null,
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('insights')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data,
    mode: 'cloud',
  }
}

export async function deleteInsight(
  id: string,
): Promise<WorkspaceServiceResult<string>> {
  if (!supabase) {
    return {
      data: id,
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { error } = await supabase.from('insights').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: id,
    mode: 'cloud',
  }
}

export async function getActivityLogs(): Promise<
  WorkspaceServiceResult<SupabaseActivityLog[]>
> {
  if (!supabase) {
    return {
      data: [],
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return {
      data: [],
      message: error.message,
      mode: 'local',
    }
  }

  return {
    data: data ?? [],
    mode: 'cloud',
  }
}

export async function createActivityLog(
  log: SupabaseActivityLogInsert,
): Promise<WorkspaceServiceResult<SupabaseActivityLog>> {
  if (!supabase) {
    return {
      data: {
        action: log.action,
        created_at: log.created_at ?? new Date().toISOString(),
        id: log.id ?? `local-log-${Date.now()}`,
        metadata: log.metadata ?? {},
        system_id: log.system_id ?? null,
      },
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data,
    mode: 'cloud',
  }
}

export async function updateActivityLog(
  id: string,
  updates: SupabaseActivityLogUpdate,
): Promise<WorkspaceServiceResult<SupabaseActivityLog | null>> {
  if (!supabase) {
    return {
      data: null,
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    data,
    mode: 'cloud',
  }
}

export async function deleteActivityLog(
  id: string,
): Promise<WorkspaceServiceResult<string>> {
  if (!supabase) {
    return {
      data: id,
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { error } = await supabase.from('activity_logs').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: id,
    mode: 'cloud',
  }
}

export async function syncLocalToCloud(): Promise<
  WorkspaceServiceResult<{ synced: number }>
> {
  const localSystems = loadWorkspaceSystems()
  const localCollections = loadWorkspaceCollections()

  if (!supabase) {
    return {
      data: { synced: 0 },
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const [{ data: cloudSystems, error: systemsReadError }, { data: cloudCollections, error: collectionsReadError }] =
    await Promise.all([
      supabase.from('workspace_systems').select('*'),
      supabase.from('collections').select('*'),
    ])

  if (systemsReadError) {
    throw new Error(systemsReadError.message)
  }

  if (collectionsReadError) {
    throw new Error(collectionsReadError.message)
  }

  const cloudSystemSignatures = new Set(
    (cloudSystems ?? []).map(dbSystemSignature),
  )
  const cloudCollectionNames = new Set(
    (cloudCollections ?? []).map((collection) =>
      collection.name.trim().toLowerCase(),
    ),
  )

  const validCollections = localCollections
    .filter(
      (collection) =>
        isUuid(collection.id) ||
        !cloudCollectionNames.has(collection.name.trim().toLowerCase()),
    )
    .map(toDbCollection)
    .map((collection): SupabaseCollectionInsert => {
      if (collection.id) {
        return collection
      }

      const collectionWithoutId = { ...collection }
      delete collectionWithoutId.id
      return collectionWithoutId
    })

  const validSystems = localSystems
    .filter(
      (system) =>
        isUuid(system.id) || !cloudSystemSignatures.has(systemSignature(system)),
    )
    .map(toDbWorkspaceSystem)
    .map((system): SupabaseWorkspaceSystemInsert => {
      if (system.id) {
        return system
      }

      const systemWithoutId = { ...system }
      delete systemWithoutId.id
      return systemWithoutId
    })

  if (validCollections.length > 0) {
    const { error } = await supabase
      .from('collections')
      .upsert(validCollections, { onConflict: 'id' })

    if (error) {
      throw new Error(error.message)
    }
  }

  if (validSystems.length > 0) {
    const { error } = await supabase
      .from('workspace_systems')
      .upsert(validSystems, { onConflict: 'id' })

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    data: { synced: validSystems.length + validCollections.length },
    mode: 'cloud',
  }
}

export async function syncCloudToLocal(): Promise<
  WorkspaceServiceResult<{ synced: number }>
> {
  const localSystems = loadWorkspaceSystems()
  const localCollections = loadWorkspaceCollections()
  const [systemsResult, collectionsResult] = await Promise.all([
    getWorkspaceSystems(),
    getCollections(),
  ])

  let nextSystems = localSystems
  let nextCollections = localCollections

  if (systemsResult.mode === 'cloud') {
    nextSystems = mergeSystems(localSystems, systemsResult.data)
    saveWorkspaceSystems(nextSystems)
  }

  if (collectionsResult.mode === 'cloud') {
    nextCollections = mergeCollections(localCollections, collectionsResult.data)
    saveWorkspaceCollections(nextCollections)
  }

  return {
    data: {
      synced:
        systemsResult.mode === 'cloud'
          ? nextSystems.length + nextCollections.length
          : 0,
    },
    message: systemsResult.message ?? collectionsResult.message,
    mode: systemsResult.mode === 'cloud' ? 'cloud' : 'local',
  }
}

export function createJsonMetadata(metadata: Record<string, unknown>): Json {
  return metadata as Json
}
