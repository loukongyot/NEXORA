import {
  googleWorkspaceEnv,
  isGoogleWorkspaceConfigured,
} from '../lib/env'
import { safeFetchJson } from '../utils/safeFetch'

export type GoogleWorkspaceStatus =
  | 'connected'
  | 'missing-url'
  | 'loading'
  | 'error'
  | 'empty'

export type GoogleWorkspaceData = {
  formResponsesToday: number
  latestReportTotal: number
  outputFileCount: number
  status?: string
  updatedAt?: string
  latestUpdates: string[]
}

export type GoogleWorkspaceResult = {
  data: GoogleWorkspaceData | null
  message: string
  status: GoogleWorkspaceStatus
}

const emptyData: GoogleWorkspaceData = {
  formResponsesToday: 0,
  latestReportTotal: 0,
  outputFileCount: 0,
  latestUpdates: [],
}

function normalizeGoogleWorkspaceData(data: Partial<GoogleWorkspaceData>) {
  return {
    formResponsesToday:
      typeof data.formResponsesToday === 'number'
        ? data.formResponsesToday
        : 0,
    latestReportTotal:
      typeof data.latestReportTotal === 'number' ? data.latestReportTotal : 0,
    latestUpdates: Array.isArray(data.latestUpdates)
      ? data.latestUpdates.map(String)
      : [],
    outputFileCount:
      typeof data.outputFileCount === 'number' ? data.outputFileCount : 0,
    status: typeof data.status === 'string' ? data.status : undefined,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  }
}

function isGoogleWorkspacePayload(data: unknown): data is Partial<GoogleWorkspaceData> {
  if (!data || typeof data !== 'object') {
    return false
  }

  const payload = data as Partial<GoogleWorkspaceData>

  return (
    (payload.formResponsesToday === undefined ||
      typeof payload.formResponsesToday === 'number') &&
    (payload.latestReportTotal === undefined ||
      typeof payload.latestReportTotal === 'number') &&
    (payload.outputFileCount === undefined ||
      typeof payload.outputFileCount === 'number') &&
    (payload.latestUpdates === undefined || Array.isArray(payload.latestUpdates))
  )
}

export async function fetchGoogleWorkspaceData(): Promise<GoogleWorkspaceResult> {
  if (!isGoogleWorkspaceConfigured) {
    return {
      data: null,
      message: 'ยังไม่ได้เชื่อมต่อ',
      status: 'missing-url',
    }
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
      return {
        data: null,
        message: response.error || `เชื่อมต่อไม่สำเร็จ (${response.status})`,
        status: 'error',
      }
    }

    if (!isGoogleWorkspacePayload(response.data)) {
      return {
        data: null,
        message:
          'Google Workspace API ส่งข้อมูลไม่ตรงรูปแบบ JSON ที่ NEXORA ต้องการ',
        status: 'error',
      }
    }

    const data = normalizeGoogleWorkspaceData(response.data)
    const hasData =
      data.formResponsesToday > 0 ||
      data.latestReportTotal > 0 ||
      data.outputFileCount > 0 ||
      data.latestUpdates.length > 0

    return {
      data,
      message: hasData
        ? 'เชื่อมต่อสำเร็จ'
        : 'เชื่อมต่อสำเร็จ แต่ยังไม่มีข้อมูลจาก Google Workspace',
      status: hasData ? 'connected' : 'empty',
    }
  } catch (error) {
    return {
      data: emptyData,
      message:
        error instanceof Error
          ? error.message
          : 'เชื่อมต่อ Google Workspace ไม่สำเร็จ',
      status: 'error',
    }
  }
}

export async function testGoogleWorkspaceConnection() {
  return fetchGoogleWorkspaceData()
}
