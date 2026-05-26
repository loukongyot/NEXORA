import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseEnv } from './env'
import type { Database } from '../types/supabase'

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null

export type CloudSyncStatus = 'connected' | 'local'

export const cloudSyncStatus: CloudSyncStatus = isSupabaseConfigured
  ? 'connected'
  : 'local'

