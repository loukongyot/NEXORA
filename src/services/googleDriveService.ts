import type {
  WorkspaceCategory,
  WorkspaceColor,
  WorkspaceSystemInput,
} from '../types/workspace'

export type GoogleDriveFileType =
  | 'folder'
  | 'document'
  | 'sheet'
  | 'slide'
  | 'form'
  | 'script'
  | 'image'
  | 'pdf'
  | 'file'
  | 'unknown'

export type GoogleDriveFileMetadata = {
  collection?: string
  favorite?: boolean
  icon: string
  id: string
  modifiedAt: string
  name: string
  pinned?: boolean
  source: 'Apps Script' | 'Imported' | 'Google Drive'
  type: GoogleDriveFileType
  url: string
}

const fileTypeConfig: Record<
  GoogleDriveFileType,
  {
    category: WorkspaceCategory
    color: WorkspaceColor
    icon: string
    label: string
    tags: string[]
  }
> = {
  document: {
    category: 'Drive',
    color: 'blue',
    icon: 'Docs',
    label: 'Google Doc',
    tags: ['Google', 'Document'],
  },
  file: {
    category: 'Drive',
    color: 'blue',
    icon: 'Drive',
    label: 'Drive File',
    tags: ['Google'],
  },
  folder: {
    category: 'Drive',
    color: 'blue',
    icon: 'Drive',
    label: 'Drive Folder',
    tags: ['Google', 'Folder'],
  },
  form: {
    category: 'Forms',
    color: 'pink',
    icon: 'Forms',
    label: 'Google Form',
    tags: ['Google', 'Form', 'Active'],
  },
  image: {
    category: 'Output',
    color: 'brown',
    icon: 'Image',
    label: 'Image',
    tags: ['Google', 'Output'],
  },
  pdf: {
    category: 'Output',
    color: 'brown',
    icon: 'PDF',
    label: 'PDF',
    tags: ['Google', 'Output'],
  },
  script: {
    category: 'Apps Script',
    color: 'purple',
    icon: 'Apps Script',
    label: 'Apps Script',
    tags: ['Google', 'Automation'],
  },
  sheet: {
    category: 'Sheets',
    color: 'blue',
    icon: 'Sheets',
    label: 'Google Sheet',
    tags: ['Google', 'Sheet', 'Active'],
  },
  slide: {
    category: 'Slides',
    color: 'purple',
    icon: 'Slides',
    label: 'Google Slide',
    tags: ['Google', 'Presentation'],
  },
  unknown: {
    category: 'Other',
    color: 'blue',
    icon: 'Other',
    label: 'Unsupported Link',
    tags: ['Imported'],
  },
}

export function detectDriveFolderLink(url: string) {
  return /drive\.google\.com\/drive\/folders\//i.test(url)
}

export function detectGoogleFileType(url: string): GoogleDriveFileType {
  const normalizedUrl = url.toLowerCase()

  if (detectDriveFolderLink(normalizedUrl)) return 'folder'
  if (/docs\.google\.com\/document\//i.test(normalizedUrl)) return 'document'
  if (/docs\.google\.com\/spreadsheets\//i.test(normalizedUrl)) return 'sheet'
  if (/docs\.google\.com\/presentation\//i.test(normalizedUrl)) return 'slide'
  if (/docs\.google\.com\/forms\//i.test(normalizedUrl)) return 'form'
  if (/script\.google\.com\//i.test(normalizedUrl)) return 'script'
  if (/drive\.google\.com\/file\/d\/[^/]+/i.test(normalizedUrl)) {
    if (/\.pdf(\?|$)/i.test(normalizedUrl)) return 'pdf'
    if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(normalizedUrl)) return 'image'
    return 'file'
  }
  if (/\.pdf(\?|$)/i.test(normalizedUrl)) return 'pdf'
  if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(normalizedUrl)) return 'image'

  return 'unknown'
}

export function extractGoogleFileId(url: string) {
  const patterns = [
    /\/d\/([^/]+)/i,
    /\/folders\/([^/?#]+)/i,
    /[?&]id=([^&#]+)/i,
    /\/macros\/s\/([^/]+)/i,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) {
      return decodeURIComponent(match[1])
    }
  }

  return ''
}

export function getGoogleFileIcon(type: GoogleDriveFileType) {
  return fileTypeConfig[type].icon
}

export function getGoogleFileTypeLabel(type: GoogleDriveFileType) {
  return fileTypeConfig[type].label
}

export function normalizeGoogleDriveUrl(url: string) {
  try {
    const parsedUrl = new URL(url.trim())
    parsedUrl.hash = ''

    if (parsedUrl.hostname.includes('google.com')) {
      const usefulParams = ['id']
      Array.from(parsedUrl.searchParams.keys()).forEach((key) => {
        if (!usefulParams.includes(key)) {
          parsedUrl.searchParams.delete(key)
        }
      })
    }

    return parsedUrl.toString()
  } catch {
    return url.trim()
  }
}

export function getSmartCollectionSuggestion(type: GoogleDriveFileType) {
  if (type === 'sheet' || type === 'form') return 'รายงานประจำวัน'
  if (type === 'folder' || type === 'document') return 'ระบบนักเรียน'
  if (type === 'slide') return 'ระบบรับสมัคร'
  if (type === 'script') return 'AI Tools'
  if (type === 'pdf' || type === 'image' || type === 'file') return 'Output Files'

  return ''
}

export function driveFileToWorkspaceInput(
  file: GoogleDriveFileMetadata,
  collectionId = '',
): WorkspaceSystemInput {
  const config = fileTypeConfig[file.type]

  return {
    category: config.category,
    collectionId,
    color: config.color,
    description: `${config.label} from ${file.source}.`,
    favorite: Boolean(file.favorite),
    icon: config.icon,
    name: file.name,
    notes: `Source: ${file.source}\nFile ID: ${file.id || 'unknown'}\nUpdated: ${file.modifiedAt || '-'}`,
    pinned: Boolean(file.pinned),
    tags: Array.from(new Set([...config.tags, 'Imported'])),
    url: normalizeGoogleDriveUrl(file.url),
  }
}

export function googleLinkToDriveMetadata(url: string): GoogleDriveFileMetadata | null {
  try {
    const normalizedUrl = normalizeGoogleDriveUrl(url)
    const parsedUrl = new URL(normalizedUrl)
    const type = detectGoogleFileType(normalizedUrl)

    if (type === 'unknown' || !parsedUrl.hostname.includes('google')) {
      return null
    }

    return {
      collection: getSmartCollectionSuggestion(type),
      favorite: false,
      icon: getGoogleFileIcon(type),
      id: extractGoogleFileId(normalizedUrl) || normalizedUrl,
      modifiedAt: new Date().toISOString(),
      name: getGoogleFileTypeLabel(type),
      pinned: false,
      source: 'Imported',
      type,
      url: normalizedUrl,
    }
  } catch {
    return null
  }
}
