// Adds a signup to Resend. Everyone lands in the "Updates" audience so general
// broadcasts reach all; beta testers are additionally added to the "Beta"
// audience for targeted access/test mails.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface SubscribeBody {
  email?: string
  mode?: 'beta' | 'updates'
}

export default defineEventHandler(async (event) => {
  const { email, mode } = await readBody<SubscribeBody>(event)

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 422, statusMessage: 'Ungültige E-Mail-Adresse.' })
  }

  const { resendApiKey, resendAudienceUpdates, resendAudienceBeta } = useRuntimeConfig(event)

  if (!resendApiKey || !resendAudienceUpdates) {
    throw createError({ statusCode: 500, statusMessage: 'Newsletter ist nicht konfiguriert.' })
  }

  // Add to one audience; treat an already-existing contact as success.
  const addToAudience = async (audienceId: string) => {
    try {
      await $fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}` },
        body: { email, unsubscribed: false }
      })
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode
      // 409 = contact already in this audience → fine.
      if (status !== 409) throw err
    }
  }

  await addToAudience(resendAudienceUpdates)

  if (mode === 'beta') {
    if (!resendAudienceBeta) {
      throw createError({ statusCode: 500, statusMessage: 'Beta-Audience ist nicht konfiguriert.' })
    }
    await addToAudience(resendAudienceBeta)
  }

  return { ok: true }
})
