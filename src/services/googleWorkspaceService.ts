import {
  googleWorkspaceEnv,
  isGoogleWorkspaceConfigured,
} from '../lib/env'
import type { GoogleDriveFileMetadata, GoogleDriveFileType } from './googleDriveService'
import {
  detectGoogleFileType,
  extractGoogleFileId,
  getGoogleFileIcon,
  getGoogleFileTypeLabel,
  normalizeGoogleDriveUrl,
} from './googleDriveService'
import { safeFetchJson } from '../utils/safeFetch'

const GOOGLE_WORKSPACE_CACHE_KEY = 'nexora.googleWorkspace.cache.v1'

export type GoogleWorkspaceStatus =
  | 'connected'
  | 'missing-url'
  | 'loading'
  | 'error'
  | 'empty'

export type GoogleRealtimeStatus = 'fetching' | 'synced' | 'stale' | 'failed'

export type GoogleWorkspaceActivity = {
  id: string
  label: string
  source: string
  timestamp: string
  type: 'form' | 'report' | 'output' | 'sheet' | 'file' | 'system'
}

export type GoogleWorkspaceData = {
  formResponsesToday: number
  latestFiles: GoogleDriveFileMetadata[]
  latestReportTotal: number
  latestUpdates: GoogleWorkspaceActivity[]
  outputFileCount: number
  source: 'cache' | 'live'
  status?: string
  timestamp?: string
  updatedAt?: string
}

export type GoogleWorkspaceResult = {
  data: GoogleWorkspaceData | null
  message: string
  realtimeStatus: GoogleRealtimeStatus
  status: GoogleWorkspaceStatus
}

type RawActivity =
  | string
  | {
      label?: unknown
      source?: unknown
      timestamp?: unknown
      type?: unknown
    }

type RawFile =
  | string
  | {
      id?: unknown
      modifiedAt?: unknown
      name?: unknown
      source?: unknown
      type?: unknown
      updatedAt?: unknown
      url?: unknown
    }

type RawGoogleWorkspacePayload = {
  formResponsesToday?: unknown
  latestFiles?: unknown
  latestReportTotal?: unknown
  latestUpdates?: unknown
  outputFileCount?: unknown
  status?: unknown
  timestamp?: unknown
  updatedAt?: unknown
}

function numberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function stringOrFallback(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function createActivityId(label: string, timestamp: string) {
  return `${label}-${timestamp}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function normalizeActivity(item: RawActivity, index: number): GoogleWorkspaceActivity {
  if (typeof item === 'string') {
    const timestamp = new Date().toISOString()
    return {
      id: createActivityId(item, `${timestamp}-${index}`),
      label: item,
      source: 'Apps Script',
      timestamp,
      type: 'system',
    }
  }

  const label = stringOrFallback(item.label, `Workspace update ${index + 1}`)
  const timestamp = stringOrFallback(item.timestamp, new Date().toISOString())
  const rawType = stringOrFallback(item.type, 'system')
  const type = ['form', 'report', 'output', 'sheet', 'file', 'system'].includes(
    rawType,
  )
    ? (rawType as GoogleWorkspaceActivity['type'])
    : 'system'

  return {
    id: createActivityId(label, `${timestamp}-${index}`),
    label,
    source: stringOrFallback(item.source, 'Apps Script'),
    timestamp,
    type,
  }
}

function normalizeFile(item: RawFile, index: number): GoogleDriveFileMetadata | null {
  if (typeof item === 'string') {
    try {
      const normalizedUrl = normalizeGoogleDriveUrl(item)
      const type = detectGoogleFileType(normalizedUrl)

      if (type === 'unknown') {
        return null
      }

      return {
        icon: getGoogleFileIcon(type),
        id: extractGoogleFileId(normalizedUrl) || `google-file-${index}`,
        modifiedAt: new Date().toISOString(),
        name: getGoogleFileTypeLabel(type),
        source: 'Apps Script',
        type,
        url: normalizedUrl,
      }
    } catch {
      return null
    }
  }

  const rawUrl = stringOrFallback(item.url)
  if (!rawUrl) {
    return null
  }

  const normalizedUrl = normalizeGoogleDriveUrl(rawUrl)
  const detectedType = detectGoogleFileType(normalizedUrl)
  const rawType = stringOrFallback(item.type)
  const type = (
    ['folder', 'document', 'sheet', 'slide', 'form', 'script', 'image', 'pdf', 'file'].includes(
      rawType,
    )
      ? rawType
      : detectedType
  ) as GoogleDriveFileType

  if (type === 'unknown') {
    return null
  }

  return {
    icon: getGoogleFileIcon(type),
    id: stringOrFallback(item.id, extractGoogleFileId(normalizedUrl) || `google-file-${index}`),
    modifiedAt: stringOrFallback(
      item.modifiedAt,
      stringOrFallback(item.updatedAt, new Date().toISOString()),
    ),
    name: stringOrFallback(item.name, getGoogleFileTypeLabel(type)),
    source: stringOrFallback(item.source, 'Apps Script') as GoogleDriveFileMetadata['source'],
    type,
    url: normalizedUrl,
  }
}

function isGoogleWorkspacePayload(data: unknown): data is RawGoogleWorkspacePayload {
  return Boolean(data && typeof data === 'object')
}

function normalizeGoogleWorkspaceData(
  data: RawGoogleWorkspacePayload,
  source: 'cache' | 'live',
): GoogleWorkspaceData {
  const latestUpdates = Array.isArray(data.latestUpdates)
    ? data.latestUpdates.map(normalizeActivity)
    : []
  const latestFiles = Array.isArray(data.latestFiles)
    ? data.latestFiles.map(normalizeFile).filter(Boolean)
    : []
  const timestamp =
    stringOrFallback(data.timestamp) ||
    stringOrFallback(data.updatedAt) ||
    new Date().toISOString()

  return {
    formResponsesToday: numberOrZero(data.formResponsesToday),
    latestFiles: latestFiles as GoogleDriveFileMetadata[],
    latestReportTotal: numberOrZero(data.latestReportTotal),
    latestUpdates,
    outputFileCount: numberOrZero(data.outputFileCount),
    source,
    status: stringOrFallback(data.status) || undefined,
    timestamp,
    updatedAt: timestamp,
  }
}

function hasWorkspaceData(data: GoogleWorkspaceData) {
  return (
    data.formResponsesToday > 0 ||
    data.latestReportTotal > 0 ||
    data.outputFileCount > 0 ||
    data.latestUpdates.length > 0 ||
    data.latestFiles.length > 0
  )
}

export function loadCachedGoogleWorkspaceData() {
  try {
    const cached = localStorage.getItem(GOOGLE_WORKSPACE_CACHE_KEY)
    if (!cached) {
      return null
    }

    const parsed = JSON.parse(cached) as RawGoogleWorkspacePayload
    return normalizeGoogleWorkspaceData(parsed, 'cache')
  } catch {
    return null
  }
}

function cacheGoogleWorkspaceData(data: GoogleWorkspaceData) {
  try {
    localStorage.setItem(GOOGLE_WORKSPACE_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Cache is best-effort only.
  }
}

function staleResult(message: string): GoogleWorkspaceResult {
  const cachedData = loadCachedGoogleWorkspaceData()

  if (cachedData) {
    return {
      data: cachedData,
      message: `${message} - แสดงข้อมูล cache ล่าสุด`,
      realtimeStatus: 'stale',
      status: 'empty',
    }
  }

  return {
    data: null,
    message,
    realtimeStatus: 'failed',
    status: 'error',
  }
}

export async function fetchGoogleWorkspaceData(): Promise<GoogleWorkspaceResult> {
  if (!isGoogleWorkspaceConfigured) {
    const cachedData = loadCachedGoogleWorkspaceData()

    return {
      data: cachedData,
      message: cachedData
        ? 'ยังไม่ได้เชื่อมต่อ - แสดงข้อมูล cache ล่าสุด'
        : 'ยังไม่ได้เชื่อมต่อ',
      realtimeStatus: cachedData ? 'stale' : 'failed',
      status: 'missing-url',
    }
  }

  if (!window.navigator.onLine) {
    return staleResult('ออฟไลน์')
  }

  try {
    const response = await safeFetchJson<unknown>(googleWorkspaceEnv.apiUrl, {
      headers: {
        Accept: 'application/json',
      },
      retries: 1,
      timeoutMs: 9000,
    })

    if (!response.ok) {
      return staleResult(response.error || `เชื่อมต่อไม่สำเร็จ (${response.status})`)
    }

    if (!isGoogleWorkspacePayload(response.data)) {
      return staleResult(
        'Google Workspace API ส่งข้อมูลไม่ตรงรูปแบบ JSON ที่ NEXORA ต้องการ',
      )
    }

    const data = normalizeGoogleWorkspaceData(response.data, 'live')
    const hasData = hasWorkspaceData(data)
    cacheGoogleWorkspaceData(data)

    return {
      data,
      message: hasData
        ? 'เชื่อมต่อข้อมูลจริงสำเร็จ'
        : 'เชื่อมต่อสำเร็จ แต่ยังไม่มีข้อมูลจาก Google Workspace',
      realtimeStatus: 'synced',
      status: hasData ? 'connected' : 'empty',
    }
  } catch (error) {
    return staleResult(
      error instanceof Error
        ? error.message
        : 'เชื่อมต่อ Google Workspace ไม่สำเร็จ',
    )
  }
}

export async function testGoogleWorkspaceConnection() {
  return fetchGoogleWorkspaceData()
}
