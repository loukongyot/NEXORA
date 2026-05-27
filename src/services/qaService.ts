import { APP_BUILD_DATE, APP_VERSION } from '../config/version'
import { isGoogleWorkspaceConfigured, isSupabaseConfigured } from '../lib/env'
import { supabase } from '../lib/supabase'
import {
  detectGoogleFileType,
  extractGoogleFileId,
  googleLinkToDriveMetadata,
} from './googleDriveService'
import { fetchGoogleWorkspaceData } from './googleWorkspaceService'

const QA_METRICS_KEY = 'nexora.qa.metrics.v1'

export type QaStatus = 'passed' | 'warning' | 'failed'

export type QaCheckResult = {
  detail: string
  durationMs: number
  logs: string[]
  name: string
  recommendation?: string
  status: QaStatus
}

export type QaRuntimeMetrics = {
  apiLatencyMs: number
  cacheRestoreCount: number
  failedFetchCount: number
  syncFailureCount: number
}

export type QaDeviceInfo = {
  browser: string
  online: boolean
  os: string
  pwaMode: 'browser' | 'standalone'
  screenSize: string
  viewport: string
}

export type QaReport = {
  app: {
    buildDate: string
    version: string
  }
  checks: QaCheckResult[]
  device: QaDeviceInfo
  finishedAt: string
  metrics: QaRuntimeMetrics
  progress: number
  recommendations: string[]
  startedAt: string
}

function readMetrics(): QaRuntimeMetrics {
  try {
    const saved = localStorage.getItem(QA_METRICS_KEY)
    if (!saved) {
      return {
        apiLatencyMs: 0,
        cacheRestoreCount: 0,
        failedFetchCount: 0,
        syncFailureCount: 0,
      }
    }

    return JSON.parse(saved) as QaRuntimeMetrics
  } catch {
    return {
      apiLatencyMs: 0,
      cacheRestoreCount: 0,
      failedFetchCount: 0,
      syncFailureCount: 0,
    }
  }
}

function saveMetrics(metrics: QaRuntimeMetrics) {
  localStorage.setItem(QA_METRICS_KEY, JSON.stringify(metrics))
}

function detectBrowser() {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Edg/')) return 'Microsoft Edge'
  if (userAgent.includes('Chrome/')) return 'Chrome'
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari'
  if (userAgent.includes('Firefox/')) return 'Firefox'
  return 'Unknown browser'
}

function detectOs() {
  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS'
  if (userAgent.includes('android')) return 'Android'
  if (platform.includes('win')) return 'Windows'
  if (platform.includes('mac')) return 'macOS'
  return 'Unknown OS'
}

function getDeviceInfo(): QaDeviceInfo {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

  return {
    browser: detectBrowser(),
    online: navigator.onLine,
    os: detectOs(),
    pwaMode: standalone ? 'standalone' : 'browser',
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  }
}

async function timedCheck(
  name: string,
  check: () => Promise<Omit<QaCheckResult, 'durationMs' | 'name'>>,
): Promise<QaCheckResult> {
  const started = performance.now()
  try {
    const result = await check()
    return {
      ...result,
      durationMs: Math.round(performance.now() - started),
      name,
    }
  } catch (error) {
    return {
      detail: error instanceof Error ? error.message : 'Unexpected QA error',
      durationMs: Math.round(performance.now() - started),
      logs: ['QA check failed safely without crashing the app.'],
      name,
      recommendation: 'ตรวจรายละเอียด error แล้วลองรัน QA อีกครั้ง',
      status: 'failed',
    }
  }
}

