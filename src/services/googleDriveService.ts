export type GoogleDriveFileType =
  | 'folder'
  | 'document'
  | 'sheet'
  | 'slide'
  | 'form'
  | 'script'
  | 'file'
  | 'unknown'

export type GoogleDriveFileMetadata = {
  id: string
  icon: string
  modifiedAt: string
  name: string
  type: GoogleDriveFileType
  url: string
}

export function detectDriveFolderLink(url: string) {
  return /drive\.google\.com\/drive\/folders\//i.test(url)
}

export function detectGoogleFileType(url: string): GoogleDriveFileType {
  if (detectDriveFolderLink(url)) return 'folder'
  if (/docs\.google\.com\/document\//i.test(url)) return 'document'
  if (/docs\.google\.com\/spreadsheets\//i.test(url)) return 'sheet'
  if (/docs\.google\.com\/presentation\//i.test(url)) return 'slide'
  if (/docs\.google\.com\/forms\//i.test(url)) return 'form'
  if (/script\.google\.com\//i.test(url)) return 'script'
  if (/drive\.google\.com\/file\//i.test(url)) return 'file'

  return 'unknown'
}

export function normalizeGoogleDriveUrl(url: string) {
  try {
    const parsedUrl = new URL(url.trim())
    parsedUrl.hash = ''

    if (parsedUrl.hostname.includes('google.com')) {
      parsedUrl.search = ''
    }

    return parsedUrl.toString()
  } catch {
    return url.trim()
  }
}
