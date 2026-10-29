// Triggers the "new-contact" automation in Resend. The automation creates the
// contact if needed, adds it to the right segment and sends the welcome mail.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface SubscribeBody {
  email?: string
  mode?: 'beta' | 'updates'
  website?: string
  type?: string
  name?: string
  url?: string
  hosting?: string
  stack?: string[]
  projects?: string
}

const HOSTING = ['managed', 'self-hosted', 'unsure']
const STACK = ['craft', 'drupal', 'kirby', 'laravel', 'typo3', 'php', 'wordpress', 'shopware', 'node', 'other']
const PROJECTS = ['none', '1-5', '6-20', '21-50', '50+']
const TYPE = ['agency', 'freelancer']

const pick = (value: unknown, allowed: string[]) =>
  typeof value === 'string' && allowed.includes(value) ? value : ''

// Optional answers from the beta form. Unknown values are dropped, empty
// strings keep the payload shape stable for the Resend automation.
function betaDetails(body: SubscribeBody) {
  const stack = Array.isArray(body.stack) ? body.stack.filter(item => STACK.includes(item)) : []
  return {
    type: pick(body.type, TYPE),
    name: typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '',
    url: typeof body.url === 'string' ? body.url.trim().slice(0, 200) : '',
    hosting: pick(body.hosting, HOSTING),
    stack: stack.join(', '),
    projects: pick(body.projects, PROJECTS)
  }
}

type BetaDetails = ReturnType<typeof betaDetails>

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!)
}

interface AdminNotice {
  apiKey: string
  from: string
  to: string
  templateId: string
  email: string
  segment: string
  country: string
  details: BetaDetails
}

// Runs detached, so a failure here never breaks the signup itself.
async function notifyAdmin({ apiKey, from, to, templateId, email, segment, country, details }: AdminNotice) {
  const time = new Date().toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })

  const detailRows: [string, string][] = [
    ['Typ', details.type],
    ['Name', details.name],
    ['Website', details.url],
    ['Hosting', details.hosting],
    ['Stack', details.stack],
    ['DDEV-Projekte', details.projects]
  ].filter(([, value]) => value) as [string, string][]

  const rows: [string, string][] = [
    ['E-Mail', email],
    ['Segment', segment],
    ...detailRows,
    ['Land', country],
    ['Zeit', time]
  ]

  // With a template ID the layout lives in Resend and only the variables are
  // sent. Template and html/text cannot be combined in one request. Variable
  // names are case-sensitive and must match the template exactly.
  const content = templateId
    ? {
        template: {
          id: templateId,
          variables: {
            email,
            segment,
            country,
            time,
            details: detailRows.map(([label, value]) => `${label}: ${value}`).join(' · ') || '-'
          }
        }
      }
    : {
        text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
        html: rows
          .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
          .join('')
      }

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: {
        from,
        to,
        subject: `Neue Anmeldung (${segment}): ${email}`,
        ...content
      }
    })
  } catch (error) {
    console.error('[subscribe] admin notification failed', error)
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubscribeBody>(event)
  const { email, mode, website } = body

  // Honeypot. The field is hidden in the form, only bots fill it.
  if (website) {
    return { ok: true }
  }

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 422, statusMessage: 'Ungültige E-Mail-Adresse.' })
  }

  const { resendApiKey, adminNotifyEmail, adminNotifyFrom, adminNotifyTemplateId } = useRuntimeConfig(event)

  if (!resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Newsletter ist nicht konfiguriert.' })
  }

  const segment = mode === 'beta' ? 'beta' : 'updates'
  const details = segment === 'beta'
    ? betaDetails(body)
    : { type: '', name: '', url: '', hosting: '', stack: '', projects: '' }

  await $fetch('https://api.resend.com/events/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      event: 'new-contact',
      email,
      // Must match the payload values the automation expects.
      payload: { segment, ...details }
    }
  })

  if (adminNotifyEmail) {
    // waitUntil keeps the request alive on Cloudflare without delaying the response.
    event.waitUntil(notifyAdmin({
      apiKey: resendApiKey,
      from: adminNotifyFrom,
      to: adminNotifyEmail,
      templateId: adminNotifyTemplateId,
      email,
      segment,
      country: getRequestHeader(event, 'cf-ipcountry') || 'unbekannt',
      details
    }))
  }

  return { ok: true }
})
