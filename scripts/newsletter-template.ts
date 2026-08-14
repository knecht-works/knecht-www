// Newsletter HTML for Resend broadcasts. Deliberately plain: no card, no
// forced backgrounds, near-default colors. Mail clients restyle emails in dark
// mode anyway (Gmail and Outlook invert even dark designs), so the mail is
// designed light and lets every client adapt it on its own. Table layout with
// inline styles only, link and image URLs must be absolute.
// {{{RESEND_UNSUBSCRIBE_URL}}} is replaced by Resend on send.

export interface NewsletterPost {
  title: string
  description: string
  date: string
  tag?: string
  url: string
}

const FOOTER_LINE = 'Knecht Works · Made in the EU 🇪🇺'

// Own filename for the mail logo. /assets/** ships with an immutable one-year
// cache and Gmail proxies images through its own cache, so bump the name
// whenever the image changes. Icon only: its own colors work on light and
// dark backgrounds, text or a chip would break in one of the two.
export const LOGO_URL = 'https://knecht.works/assets/knecht-head-square.png'

// Geist is the site font but rarely installed, the fallbacks carry the look.
const FONT_SANS = `'Geist', Helvetica, Arial, sans-serif`
const FONT_MONO = `'Geist Mono', 'SFMono-Regular', Consolas, 'Courier New', monospace`

const C = {
  title: '#18181b',
  text: '#3f3f46',
  muted: '#71717a',
  border: '#d4d4d8',
  divider: '#e4e4e7'
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
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(iso))

function renderPost(post: NewsletterPost, isLast: boolean): string {
  const tagPill = post.tag
    ? `<span class="mono" style="display:inline-block;margin-left:10px;padding:2px 10px;border:1px solid ${C.border};border-radius:999px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${escapeHtml(post.tag)}</span>`
    : ''

  return `
      <tr>
        <td style="padding:24px 0 ${isLast ? '8px' : '0'} 0;">
          <p class="mono" style="margin:0;font-family:${FONT_MONO};font-size:13px;color:${C.muted};">${formatDate(post.date)}${tagPill}</p>
          <h2 style="margin:10px 0 0 0;font-family:${FONT_SANS};font-size:20px;line-height:1.35;font-weight:bold;">
            <a href="${post.url}" style="color:${C.title};text-decoration:none;">${escapeHtml(post.title)}</a>
          </h2>
          ${post.description ? `<p style="margin:10px 0 0 0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.text};">${escapeHtml(post.description)}</p>` : ''}
          <p class="mono" style="margin:14px 0 0 0;font-family:${FONT_MONO};font-size:14px;">
            <a href="${post.url}" style="color:${C.title};text-decoration:underline;">Read more</a>
          </p>
          ${isLast ? '' : `<hr style="margin:24px 0 0 0;border:none;border-top:1px solid ${C.divider};">`}
        </td>
      </tr>`
}

export function renderNewsletter(posts: NewsletterPost[]): string {
  const intro = posts.length === 1
    ? 'A lot has happened since the last mail, and a new post is online. Enjoy reading.'
    : `A lot has happened since the last mail, and ${posts.length} new posts are online. Enjoy reading.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
</style>
<!--[if mso]>
<style>
  /* Outlook's Word engine drops the whole font stack when the first font is
     unknown, so force the mono fallback explicitly. */
  .mono, .mono a { font-family: Consolas, 'Courier New', monospace !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 20px 0;">
            <a href="https://knecht.works" style="text-decoration:none;">
              <img src="${LOGO_URL}" width="48" height="48" alt="Knecht" style="border:0;">
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 4px 0;">
            <p style="margin:0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.text};">
              Hi!
            </p>
            <p style="margin:12px 0 0 0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${C.text};">
              ${intro}
            </p>
          </td>
        </tr>
${posts.map((post, index) => renderPost(post, index === posts.length - 1)).join('\n')}
        <tr>
          <td style="padding:24px 0 0 0;">
            <hr style="margin:0 0 16px 0;border:none;border-top:1px solid ${C.divider};">
            <p style="margin:0;font-family:${FONT_SANS};font-size:12px;line-height:1.9;color:${C.muted};text-align:center;">
              You are receiving this mail because you signed up on
              <a href="https://knecht.works" style="color:${C.muted};">knecht.works</a>.<br>
              <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${C.muted};">Unsubscribe</a> ·
              <a href="https://knecht.works/impressum" style="color:${C.muted};">Legal notice</a> ·
              <a href="https://knecht.works/datenschutz" style="color:${C.muted};">Privacy policy</a><br>
              ${FOOTER_LINE}
            </p>
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
    'Hi!',
    '',
    posts.length === 1
      ? 'A lot has happened since the last mail, and a new post is online.'
      : `A lot has happened since the last mail, and ${posts.length} new posts are online.`,
    '',
    items.join('\n\n'),
    '',
    'Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}',
    FOOTER_LINE
  ].join('\n')
}
