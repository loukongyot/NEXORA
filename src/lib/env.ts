export const supabaseEnv = {
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  url: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
}

export const googleWorkspaceEnv = {
  apiUrl: import.meta.env.VITE_GOOGLE_WORKSPACE_API_URL?.trim() ?? '',
}

export const isSupabaseConfigured = Boolean(
  supabaseEnv.url && supabaseEnv.anonKey,
)

export const isGoogleWorkspaceConfigured = Boolean(
  googleWorkspaceEnv.apiUrl,
)
