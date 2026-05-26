import type { WorkspaceCollection, WorkspaceSystem } from '../types/workspace'

const STORAGE_KEY = 'nexora.workspaceSystems.v1'
const COLLECTIONS_KEY = 'nexora.workspaceCollections.v1'

export const starterCollections: WorkspaceCollection[] = [
  { id: 'collection-admissions', name: 'Admissions', color: 'pink', order: 1 },
  { id: 'collection-reports', name: 'Reports', color: 'blue', order: 2 },
  {
    id: 'collection-student-systems',
    name: 'Student Systems',
    color: 'brown',
    order: 3,
  },
  {
    id: 'collection-ai-workspace',
    name: 'AI Workspace',
    color: 'purple',
    order: 4,
  },
  { id: 'collection-admin', name: 'Admin', color: 'blue', order: 5 },
]

export const starterSystems: WorkspaceSystem[] = [
  {
    id: 'starter-master-directory',
    name: 'Master Directory',
    category: 'Drive',
    url: 'https://drive.google.com',
    description: 'Central map for every school system link.',
    notes: 'Use this as the source of truth for all workspace links.',
    icon: 'Drive',
    color: 'blue',
    favorite: true,
    pinned: true,
    recent: true,
    tags: ['Important', 'Admin', 'Active'],
    collectionId: 'collection-admin',
    favoriteOrder: 1,
    pinnedOrder: 1,
    openCount: 3,
    createdAt: '2026-05-26T00:00:00.000Z',
    openedAt: '2026-05-26T00:00:00.000Z',
  },
  {
    id: 'starter-daily-form-hub',
    name: 'Daily Form Hub',
    category: 'Forms',
    url: 'https://forms.google.com',
    description: 'Frequently used Google Forms for daily operations.',
    notes: 'Pin daily forms here as the workspace grows.',
    icon: 'Forms',
    color: 'pink',
    favorite: true,
    pinned: false,
    recent: false,
    tags: ['Daily', 'Student', 'Active'],
    collectionId: 'collection-student-systems',
    favoriteOrder: 2,
    pinnedOrder: 0,
    openCount: 1,
    createdAt: '2026-05-26T00:01:00.000Z',
  },
  {
    id: 'starter-ai-toolkit',
    name: 'AI Toolkit',
    category: 'AI Tools',
    url: 'https://chatgpt.com',
    description: 'Prompts and generators for classroom workflows.',
    notes: 'Future AI prompt packs can be grouped in AI Workspace.',
    icon: 'AI Tools',
    color: 'purple',
    favorite: true,
    pinned: true,
    recent: true,
    tags: ['AI', 'Important', 'Active'],
    collectionId: 'collection-ai-workspace',
    favoriteOrder: 3,
    pinnedOrder: 2,
    openCount: 2,
    createdAt: '2026-05-26T00:02:00.000Z',
    openedAt: '2026-05-26T00:02:00.000Z',
  },
  {
    id: 'starter-output-folder',
    name: 'Student Output Folder',
    category: 'Output',
    url: 'https://drive.google.com',
    description: 'Latest exports, PDFs, and generated files.',
    notes: 'Archive generated outputs by project or month.',
    icon: 'Output',
    color: 'brown',
    favorite: false,
    pinned: false,
    recent: false,
    tags: ['Student', 'Archive'],
    collectionId: 'collection-reports',
    favoriteOrder: 0,
    pinnedOrder: 0,
    openCount: 0,
    createdAt: '2026-05-26T00:03:00.000Z',
  },
]

export function loadWorkspaceSystems() {
  try {
    const savedSystems = localStorage.getItem(STORAGE_KEY)

    if (!savedSystems) {
      return starterSystems
    }

    const parsedSystems = JSON.parse(savedSystems)

    if (!Array.isArray(parsedSystems)) {
      return starterSystems
    }

    return parsedSystems.map((system) => ({
      ...system,
      notes: typeof system.notes === 'string' ? system.notes : '',
      pinned: Boolean(system.pinned),
      tags: Array.isArray(system.tags) ? system.tags : [],
      collectionId:
        typeof system.collectionId === 'string' ? system.collectionId : '',
      favoriteOrder:
        typeof system.favoriteOrder === 'number' ? system.favoriteOrder : 0,
      pinnedOrder:
        typeof system.pinnedOrder === 'number' ? system.pinnedOrder : 0,
      openCount: typeof system.openCount === 'number' ? system.openCount : 0,
    })) as WorkspaceSystem[]
  } catch {
    return starterSystems
  }
}

export function saveWorkspaceSystems(systems: WorkspaceSystem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(systems))
}

export function loadWorkspaceCollections() {
  try {
    const savedCollections = localStorage.getItem(COLLECTIONS_KEY)

    if (!savedCollections) {
      return starterCollections
    }

    const parsedCollections = JSON.parse(savedCollections)

    if (!Array.isArray(parsedCollections)) {
      return starterCollections
    }

    return parsedCollections.map((collection, index) => ({
      id:
        typeof collection.id === 'string'
          ? collection.id
          : `collection-${index}`,
      name: typeof collection.name === 'string' ? collection.name : 'Untitled',
      color: collection.color ?? 'blue',
      order: typeof collection.order === 'number' ? collection.order : index + 1,
    })) as WorkspaceCollection[]
  } catch {
    return starterCollections
  }
}

export function saveWorkspaceCollections(collections: WorkspaceCollection[]) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections))
}