async function cloudSyncTest() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      detail: 'Supabase env not configured. localStorage fallback is active.',
      logs: ['Cloud read/write skipped because Supabase is optional.'],
      recommendation: 'ตั้งค่า Supabase env เมื่อต้องการ cloud sync จริง',
      status: 'warning' as const,
    }
  }

  const { error } = await supabase.from('workspace_systems').select('id').limit(1)
  const lastSyncedAt = localStorage.getItem('nexora.lastSyncedAt.v1')

  if (error) {
    return {
      detail: error.message,
      logs: ['Supabase table query failed.'],
      recommendation: 'ตรวจ schema.sql และ RLS/auth settings ก่อนใช้งานจริง',
      status: 'failed' as const,
    }
  }

  const { data: writeData, error: writeError } = await supabase
    .from('activity_logs')
    .insert({
      action: 'qa_check',
      metadata: { source: 'NEXORA QA', timestamp: new Date().toISOString() },
      system_id: null,
    })
    .select('id')
    .single()

  if (writeError) {
    return {
      detail: `Read OK, write failed: ${writeError.message}`,
      logs: ['Supabase read test passed.', 'Supabase activity_logs write failed.'],
      recommendation: 'ตรวจ activity_logs table และ insert permission/RLS',
      status: 'warning' as const,
    }
  }

  if (writeData?.id) {
    await supabase.from('activity_logs').delete().eq('id', writeData.id)
  }

  return {
    detail: lastSyncedAt
      ? `Cloud read/write OK. Last sync: ${lastSyncedAt}`
      : 'Cloud read/write OK. Sync timestamp not found yet.',
    logs: [
      'Supabase read test passed.',
      'Supabase write/delete smoke test passed.',
      `Sync timestamp: ${lastSyncedAt ?? 'none'}`,
    ],
    recommendation: lastSyncedAt ? undefined : 'ลอง sync workspace หนึ่งครั้งเพื่อสร้าง timestamp',
    status: lastSyncedAt ? ('passed' as const) : ('warning' as const),
  }
}

async function googleWorkspaceApiTest(metrics: QaRuntimeMetrics) {
  if (!isGoogleWorkspaceConfigured) {
    return {
      detail: 'Google Workspace API URL is missing.',
      logs: ['VITE_GOOGLE_WORKSPACE_API_URL not detected.'],
      recommendation: 'เพิ่ม Apps Script Web App URL ใน env production',
      status: 'warning' as const,
    }
  }

  const started = performance.now()
  const result = await fetchGoogleWorkspaceData()
  const latency = Math.round(performance.now() - started)
  metrics.apiLatencyMs = latency

  if (result.realtimeStatus === 'failed') {
    metrics.failedFetchCount += 1
  }
  if (result.realtimeStatus === 'stale') {
    metrics.cacheRestoreCount += 1
  }

  return {
    detail: `${result.message} (${latency}ms)`,
    logs: [
      `Realtime status: ${result.realtimeStatus}`,
      `JSON format: ${result.data ? 'valid' : 'unavailable'}`,
    ],
    recommendation:
      latency > 2500 ? 'Google API response slow - ตรวจ Apps Script query/load' : undefined,
    status:
      result.status === 'connected' || result.status === 'empty'
        ? latency > 2500
          ? ('warning' as const)
          : ('passed' as const)
        : result.realtimeStatus === 'stale'
          ? ('warning' as const)
          : ('failed' as const),
  }
}

async function localStorageTest() {
  const key = 'nexora.qa.localStorage'
  localStorage.setItem(key, 'ok')
  const value = localStorage.getItem(key)
  localStorage.removeItem(key)

  return {
    detail: value === 'ok' ? 'write/read/remove OK' : 'localStorage value mismatch',
    logs: ['localStorage smoke test completed.'],
    recommendation: value === 'ok' ? undefined : 'ตรวจ browser privacy/storage settings',
    status: value === 'ok' ? ('passed' as const) : ('failed' as const),
  }
}

async function networkTest() {
  return {
    detail: navigator.onLine ? 'Browser reports online' : 'Browser reports offline',
    logs: [`navigator.onLine = ${navigator.onLine}`],
    recommendation: navigator.onLine ? undefined : 'ตรวจ network ก่อน cloud/Google sync',
    status: navigator.onLine ? ('passed' as const) : ('warning' as const),
  }
}

async function pwaTest() {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  const hasServiceWorker = 'serviceWorker' in navigator
  const manifest = document.querySelector('link[rel="manifest"]')

  return {
    detail: standalone
      ? 'PWA running standalone'
      : hasServiceWorker && manifest
        ? 'PWA install foundation detected'
        : 'PWA setup incomplete',
    logs: [
      `standalone=${standalone}`,
      `serviceWorker=${hasServiceWorker}`,
      `manifest=${Boolean(manifest)}`,
    ],
    recommendation: standalone ? undefined : 'ติดตั้งบนมือถือเพื่อทดสอบ standalone mode',
    status: standalone ? ('passed' as const) : hasServiceWorker && manifest ? ('warning' as const) : ('failed' as const),
  }
}

