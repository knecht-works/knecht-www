// Triggers the "new-contact" automation in Resend. The automation creates the
// contact if needed, adds it to the right segment and sends the welcome mail.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface SubscribeBody {
  email?: string
  mode?: 'beta' | 'updates'
  website?: string
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

  const { resendApiKey } = useRuntimeConfig(event)

  if (!resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Newsletter ist nicht konfiguriert.' })
  }

  await $fetch('https://api.resend.com/events/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}` },
    body: {
      event: 'new-contact',
      email,
      // Must match the payload values the automation expects.
      payload: { segment: mode === 'beta' ? 'beta' : 'updates' }
    }
  })

  return { ok: true }
})
