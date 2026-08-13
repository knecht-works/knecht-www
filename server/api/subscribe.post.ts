// Triggers the "new-contact" automation in Resend. The automation creates the
// contact if needed, adds it to the right segment and sends the welcome mail.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface SubscribeBody {
  email?: string
  mode?: 'beta' | 'updates'
  website?: string
}

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
}

// Sends the admin a heads-up about the new signup. Runs detached, so a failure
// here never breaks the signup itself.
async function notifyAdmin({ apiKey, from, to, templateId, email, segment, country }: AdminNotice) {
  const time = new Date().toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })

  const rows: [string, string][] = [
    ['E-Mail', email],
    ['Segment', segment],
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
          variables: { email, segment, country, time }
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
  const { email, mode, website } = await readBody<SubscribeBody>(event)

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

  await $fetch('https://api.resend.com/events/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      event: 'new-contact',
      email,
      // Must match the payload values the automation expects.
      payload: { segment }
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
      country: getRequestHeader(event, 'cf-ipcountry') || 'unbekannt'
    }))
  }

  return { ok: true }
})
