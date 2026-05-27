import { isGooglePickerConfigured, googlePickerEnv } from '../lib/env'
import type { GoogleDriveFileMetadata, GoogleDriveFileType } from './googleDriveService'
import {
  getGoogleFileIcon,
  normalizeGoogleDriveUrl,
} from './googleDriveService'

const GOOGLE_PICKER_CACHE_KEY = 'nexora.googlePicker.cache.v1'

type PickerApi = {
  load: (api: string, callback: { callback: () => void }) => void
  picker?: unknown
}

declare global {
  interface Window {
    gapi?: PickerApi
  }
}

export type GoogleOAuthToken = {
  accessToken: string
  expiresAt: string
  scope: string
}

export type GooglePickerStatus =
  | 'idle'
  | 'connecting'
  | 'loading-picker'
  | 'fetching-files'
  | 'restoring-cache'
  | 'ready'
  | 'error'
  | 'offline'

export type GooglePickerResult = {
  files: GoogleDriveFileMetadata[]
  message: string
  status: GooglePickerStatus
}

let pickerLoaderPromise: Promise<void> | null = null

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    )
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Picker API failed to load'))
    document.head.appendChild(script)
  })
}

export function isGoogleTokenValid(token: GoogleOAuthToken | null) {
  if (!token?.accessToken || !token.expiresAt) {
    return false
  }

  return new Date(token.expiresAt).getTime() > Date.now() + 60_000
}

export async function loadGooglePickerApi(retries = 1) {
  if (!navigator.onLine) {
    throw new Error('Offline mode')
  }

  if (!pickerLoaderPromise) {
    pickerLoaderPromise = (async () => {
      await loadScript('https://apis.google.com/js/api.js')
      await new Promise<void>((resolve, reject) => {
        const gapi = window.gapi
        if (!gapi) {
          reject(new Error('Google API client not available'))
          return
        }

        gapi.load('picker', { callback: resolve })
      })
    })()
  }

  try {
    await pickerLoaderPromise
  } catch (error) {
    pickerLoaderPromise = null
    if (retries > 0) {
      return loadGooglePickerApi(retries - 1)
    }
    throw error
  }
}

export function cachePickedFiles(files: GoogleDriveFileMetadata[]) {
  try {
    localStorage.setItem(GOOGLE_PICKER_CACHE_KEY, JSON.stringify(files))
  } catch {
    // Picker cache is best-effort.
  }
}

export function loadCachedPickedFiles() {
  try {
    const cached = localStorage.getItem(GOOGLE_PICKER_CACHE_KEY)
    return cached ? (JSON.parse(cached) as GoogleDriveFileMetadata[]) : []
  } catch {
    return []
  }
}

export function mapPickerDocumentToMetadata(document: {
  id?: string
  mimeType?: string
  name?: string
  serviceId?: string
  type?: string
  url?: string
}): GoogleDriveFileMetadata | null {
  const url = document.url ? normalizeGoogleDriveUrl(document.url) : ''
  const mimeType = document.mimeType ?? ''
  const type = resolveMimeType(mimeType)

  if (!document.id || !url || type === 'unknown') {
    return null
  }

  return {
    icon: getGoogleFileIcon(type),
    id: document.id,
    modifiedAt: new Date().toISOString(),
    name: document.name ?? 'Google Drive file',
    source: 'Google Drive',
    type,
    url,
  }
}

function resolveMimeType(mimeType: string): GoogleDriveFileType {
  if (mimeType.includes('folder')) return 'folder'
  if (mimeType.includes('spreadsheet')) return 'sheet'
  if (mimeType.includes('form')) return 'form'
  if (mimeType.includes('presentation')) return 'slide'
  if (mimeType.includes('document')) return 'document'
  if (mimeType.includes('script')) return 'script'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('image')) return 'image'
  if (mimeType) return 'file'
  return 'unknown'
}

export async function prepareGooglePicker(
  token: GoogleOAuthToken | null,
): Promise<GooglePickerResult> {
  if (!navigator.onLine) {
    const cachedFiles = loadCachedPickedFiles()
    return {
      files: cachedFiles,
      message: cachedFiles.length
        ? 'Offline - restored cached Drive metadata'
        : 'Offline mode',
      status: cachedFiles.length ? 'restoring-cache' : 'offline',
    }
  }

  if (!isGooglePickerConfigured) {
    return {
      files: loadCachedPickedFiles(),
      message: 'Google Picker env ยังไม่พร้อม',
      status: 'error',
    }
  }

  if (!isGoogleTokenValid(token)) {
    return {
      files: loadCachedPickedFiles(),
      message: 'ต้องมี Google OAuth token ก่อนเปิด Picker จริง',
      status: 'error',
    }
  }

  await loadGooglePickerApi()

  return {
    files: loadCachedPickedFiles(),
    message: `Google Picker API loaded for app ${googlePickerEnv.appId}`,
    status: 'ready',
  }
}
