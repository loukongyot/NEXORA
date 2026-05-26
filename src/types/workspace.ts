export type WorkspaceCategory =
  | 'Forms'
  | 'Sheets'
  | 'Drive'
  | 'Slides'
  | 'Apps Script'
  | 'AI Tools'
  | 'Output'
  | 'LINE'
  | 'Other'

export type WorkspaceColor = 'pink' | 'blue' | 'purple' | 'brown'

export type WorkspaceTag =
  | 'Daily'
  | 'Important'
  | 'AI'
  | 'Admin'
  | 'Student'
  | 'Active'
  | 'Archive'
  | string

export type WorkspaceSystem = {
  id: string
  name: string
  category: WorkspaceCategory
  url: string
  description: string
  notes: string
  icon: string
  color: WorkspaceColor
  favorite: boolean
  pinned: boolean
  recent: boolean
  tags: WorkspaceTag[]
  collectionId: string
  favoriteOrder: number
  pinnedOrder: number
  editedAt?: string
  openCount: number
  createdAt: string
  openedAt?: string
}

export type WorkspaceSystemInput = Omit<
  WorkspaceSystem,
  | 'id'
  | 'recent'
  | 'favoriteOrder'
  | 'pinnedOrder'
  | 'editedAt'
  | 'openCount'
  | 'createdAt'
  | 'openedAt'
>

export type WorkspaceCollection = {
  id: string
  name: string
  color: WorkspaceColor
  order: number
}

export type WorkspaceBackup = {
  collections: WorkspaceCollection[]
  exportedAt: string
  systems: WorkspaceSystem[]
  version: 1
}
