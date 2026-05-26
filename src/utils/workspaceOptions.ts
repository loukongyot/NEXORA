import {
  Bot,
  Code2,
  FileSpreadsheet,
  FileText,
  Folder,
  MessageCircle,
  PackageOpen,
  Presentation,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WorkspaceCategory, WorkspaceColor } from '../types/workspace'

export const workspaceCategories: WorkspaceCategory[] = [
  'Forms',
  'Sheets',
  'Drive',
  'Slides',
  'Apps Script',
  'AI Tools',
  'Output',
  'LINE',
  'Other',
]

export const workspaceColors: WorkspaceColor[] = [
  'pink',
  'blue',
  'purple',
  'brown',
]

export const defaultWorkspaceTags = [
  'Daily',
  'Important',
  'AI',
  'Admin',
  'Student',
  'Active',
  'Archive',
  'Google',
  'Automation',
  'Folder',
]

export const categoryIconMap: Record<WorkspaceCategory, LucideIcon> = {
  Forms: FileText,
  Sheets: FileSpreadsheet,
  Drive: Folder,
  Slides: Presentation,
  'Apps Script': Code2,
  'AI Tools': Bot,
  Output: PackageOpen,
  LINE: MessageCircle,
  Other: Sparkles,
}

export function normalizeUrl(url: string) {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }

  return `https://${trimmedUrl}`
}

export function normalizeWorkspaceUrl(url: string) {
  return normalizeUrl(url)
}

export function validateWorkspaceUrl(url: string) {
  try {
    const parsedUrl = new URL(normalizeUrl(url))
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
  } catch {
    return false
  }
}

export function detectWorkspaceLink(url: string): {
  category: WorkspaceCategory
  color: WorkspaceColor
  icon: string
  tags: string[]
} | null {
  if (!validateWorkspaceUrl(url)) {
    return null
  }

  const normalizedUrl = normalizeUrl(url).toLowerCase()

  if (normalizedUrl.includes('docs.google.com/forms')) {
    return { category: 'Forms', color: 'pink', icon: 'Forms', tags: ['Google', 'Active'] }
  }

  if (normalizedUrl.includes('docs.google.com/spreadsheets')) {
    return { category: 'Sheets', color: 'blue', icon: 'Sheets', tags: ['Google', 'Active'] }
  }

  if (normalizedUrl.includes('drive.google.com/drive/folders')) {
    return { category: 'Drive', color: 'blue', icon: 'Drive', tags: ['Google', 'Folder'] }
  }

  if (normalizedUrl.includes('docs.google.com/presentation')) {
    return { category: 'Slides', color: 'purple', icon: 'Slides', tags: ['Google', 'Active'] }
  }

  if (
    normalizedUrl.includes('script.google.com') ||
    normalizedUrl.includes('script.googleusercontent.com')
  ) {
    return {
      category: 'Apps Script',
      color: 'purple',
      icon: 'Apps Script',
      tags: ['Google', 'Automation'],
    }
  }

  if (normalizedUrl.includes('drive.google.com')) {
    return { category: 'Drive', color: 'blue', icon: 'Drive', tags: ['Google'] }
  }

  return null
}

export function detectGoogleLinkType(url: string) {
  return detectWorkspaceLink(url)
}

export function generateWorkspaceTags(url: string, customTags: string[] = []) {
  const detectedLink = detectWorkspaceLink(url)
  const tags = detectedLink?.tags ?? []

  return Array.from(new Set([...tags, ...customTags].filter(Boolean)))
}

export function fuzzyIncludes(source: string, query: string) {
  const normalizedSource = source.toLowerCase()
  const normalizedQuery = query.toLowerCase()

  if (normalizedSource.includes(normalizedQuery)) {
    return true
  }

  let queryIndex = 0
  for (const character of normalizedSource) {
    if (character === normalizedQuery[queryIndex]) {
      queryIndex += 1
    }
    if (queryIndex === normalizedQuery.length) {
      return true
    }
  }

  return false
}

export function parseTags(tags: string) {
  return Array.from(
    new Set(
      tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}

export function formatTags(tags: string[]) {
  return tags.join(', ')
}
