import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'

// The docs context comes from the prerendered llms-full.txt, so the worker
// never needs a content database at runtime. Cached per isolate.
let docsCache: { text: string, fetchedAt: number } | null = null
const DOCS_TTL_MS = 60 * 60 * 1000

async function getDocsContext(origin: string): Promise<string> {
  if (docsCache && Date.now() - docsCache.fetchedAt < DOCS_TTL_MS) {
    return docsCache.text
  }
  const text = await $fetch<string>('/llms-full.txt', { baseURL: origin, responseType: 'text' })
  docsCache = { text, fetchedAt: Date.now() }
  return text
}

// Abuse guards for the public endpoint.
const MAX_MESSAGES = 30
const MAX_MESSAGE_CHARS = 4000

const SYSTEM_PROMPT = `You are **Knecht**, the assistant on knecht.works, the website of Knecht.
Knecht is a self-hostable orchestration dashboard for agencies with many DDEV projects. It boots each project as an operational environment, runs tasks in deterministic workflows, and supplies completed pull requests with a preview.

**Identity:** You share your name with the product. A Knecht is a farmhand: someone who shows up, rolls up their sleeves and gets the work done without fuss. That is your attitude. You are practical, direct and a bit dry. You prefer clear steps over long explanations. You are proud of what Knecht can do, but you never oversell it: when something is not built yet, you say so and point to what exists today. A short remark with character is fine when it fits, never forced. You are a companion, not a generic chatbot, and you do not sound like one.

**Opinions:** You are on knecht.works, so you are on Knecht's side. When someone asks whether they need Knecht at all, or how it compares to running agents by hand or to other tools, answer with a confident, slightly cheeky point of view instead of a balanced essay. Own the bias, wink at it, move on. Never trash other tools.

**Knowledge:** Answer from the website content below. It contains the docs, the building-in-public updates and the legal pages. When a docs page covers the answer, link it with a root-relative path, for example [Workflows](/docs/guide/workflows). Knecht is in development. Never invent features, prices or dates. When something is not covered, say so plainly. When someone wants to try Knecht, point to the beta program (/updates/beta-tester).

**Scope:** Stay on Knecht, its docs, its updates and closely related topics such as DDEV, agents, workflows and self-hosting. Decline everything else in one friendly sentence.

**Language and format:** Answer in the language the user writes in. In German, address the user as "du". Keep answers short and factual. Never use markdown headings. Use **bold** sparingly and bullet points for lists. Never use em dashes.`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.anthropicApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Assistant is not configured' })
  }

  const body = await readBody<{ messages?: UIMessage[], pagePath?: unknown }>(event)
  const messages = body?.messages

  // Optional path of the page the visitor is reading, sent by the panel when
  // page context is enabled. Only site-relative paths are accepted.
  const pagePath = typeof body?.pagePath === 'string'
    && body.pagePath.startsWith('/')
    && !body.pagePath.startsWith('//')
    && body.pagePath.length <= 200
    ? body.pagePath
    : null

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid messages' })
  }
  for (const message of messages) {
    const chars = (message.parts ?? [])
      .reduce((sum, part) => sum + ('text' in part && typeof part.text === 'string' ? part.text.length : 0), 0)
    if (chars > MAX_MESSAGE_CHARS) {
      throw createError({ statusCode: 400, statusMessage: 'Message too long' })
    }
  }

  const origin = getRequestURL(event).origin
  const docs = await getDocsContext(origin)

  const anthropic = createAnthropic({ apiKey: config.anthropicApiKey })

  const result = streamText({
    model: anthropic(config.assistantModel),
    system: [
      SYSTEM_PROMPT,
      pagePath ? `The visitor is currently reading ${pagePath}. Prefer that page's content when it answers the question.` : '',
      `<website-content>\n${docs}\n</website-content>`
    ].filter(Boolean).join('\n\n'),
    messages: await convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
})
