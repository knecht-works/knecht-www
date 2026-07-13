interface GithubStats {
  stars: number | null
  version: string | null
}

// Shared client-side fetch of /api/github: no matter how many components use
// it, the endpoint is called once. localStorage bridges the gap until the
// response arrives, so revisits render instantly.
export function useGithubStats() {
  const stats = useState<GithubStats>('github-stats', () => ({ stars: null, version: null }))
  const started = useState('github-stats-started', () => false)

  onMounted(async () => {
    if (started.value) return
    started.value = true

    const cached = localStorage.getItem('gh-stats')
    if (cached) {
      try {
        Object.assign(stats.value, JSON.parse(cached))
      } catch {
        localStorage.removeItem('gh-stats')
      }
    }

    try {
      const fresh = await $fetch<GithubStats>('/api/github')
      if (fresh.stars !== null) stats.value.stars = fresh.stars
      if (fresh.version !== null) stats.value.version = fresh.version
      localStorage.setItem('gh-stats', JSON.stringify(stats.value))
    } catch {
      // Offline or API down: cached or empty values are fine.
    }
  })

  return stats
}
