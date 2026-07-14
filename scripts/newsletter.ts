// Builds and schedules the newsletter broadcast. Runs in GitHub Actions on the
// 1st and 15th, or manually via workflow_dispatch. Finds every update post
// added since the last "newsletter-*" git tag, renders the teaser mail and
// creates a Resend broadcast scheduled 24 hours out, so it can still be
// cancelled in the Resend dashboard.
//
// Flags:
//   --dry-run  writes the HTML to ./out/newsletter.html, sends nothing
//   --test     sends to the test segment (RESEND_TEST_SEGMENT_ID)
//
// Env: RESEND_API_KEY, RESEND_SEGMENT_ID, RESEND_TEST_SEGMENT_ID (only for
// --test), NEWSLETTER_FROM (optional, has a default).
//
// Requires the full git history (fetch-depth: 0), otherwise git describe fails.

import { execSync } from 'node:child_process'
import { appendFileSync, copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import matter from 'gray-matter'
import { LOGO_URL, renderNewsletter, renderNewsletterText, type NewsletterPost } from './newsletter-template.ts'

const SITE_URL = 'https://knecht.works'
const CONTENT_DIR = 'content/updates'
// First run has no tag yet, fall back to posts from the last 16 days.
const FALLBACK_DAYS = 16

const dryRun = process.argv.includes('--dry-run')
const testRun = process.argv.includes('--test')

function setOutput(name: string, value: string): void {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
  }
}

function git(command: string): string {
  return execSync(`git ${command}`, { encoding: 'utf8' }).trim()
}

function lastNewsletterTag(): string | null {
  try {
    return execSync('git describe --tags --match "newsletter-*" --abbrev=0', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return null
  }
}

function toPost(file: string): NewsletterPost | null {
  const { data } = matter(readFileSync(file, 'utf8'))
  if (data.draft === true || !data.title || !data.date) return null

  // gray-matter parses unquoted YAML dates as Date objects.
  const date = data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : String(data.date)

  return {
    title: data.title,
    description: data.description ?? '',
    date,
    tag: data.tag,
    url: `${SITE_URL}/updates/${basename(file, '.md')}`
  }
}

function collectPosts(): NewsletterPost[] {
  const tag = lastNewsletterTag()
  let files: string[]

  if (tag) {
    console.log(`Letzter Versand-Tag: ${tag}`)
    files = git(`diff --name-only --diff-filter=A ${tag}..HEAD -- ${CONTENT_DIR}`)
      .split('\n')
      .filter(file => file.endsWith('.md'))
  } else {
    console.log(`Kein newsletter-Tag gefunden, Fallback auf die letzten ${FALLBACK_DAYS} Tage.`)
    files = readdirSync(CONTENT_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => join(CONTENT_DIR, file))
  }

  let posts = files
    .map(toPost)
    .filter((post): post is NewsletterPost => post !== null)

  if (!tag) {
    const cutoff = Date.now() - FALLBACK_DAYS * 24 * 60 * 60 * 1000
    posts = posts.filter(post => new Date(post.date).getTime() >= cutoff)
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

async function resendPost(path: string, body: unknown): Promise<{ id: string }> {
  const res = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    throw new Error(`Resend ${path} failed with ${res.status}. ${await res.text()}`)
  }
  return res.json() as Promise<{ id: string }>
}

const posts = collectPosts()

if (posts.length === 0) {
  console.log('Keine neuen Beiträge, nichts zu senden.')
  setOutput('sent', 'false')
  process.exit(0)
}

console.log(`${posts.length} neue Beiträge:`)
for (const post of posts) console.log(`  - ${post.date} ${post.title}`)

const subject = posts.length === 1
  ? 'Ein neues Update von Knecht'
  : `${posts.length} neue Updates von Knecht`
const html = renderNewsletter(posts)
const text = renderNewsletterText(posts)

// Resend refuses broadcasts without an unsubscribe link, and rightly so.
if (!html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}')) {
  throw new Error('Abmelde-Link fehlt im Template.')
}

if (dryRun) {
  mkdirSync('out', { recursive: true })
  writeFileSync('out/newsletter.html', html)
  writeFileSync('out/newsletter.txt', text)

  // Self-contained preview that works without a deploy, the logo is inlined
  // and the fonts are loaded from a local copy instead of knecht.works.
  const logo = readFileSync('public/assets/logo-wordmark.png').toString('base64')
  mkdirSync('out/fonts', { recursive: true })
  for (const font of ['geist-400.woff2', 'geist-700.woff2', 'geist-mono-400.woff2']) {
    copyFileSync(`public/assets/fonts/${font}`, `out/fonts/${font}`)
  }
  const preview = html
    .replace(LOGO_URL, `data:image/png;base64,${logo}`)
    .replaceAll('https://knecht.works/assets/fonts/', 'fonts/')
  writeFileSync('out/newsletter-preview.html', preview)

  console.log(`Dry-Run. Betreff wäre "${subject}".`)
  console.log('Original liegt in out/newsletter.html, lokale Vorschau in out/newsletter-preview.html.')
  setOutput('sent', 'false')
  process.exit(0)
}

const segmentId = testRun
  ? process.env.RESEND_TEST_SEGMENT_ID
  : process.env.RESEND_SEGMENT_ID

if (!process.env.RESEND_API_KEY || !segmentId) {
  throw new Error('RESEND_API_KEY oder Segment-ID fehlt.')
}

const from = process.env.NEWSLETTER_FROM || 'Knecht <news@knecht.works>'
const runDate = new Date().toISOString().slice(0, 10)

// 24 h window on purpose, until then the broadcast can be cancelled in the
// Resend dashboard and falls back to draft.
const broadcast = await resendPost('/broadcasts', {
  segment_id: segmentId,
  from,
  subject,
  html,
  text,
  name: `newsletter-${runDate}${testRun ? '-test' : ''}`,
  send: true,
  scheduled_at: 'in 24 hours'
})

console.log(`Broadcast ${broadcast.id} erstellt, Versand in 24 Stunden.${testRun ? ' (Test-Audience)' : ''}`)

// The workflow only tags real sends, test broadcasts must not move the marker.
setOutput('sent', testRun ? 'false' : 'true')
