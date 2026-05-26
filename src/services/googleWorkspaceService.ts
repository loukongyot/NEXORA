import {
  googleWorkspaceEnv,
  isGoogleWorkspaceConfigured,
} from '../lib/env'

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

export async function fetchGoogleWorkspaceData(): Promise<GoogleWorkspaceResult> {
  if (!isGoogleWorkspaceConfigured) {
    return {
      data: null,
      message: 'ยังไม่ได้เชื่อมต่อ',
      status: 'missing-url',
    }
  }

  try {
    const response = await fetch(googleWorkspaceEnv.apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return {
        data: null,
        message: `เชื่อมต่อไม่สำเร็จ (${response.status})`,
        status: 'error',
      }
    }

    const json = (await response.json()) as Partial<GoogleWorkspaceData>
    const data = normalizeGoogleWorkspaceData(json)
    const hasData =
      data.formResponsesToday > 0 ||
      data.latestReportTotal > 0 ||
      data.outputFileCount > 0 ||
      data.latestUpdates.length > 0

    return {
      data,
      message: hasData ? 'เชื่อมต่อแล้ว' : 'ยังไม่มีข้อมูลจาก Google Workspace',
      status: hasData ? 'connected' : 'empty',
    }
  } catch (error) {
    return {
      data: emptyData,
      message:
        error instanceof Error ? error.message : 'เชื่อมต่อ Google Workspace ไม่สำเร็จ',
      status: 'error',
    }
  }
}

export async function testGoogleWorkspaceConnection() {
  return fetchGoogleWorkspaceData()
}
