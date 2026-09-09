// Stores one docs vote in Cloudflare D1. Only the page path and the vote are
// kept, no IP or user agent, so the table holds no personal data.
// Table: see server/db/docs-feedback.sql.
interface FeedbackBody {
  path?: string
  vote?: string
}

// Minimal shape of the D1 binding, enough for one insert.
interface D1Binding {
  prepare(query: string): {
    bind(...values: unknown[]): { run(): Promise<unknown> }
  }
}

const PATH_RE = /^\/docs(\/[\w-]+)+$/

export default defineEventHandler(async (event) => {
  const { path, vote } = await readBody<FeedbackBody>(event) ?? {}

  if (typeof path !== 'string' || path.length > 200 || !PATH_RE.test(path) || (vote !== 'up' && vote !== 'down')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid feedback' })
  }

  const db = event.context.cloudflare?.env?.DB as D1Binding | undefined

  // No binding outside Cloudflare, e.g. in nuxt dev.
  if (!db) {
    console.log(`[docs-feedback] ${vote} ${path}`)
  } else {
    await db.prepare('INSERT INTO docs_feedback (path, vote) VALUES (?, ?)').bind(path, vote).run()
  }

  setResponseStatus(event, 204)
  return null
})
