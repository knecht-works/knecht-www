/** Primary contact address (used for the footer mail link). */
export const CONTACT_EMAIL = 'hallo@knecht.works'

/** Public GitHub organisation. */
export const GITHUB_URL = 'https://github.com/knecht-works'

export interface SocialLink {
  label: string
  to: string
  icon: string
}

// Shown as icon links in the footer.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', to: GITHUB_URL, icon: 'i-simple-icons-github' },
  { label: 'X', to: 'https://x.com/knechtworks', icon: 'i-simple-icons-x' },
  { label: 'E-Mail', to: `mailto:${CONTACT_EMAIL}`, icon: 'i-lucide-mail' }
]
