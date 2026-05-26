import type {
  WorkspaceCollection,
  WorkspaceColor,
  WorkspaceSystem,
} from './workspace'

export type SupabaseWorkspaceSystem = WorkspaceSystem & {
  updated_at?: string | null
  user_id?: string | null
}

export type SupabaseCollection = WorkspaceCollection & {
  created_at?: string | null
  updated_at?: string | null
  user_id?: string | null
}

export type SupabaseInsight = {
  id: string
  action: string
  color: WorkspaceColor
  created_at: string
  description: string
  kind: 'Prompt' | 'News' | 'Tip' | 'Workflow'
  title: string
}

export type SupabaseActivityLog = {
  id: string
  action: 'created' | 'updated' | 'deleted' | 'opened' | 'synced'
  created_at: string
  metadata: Record<string, unknown> | null
  system_id: string | null
  user_id?: string | null
}

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: SupabaseActivityLog
        Insert: Omit<SupabaseActivityLog, 'id' | 'created_at'> & {
          created_at?: string
          id?: string
        }
        Update: Partial<SupabaseActivityLog>
        Relationships: []
      }
      collections: {
        Row: SupabaseCollection
        Insert: SupabaseCollection
        Update: Partial<SupabaseCollection>
        Relationships: []
      }
      insights: {
        Row: SupabaseInsight
        Insert: SupabaseInsight
        Update: Partial<SupabaseInsight>
        Relationships: []
      }
      workspace_systems: {
        Row: SupabaseWorkspaceSystem
        Insert: SupabaseWorkspaceSystem
        Update: Partial<SupabaseWorkspaceSystem>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

