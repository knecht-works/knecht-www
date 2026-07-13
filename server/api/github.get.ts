// Proxies the GitHub repo stats so browsers never hit GitHub's anonymous
// rate limit (60 req/h per IP). Cached server-side; failed lookups return
// null so the UI can simply hide the affected element.
// Keep in sync with GITHUB_REPO in app/utils/constants.ts.
const GITHUB_REPO = 'knecht-works/knecht-cloud'

export default defineCachedEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig(event)
  const headers: Record<string, string> = { 'User-Agent': 'knecht-www' }
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`
  }

  const [repo, release] = await Promise.allSettled([
    $fetch<{ stargazers_count: number }>(
      `https://api.github.com/repos/${GITHUB_REPO}`,
      { headers }
    ),
    $fetch<{ tag_name: string }>(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers }
    )
  ])

  const stars = repo.status === 'fulfilled' ? repo.value.stargazers_count : null
  const version = release.status === 'fulfilled' ? release.value.tag_name : null

  // A fully failed lookup (e.g. rate limit) must not be cached for maxAge,
  // otherwise nulls are served long after GitHub recovered.
  if (stars === null && version === null) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub API unavailable' })
  }

  return { stars, version }
}, { maxAge: 300, swr: true })
