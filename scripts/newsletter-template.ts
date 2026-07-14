// Newsletter HTML for Resend broadcasts, styled after the site: dark panel,
// mono accents, mint highlights. Table layout with inline styles only, mail
// clients ignore stylesheets and modern CSS. Image and link URLs must be
// absolute. {{{RESEND_UNSUBSCRIBE_URL}}} is replaced by Resend on send.

export interface NewsletterPost {
  title: string
  description: string
  date: string
  tag?: string
  url: string
}

const FOOTER_LINE = 'Knecht Works · Made in the EU 🇪🇺'
const LOGO_URL = 'https://knecht.works/assets/logo-mail.png'

// Geist is the site font but rarely installed, the fallbacks carry the look.
const FONT_SANS = `'Geist', Helvetica, Arial, sans-serif`
const FONT_MONO = `'Geist Mono', 'SFMono-Regular', Consolas, 'Courier New', monospace`

// Dark theme tokens, matching the site (neutral-950 background, mint primary).
const C = {
  page: '#0a0a0a',
  card: '#141414',
  border: '#2a2a2a',
  divider: '#262626',
  highlighted: '#f5f5f5',
  muted: '#a3a3a3',
  dimmed: '#737373',
  primary: '#b7f8a2'
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
  }[char] as string))

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(iso))

function renderPost(post: NewsletterPost, isLast: boolean): string {
  const tagPill = post.tag
    ? `<span style="display:inline-block;margin-left:10px;padding:2px 10px;border:1px solid ${C.border};border-radius:999px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${escapeHtml(post.tag)}</span>`
    : ''

  return `
        <tr>
          <td style="padding:22px 24px ${isLast ? '26px' : '0'} 24px;">
            <div class="gmail-blend-screen"><div class="gmail-blend-difference">
            <p style="margin:0;font-family:${FONT_MONO};font-size:13px;color:${C.dimmed};">${formatDate(post.date)}${tagPill}</p>
            <h2 style="margin:10px 0 0 0;font-family:${FONT_SANS};font-size:19px;line-height:1.35;font-weight:bold;">
              <a href="${post.url}" style="color:${C.highlighted};text-decoration:none;">${escapeHtml(post.title)}</a>
            </h2>
            ${post.description ? `<p style="margin:10px 0 0 0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.muted};">${escapeHtml(post.description)}</p>` : ''}
            <p style="margin:14px 0 0 0;font-family:${FONT_MONO};font-size:14px;">
              <a href="${post.url}" style="color:${C.primary};text-decoration:none;">Weiterlesen &rarr;</a>
            </p>
            ${isLast ? '' : `<hr style="margin:22px 0 0 0;border:none;border-top:1px solid ${C.divider};">`}
            </div></div>
          </td>
        </tr>`
}

export function renderNewsletter(posts: NewsletterPost[]): string {
  const intro = posts.length === 1
    ? 'Hallo! Seit der letzten Mail ist bei Knecht wieder etwas weitergegangen. Ein neuer Beitrag ist online, und wie immer dokumentieren wir darin ehrlich, was funktioniert hat und was nicht. Viel Spaß beim Lesen.'
    : `Hallo! Seit der letzten Mail ist bei Knecht einiges weitergegangen. ${posts.length} neue Beiträge sind online, und wie immer dokumentieren wir darin ehrlich, was funktioniert hat und was nicht. Viel Spaß beim Lesen.`

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  /* Picked up by clients that load web fonts (Apple Mail, iOS). Gmail and
     Outlook ignore this and use the inline fallback stacks. */
  @font-face {
    font-family: 'Geist';
    font-style: normal;
    font-weight: 400;
    src: url(https://knecht.works/assets/fonts/geist-400.woff2) format('woff2');
  }
  @font-face {
    font-family: 'Geist';
    font-style: normal;
    font-weight: 700;
    src: url(https://knecht.works/assets/fonts/geist-700.woff2) format('woff2');
  }
  @font-face {
    font-family: 'Geist Mono';
    font-style: normal;
    font-weight: 400;
    src: url(https://knecht.works/assets/fonts/geist-mono-400.woff2) format('woff2');
  }
  /* Gmail dark mode inverts even dark emails. "u + .body" only matches in
     Gmail. The gradient locks pin the backgrounds (Gmail leaves
     background-image alone), the blend modes cancel the color inversion on
     the content. Everywhere else these rules never apply. */
  u + .body .bg-page { background-image: linear-gradient(${C.page}, ${C.page}); }
  u + .body .bg-card { background-image: linear-gradient(${C.card}, ${C.card}); }
  u + .body .gmail-blend-screen { background: #000; mix-blend-mode: screen; }
  u + .body .gmail-blend-difference { background: #000; mix-blend-mode: difference; }
</style>
</head>
<body class="body" style="margin:0;padding:0;background-color:${C.page};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.page}" class="bg-page" style="background-color:${C.page};padding:16px 8px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="${C.card}" class="bg-card" style="max-width:600px;width:100%;background-color:${C.card};border:1px solid ${C.border};border-radius:16px;">
        <tr>
          <td style="padding:24px 24px 0 24px;">
            <a href="https://knecht.works" style="text-decoration:none;">
              <img src="${LOGO_URL}" width="82" height="32" alt="Knecht" style="border:0;">
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 24px 0 24px;">
            <div class="gmail-blend-screen"><div class="gmail-blend-difference">
            <p style="margin:0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.muted};">
              ${intro}
            </p>
            </div></div>
          </td>
        </tr>
${posts.map((post, index) => renderPost(post, index === posts.length - 1)).join('\n')}
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:16px 24px;font-family:${FONT_SANS};font-size:12px;line-height:1.9;color:${C.dimmed};text-align:center;">
            <div class="gmail-blend-screen"><div class="gmail-blend-difference">
            Du bekommst diese Mail, weil du dich auf
            <a href="https://knecht.works" style="color:${C.muted};">knecht.works</a> angemeldet hast.<br>
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${C.muted};">Newsletter abbestellen</a> ·
            <a href="https://knecht.works/impressum" style="color:${C.muted};">Impressum</a> ·
            <a href="https://knecht.works/datenschutz" style="color:${C.muted};">Datenschutz</a><br>
            ${FOOTER_LINE}
            </div></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

export function renderNewsletterText(posts: NewsletterPost[]): string {
  const items = posts.map(post => [
    `${post.title} (${formatDate(post.date)})`,
    post.description,
    post.url
  ].filter(Boolean).join('\n'))

  return [
    posts.length === 1
      ? 'Hallo! Seit der letzten Mail ist bei Knecht wieder etwas weitergegangen. Ein neuer Beitrag ist online.'
      : `Hallo! Seit der letzten Mail ist bei Knecht einiges weitergegangen. ${posts.length} neue Beiträge sind online.`,
    '',
    items.join('\n\n'),
    '',
    'Newsletter abbestellen: {{{RESEND_UNSUBSCRIBE_URL}}}',
    FOOTER_LINE
  ].join('\n')
}
