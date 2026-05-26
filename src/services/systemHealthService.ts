import { APP_BUILD_DATE, APP_VERSION } from '../config/version'
import {
  googleWorkspaceEnv,
  isGoogleWorkspaceConfigured,
  isSupabaseConfigured,
} from '../lib/env'
import { supabase } from '../lib/supabase'
import { fetchGoogleWorkspaceData } from './googleWorkspaceService'
import { testSupabaseConnection } from './workspaceService'

export type SystemHealthState = 'healthy' | 'partial' | 'local' | 'offline' | 'error'
export type StorageMode = 'cloud' | 'local' | 'hybrid' | 'offline'

export type DiagnosticCheck = {
  detail: string
  label: string
  ok: boolean
  status: 'ok' | 'warning' | 'error'
}

export type SystemHealthReport = {
  app: {
    buildDate: string
    version: string
  }
  browserOnline: boolean
  diagnostics: DiagnosticCheck[]
  googleWorkspace: {
    apiUrlDetected: boolean
    message: string
    status: 'connected' | 'missing-url' | 'error' | 'empty'
    validJson: boolean
  }
  lastHealthCheck: string
  localStorage: {
    message: string
    status: 'available' | 'error'
  }
  mode: StorageMode
  overall: SystemHealthState
  pwa: {
    installState: 'standalone' | 'browser'
    message: string
  }
  supabase: {
    envDetected: boolean
    message: string
    status: 'ready' | 'missing-tables' | 'not-configured' | 'error'
    tableCheck: boolean
  }
}

function checkLocalStorage() {
  try {
    const key = 'nexora.health.localStorage'
    localStorage.setItem(key, 'ok')
    localStorage.removeItem(key)

    return {
      message: 'Local Storage พร้อมใช้งาน',
      status: 'available' as const,
    }
  } catch {
    return {
      message: 'Local Storage ไม่พร้อมใช้งาน',
      status: 'error' as const,
    }
  }
}

function checkPwaState() {
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean
  }
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean(navigatorWithStandalone.standalone)

  return {
    installState: isStandalone ? ('standalone' as const) : ('browser' as const),
    message: isStandalone
      ? 'เปิดใช้งานแบบ standalone แล้ว'
      : 'ยังเปิดผ่าน browser',
  }
}

function resolveMode(
  browserOnline: boolean,
  localStorageOk: boolean,
  supabaseReady: boolean,
): StorageMode {
  if (!browserOnline) return 'offline'
  if (supabaseReady && localStorageOk) return 'hybrid'
  if (supabaseReady) return 'cloud'
  return 'local'
}

function resolveOverall(
  mode: StorageMode,
  localStorageOk: boolean,
  supabaseReady: boolean,
  googleOk: boolean,
): SystemHealthState {
  if (mode === 'offline') return 'offline'
  if (!localStorageOk) return 'error'
  if (supabaseReady && googleOk) return 'healthy'
  if (supabaseReady || googleOk) return 'partial'
  return 'local'
}

export async function runFullSystemHealthCheck(): Promise<SystemHealthReport> {
  const browserOnline = window.navigator.onLine
  const localStorageStatus = checkLocalStorage()
  const pwa = checkPwaState()
  const supabaseEnvDetected = isSupabaseConfigured

  let supabaseStatus: SystemHealthReport['supabase']['status'] =
    supabaseEnvDetected ? 'error' : 'not-configured'
  let supabaseMessage = supabaseEnvDetected
    ? 'ยังไม่ได้ตรวจฐานข้อมูล'
    : 'ไม่ได้ตั้งค่า Supabase env'
  let tableCheck = false

  if (supabase && browserOnline) {
    const databaseResult = await testSupabaseConnection()
    tableCheck = databaseResult.status === 'ready'
    supabaseStatus =
      databaseResult.status === 'ready'
        ? 'ready'
        : databaseResult.status === 'missing'
          ? 'missing-tables'
          : 'not-configured'
    supabaseMessage = databaseResult.message
  }

  let googleStatus: SystemHealthReport['googleWorkspace']['status'] =
    isGoogleWorkspaceConfigured ? 'error' : 'missing-url'
  let googleMessage = isGoogleWorkspaceConfigured
    ? 'ยังไม่ได้ตรวจ Google Workspace'
    : 'ยังไม่ได้ตั้งค่า Google Workspace API URL'
  let googleValidJson = false

  if (isGoogleWorkspaceConfigured && browserOnline) {
    const googleResult = await fetchGoogleWorkspaceData()
    googleStatus =
      googleResult.status === 'connected' || googleResult.status === 'empty'
        ? googleResult.status
        : googleResult.status === 'missing-url'
          ? 'missing-url'
          : 'error'
    googleValidJson = Boolean(googleResult.data)
    googleMessage = googleResult.message
  }

  const localStorageOk = localStorageStatus.status === 'available'
  const supabaseReady = tableCheck
  const googleOk = googleStatus === 'connected' || googleStatus === 'empty'
  const mode = resolveMode(browserOnline, localStorageOk, supabaseReady)
  const overall = resolveOverall(mode, localStorageOk, supabaseReady, googleOk)

  const diagnostics: DiagnosticCheck[] = [
    {
      detail: supabaseMessage,
      label: 'Cloud Database',
      ok: supabaseReady,
      status: supabaseReady ? 'ok' : supabaseEnvDetected ? 'warning' : 'warning',
    },
    {
      detail: localStorageStatus.message,
      label: 'Local Storage',
      ok: localStorageOk,
      status: localStorageOk ? 'ok' : 'error',
    },
    {
      detail: googleMessage,
      label: 'Google Workspace',
      ok: googleOk,
      status: googleOk ? 'ok' : isGoogleWorkspaceConfigured ? 'error' : 'warning',
    },
    {
      detail: browserOnline ? 'Browser online' : 'Browser offline',
      label: 'Network',
      ok: browserOnline,
      status: browserOnline ? 'ok' : 'warning',
    },
    {
      detail: pwa.message,
      label: 'PWA',
      ok: pwa.installState === 'standalone',
      status: pwa.installState === 'standalone' ? 'ok' : 'warning',
    },
    {
      detail: supabaseReady ? 'Sync engine can use cloud' : 'Sync engine uses local fallback',
      label: 'Sync Engine',
      ok: localStorageOk,
      status: supabaseReady ? 'ok' : 'warning',
    },
  ]

  return {
    app: {
      buildDate: APP_BUILD_DATE,
      version: APP_VERSION,
    },
    browserOnline,
    diagnostics,
    googleWorkspace: {
      apiUrlDetected: Boolean(googleWorkspaceEnv.apiUrl),
      message: googleMessage,
      status: googleStatus,
      validJson: googleValidJson,
    },
    lastHealthCheck: new Date().toISOString(),
    localStorage: localStorageStatus,
    mode,
    overall,
    pwa,
    supabase: {
      envDetected: supabaseEnvDetected,
      message: supabaseMessage,
      status: supabaseStatus,
      tableCheck,
    },
  }
}
