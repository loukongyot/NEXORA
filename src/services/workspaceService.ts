import { supabase } from '../lib/supabase'
import {
  loadWorkspaceSystems,
  saveWorkspaceSystems,
} from '../storage/workspaceStorage'
import type { WorkspaceSystem } from '../types/workspace'

export type WorkspaceServiceResult<T> = {
  data: T
  mode: 'cloud' | 'local'
  message?: string
}

function localModeMessage() {
  return 'Supabase is not configured. NEXORA is using localStorage mode.'
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
    .order('createdAt', { ascending: false })

  if (error) {
    return {
      data: loadWorkspaceSystems(),
      message: error.message,
      mode: 'local',
    }
  }

  return {
    data: data ?? [],
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
    .insert(system)
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

export async function updateWorkspaceSystem(
  id: string,
  updates: Partial<WorkspaceSystem>,
): Promise<WorkspaceServiceResult<WorkspaceSystem | null>> {
  if (!supabase) {
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
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { data, error } = await supabase
    .from('workspace_systems')
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

export async function deleteWorkspaceSystem(
  id: string,
): Promise<WorkspaceServiceResult<string>> {
  if (!supabase) {
    saveWorkspaceSystems(
      loadWorkspaceSystems().filter((system) => system.id !== id),
    )

    return {
      data: id,
      message: localModeMessage(),
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

export async function syncLocalToCloud(): Promise<
  WorkspaceServiceResult<{ synced: number }>
> {
  const localSystems = loadWorkspaceSystems()

  if (!supabase) {
    return {
      data: { synced: 0 },
      message: localModeMessage(),
      mode: 'local',
    }
  }

  const { error } = await supabase
    .from('workspace_systems')
    .upsert(localSystems, { onConflict: 'id' })

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: { synced: localSystems.length },
    mode: 'cloud',
  }
}

export async function syncCloudToLocal(): Promise<
  WorkspaceServiceResult<{ synced: number }>
> {
  const result = await getWorkspaceSystems()

  if (result.mode === 'cloud') {
    saveWorkspaceSystems(result.data)
  }

  return {
    data: { synced: result.mode === 'cloud' ? result.data.length : 0 },
    message: result.message,
    mode: result.mode,
  }
}

