export type InsightKind = 'Prompt' | 'News' | 'Tip' | 'Workflow'

export type InsightItem = {
  id: string
  kind: InsightKind
  title: string
  description: string
  action: string
}

export const insights: InsightItem[] = [
  {
    id: 'prompt-daily-summary',
    kind: 'Prompt',
    title: 'Daily workspace summary',
    description:
      'Summarize today\'s forms, sheets, pending tasks, and next actions into a short operating brief.',
    action: 'Use prompt',
  },
  {
    id: 'tip-backup-rhythm',
    kind: 'Tip',
    title: 'Keep a weekly backup rhythm',
    description:
      'Export your NEXORA workspace after adding major systems so local data stays easy to restore.',
    action: 'Review settings',
  },
  {
    id: 'news-ai-ops',
    kind: 'News',
    title: 'AI operations are moving local-first',
    description:
      'More daily tools are blending lightweight local storage with intelligent command layers for faster personal workflows.',
    action: 'Read brief',
  },
  {
    id: 'workflow-admissions',
    kind: 'Workflow',
    title: 'Admissions control loop',
    description:
      'Pair an intake form, response sheet, Drive output folder, and LINE notification link into one starred flow.',
    action: 'Build flow',
  },
]
