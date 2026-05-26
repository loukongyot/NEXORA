export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SupabaseWorkspaceSystem = {
  category: string
  collection_id: string | null
  color: string | null
  created_at: string
  description: string | null
  favorite: boolean
  icon: string | null
  id: string
  last_opened_at: string | null
  launch_count: number
  name: string
  notes: string | null
  pinned: boolean
  tags: string[]
  updated_at: string
  url: string
}

export type SupabaseWorkspaceSystemInsert = {
  category: string
  collection_id?: string | null
  color?: string | null
  created_at?: string
  description?: string | null
  favorite?: boolean
  icon?: string | null
  id?: string
  last_opened_at?: string | null
  launch_count?: number
  name: string
  notes?: string | null
  pinned?: boolean
  tags?: string[]
  updated_at?: string
  url: string
}

export type SupabaseWorkspaceSystemUpdate =
  Partial<SupabaseWorkspaceSystemInsert>

export type SupabaseCollection = {
  color: string | null
  created_at: string
  icon: string | null
  id: string
  name: string
  sort_order: number
  updated_at: string
}

export type SupabaseCollectionInsert = {
  color?: string | null
  created_at?: string
  icon?: string | null
  id?: string
  name: string
  sort_order?: number
  updated_at?: string
}

export type SupabaseCollectionUpdate = Partial<SupabaseCollectionInsert>

export type SupabaseInsight = {
  active: boolean
  content: string
  created_at: string
  id: string
  source_url: string | null
  tags: string[]
  title: string
  type: string
}

export type SupabaseInsightInsert = {
  active?: boolean
  content: string
  created_at?: string
  id?: string
  source_url?: string | null
  tags?: string[]
  title: string
  type: string
}

export type SupabaseInsightUpdate = Partial<SupabaseInsightInsert>

export type SupabaseActivityLog = {
  action: string
  created_at: string
  id: string
  metadata: Json
  system_id: string | null
}

export type SupabaseActivityLogInsert = {
  action: string
  created_at?: string
  id?: string
  metadata?: Json
  system_id?: string | null
}

export type SupabaseActivityLogUpdate = Partial<SupabaseActivityLogInsert>

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: SupabaseActivityLog
        Insert: SupabaseActivityLogInsert
        Update: SupabaseActivityLogUpdate
        Relationships: []
      }
      collections: {
        Row: SupabaseCollection
        Insert: SupabaseCollectionInsert
        Update: SupabaseCollectionUpdate
        Relationships: []
      }
      insights: {
        Row: SupabaseInsight
        Insert: SupabaseInsightInsert
        Update: SupabaseInsightUpdate
        Relationships: []
      }
      workspace_systems: {
        Row: SupabaseWorkspaceSystem
        Insert: SupabaseWorkspaceSystemInsert
        Update: SupabaseWorkspaceSystemUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

