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
  displayLabel: string
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
  { label: 'Dashboard', displayLabel: '📊 แดชบอร์ด', icon: LayoutDashboard },
  { label: 'Favorites', displayLabel: '⭐ Starred', icon: Star },
  { label: 'Forms', displayLabel: '📝 Forms', icon: FileText },
  { label: 'Sheets', displayLabel: '📊 Sheets', icon: FileSpreadsheet },
  { label: 'Drive', displayLabel: '📁 Drive', icon: Folder },
  { label: 'Slides', displayLabel: '🖥️ Slides', icon: Presentation },
  { label: 'Apps Script', displayLabel: '⚡ Apps Script', icon: Code2 },
  { label: 'AI Tools', displayLabel: '🤖 AI Tools', icon: Bot },
  { label: 'Search', displayLabel: '🔎 ค้นหา', icon: Search },
  { label: 'Recent', displayLabel: '🕘 ล่าสุด', icon: Clock3 },
  { label: 'Settings', displayLabel: '⚙️ ตั้งค่า', icon: Settings },
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
