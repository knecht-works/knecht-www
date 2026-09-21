export type SourceKey = 'github' | 'jira' | 'plane' | 'linear' | 'cron'

export interface SourceMeta {
  icon: string
  tile: string
}

export const SOURCE_META: Record<SourceKey, SourceMeta> = {
  github: { icon: 'i-simple-icons-github', tile: 'bg-white text-neutral-950' },
  jira: { icon: 'i-simple-icons-jira', tile: 'bg-[var(--accent-jira)] text-white' },
  plane: { icon: 'i-simple-icons-plane', tile: 'bg-[var(--accent-plane)] text-white' },
  linear: { icon: 'i-simple-icons-linear', tile: 'bg-[var(--accent-linear)] text-white' },
  cron: { icon: 'i-lucide-timer', tile: 'bg-white text-neutral-950' }
}

export const DISCORD_URL = 'https://discord.gg/WuxjmtgUyX'
