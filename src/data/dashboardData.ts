import {
  Bot,
  Clock3,
  Code2,
  FileSpreadsheet,
  FileText,
  Folder,
  LayoutDashboard,
  Presentation,
  Search,
  Settings,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  icon: LucideIcon
}

export type DashboardItem = {
  title: string
  description: string
  meta: string
  accent: 'pink' | 'blue' | 'purple' | 'brown'
}

export type QuickAction = {
  label: string
  description: string
  icon: LucideIcon
  accent: 'pink' | 'blue' | 'purple' | 'brown'
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Favorites', icon: Star },
  { label: 'Forms', icon: FileText },
  { label: 'Sheets', icon: FileSpreadsheet },
  { label: 'Drive', icon: Folder },
  { label: 'Slides', icon: Presentation },
  { label: 'Apps Script', icon: Code2 },
  { label: 'AI Tools', icon: Bot },
  { label: 'Search', icon: Search },
  { label: 'Recent', icon: Clock3 },
  { label: 'Settings', icon: Settings },
]

export const quickActions: QuickAction[] = [
  {
    label: 'New Form',
    description: 'Add a forms launcher',
    icon: FileText,
    accent: 'pink',
  },
  {
    label: 'New Sheet',
    description: 'Add a sheet tracker',
    icon: FileSpreadsheet,
    accent: 'blue',
  },
  {
    label: 'Open Drive',
    description: 'Launch Drive systems',
    icon: Folder,
    accent: 'purple',
  },
  {
    label: 'AI Prompt',
    description: 'Open AI tool stack',
    icon: Bot,
    accent: 'purple',
  },
  {
    label: 'Daily Report',
    description: 'Jump to daily systems',
    icon: Sparkles,
    accent: 'brown',
  },
  {
    label: 'Add System',
    description: 'Save any workspace link',
    icon: Zap,
    accent: 'purple',
  },
]
