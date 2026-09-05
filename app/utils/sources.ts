/** Where a workflow run can originate. Shared by the integrations diagram and
 * the use case stories so every GitHub, Jira, and Cron mark looks identical. */
export type SourceKey = 'github' | 'jira' | 'cron'

export interface SourceMeta {
  icon: string
  /** Tailwind classes for the colored square behind the icon. */
  tile: string
}

export const SOURCE_META: Record<SourceKey, SourceMeta> = {
  github: { icon: 'i-simple-icons-github', tile: 'bg-white text-neutral-950' },
  jira: { icon: 'i-simple-icons-jira', tile: 'bg-[var(--accent-jira)] text-white' },
  cron: { icon: 'i-lucide-timer', tile: 'bg-white text-neutral-950' }
}

/** Discord invite, used by the community section and the footer. */
export const DISCORD_URL = 'https://discord.gg/WuxjmtgUyX'
