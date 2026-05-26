export const supabaseEnv = {
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  url: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
}

export const isSupabaseConfigured = Boolean(
  supabaseEnv.url && supabaseEnv.anonKey,
)

