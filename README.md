# knecht-www

The initial website (landing page) for **Knecht** — a self-hostable orchestration tool that connects to your GitHub repos and uses your own AI code agent to boot environments, fix issues, and deliver finished pull requests.

Built with [Nuxt](https://nuxt.com) + [Nuxt UI](https://ui.nuxt.com) and [Nuxt Content](https://content.nuxt.com). See [`library/`](./library) for the product specification this site is built around.

## Setup

Install the dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview the production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Docs Feedback

The thumbs up/down widget on the docs pages posts to `/api/docs-feedback`, which writes into a Cloudflare D1 database. Without the binding (local dev) the route only logs the vote.

1. Create a D1 database and apply [`server/db/docs-feedback.sql`](./server/db/docs-feedback.sql).
2. In the Pages project, bind it under Settings > Bindings as `DB`.
3. Query it in the D1 console, for example `SELECT path, vote, COUNT(*) FROM docs_feedback GROUP BY path, vote`.

## Content

Page copy lives in [`content/index.yml`](./content/index.yml) and is validated by the schema in [`content.config.ts`](./content.config.ts).