async function buildAssetTest() {
  const scripts = Array.from(document.scripts).filter((script) => script.src)
  const styles = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
  const missingAssets = [...scripts.map((item) => item.src), ...styles.map((item) => item.href)].filter(
    (url) => url && !url.includes('/assets/') && import.meta.env.PROD,
  )

  return {
    detail: `JS loaded: ${scripts.length}, CSS loaded: ${styles.length}`,
    logs: [
      `scripts=${scripts.length}`,
      `stylesheets=${styles.length}`,
      `unexpectedAssets=${missingAssets.length}`,
    ],
    recommendation:
      scripts.length === 0 ? 'ตรวจ Vite build output และ Vercel asset path' : undefined,
    status: scripts.length > 0 ? ('passed' as const) : ('failed' as const),
  }
}

async function mobileLayoutTest() {
  const hasViewportMeta = Boolean(document.querySelector('meta[name="viewport"]'))
  const width = window.innerWidth
  const isMobileSize = width <= 480
  const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 2

  return {
    detail: `Viewport ${window.innerWidth}x${window.innerHeight}`,
    logs: [
      `viewportMeta=${hasViewportMeta}`,
      `mobileSize=${isMobileSize}`,
      `horizontalOverflow=${hasHorizontalOverflow}`,
    ],
    recommendation: hasHorizontalOverflow ? 'ตรวจ component ที่กว้างเกินหน้าจอมือถือ' : undefined,
    status:
      hasViewportMeta && !hasHorizontalOverflow
        ? ('passed' as const)
        : hasViewportMeta
          ? ('warning' as const)
          : ('failed' as const),
  }
}

async function driveLinkImportTest() {
  const samples = [
    'https://docs.google.com/spreadsheets/d/demo/edit',
    'https://docs.google.com/forms/d/demo/viewform',
    'https://docs.google.com/document/d/demo/edit',
    'https://drive.google.com/drive/folders/demo',
    'https://drive.google.com/file/d/demo/view',
  ]
  const results = samples.map((url) => ({
    id: extractGoogleFileId(url),
    metadata: googleLinkToDriveMetadata(url),
    type: detectGoogleFileType(url),
    url,
  }))
  const failed = results.filter((result) => !result.metadata || result.type === 'unknown')

  return {
    detail: `${results.length - failed.length}/${results.length} Google links detected`,
    logs: results.map((result) => `${result.url} -> ${result.type} / ${result.id}`),
    recommendation: failed.length ? 'เพิ่ม pattern detection สำหรับ Google link บางชนิด' : undefined,
    status: failed.length === 0 ? ('passed' as const) : ('warning' as const),
  }
}

export async function runProductionQa(
  onProgress?: (progress: number) => void,
): Promise<QaReport> {
  const startedAt = new Date().toISOString()
  const metrics = readMetrics()
  const checks: QaCheckResult[] = []
  const checkFactories = [
    () => timedCheck('Cloud Sync Test', cloudSyncTest),
    () => timedCheck('Google Workspace API Test', () => googleWorkspaceApiTest(metrics)),
    () => timedCheck('Local Storage Test', localStorageTest),
    () => timedCheck('Network Test', networkTest),
    () => timedCheck('PWA Test', pwaTest),
    () => timedCheck('Build Asset Test', buildAssetTest),
    () => timedCheck('Mobile Layout Test', mobileLayoutTest),
    () => timedCheck('Drive Link Import Test', driveLinkImportTest),
  ]

  for (const [index, runCheck] of checkFactories.entries()) {
    checks.push(await runCheck())
    onProgress?.(Math.round(((index + 1) / checkFactories.length) * 100))
  }

  saveMetrics(metrics)

  const recommendations = checks
    .map((check) => check.recommendation)
    .filter(Boolean) as string[]

  return {
    app: {
      buildDate: APP_BUILD_DATE,
      version: APP_VERSION,
    },
    checks,
    device: getDeviceInfo(),
    finishedAt: new Date().toISOString(),
    metrics,
    progress: 100,
    recommendations: recommendations.length
      ? recommendations
      : ['ระบบหลักพร้อมใช้งานสำหรับ daily workflow'],
    startedAt,
  }
}
