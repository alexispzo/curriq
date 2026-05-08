# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js version warning

This project runs **Next.js 16.2.5** — a version with breaking changes from training data. Before writing any route handler, data-fetching, or rendering code, read the relevant guide in `node_modules/next/dist/docs/`. Key guides: `01-app/02-guides/forms.md`, `01-app/03-api-reference/03-file-conventions/route.md`. Heed all deprecation notices in the docs.

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build (also acts as type-check)
npm run lint     # ESLint
```

There is no test suite. `npm run build` is the fastest way to catch TypeScript and lint errors together.

## Architecture

**Stack:** Next.js 16.2.5 App Router · React 19 · Tailwind v4 · TypeScript · `motion/react` v12 · Resend

All application code lives under `app/`. The project uses the App Router exclusively — no Pages Router.

### Routing

- `app/page.tsx` — landing page (server component), composes section components
- `app/generate/page.tsx` — generation page (client component, to be built)
- `app/api/*/route.ts` — Route Handlers using native Web `Request`/`Response` APIs

Route Handlers are plain async functions exported by name (`GET`, `POST`, etc.). They use `Response.json(...)` and `new Response(...)` — not Next.js-specific helpers.

### Components

All components live in `app/components/`. They are either:
- **Server components** (no directive) — static sections like `Hero`, `HowItWorks`, `SampleOutput`, `SocialProof`, `Footer`
- **Client components** (`"use client"`) — anything with state or `motion/react` animations, currently `WaitlistForm`

There is no `lib/`, `utils/`, or shared helper layer yet.

### Styling

Tailwind v4 is configured entirely through `app/globals.css` — there is no `tailwind.config.*` file. Custom design tokens are defined in the `@theme` block:

```css
--color-cream: #faf6f0
--color-cream-dark: #f0e8de
--color-orange: #c9580a
--color-ink: #1a1a1a
--color-muted: #7a6a58
--color-divider: #e8ddd0
--font-serif: var(--font-lora)   /* Lora loaded via next/font in layout.tsx */
```

Use these tokens (`text-orange`, `bg-cream-dark`, `border-divider`, `font-serif`, etc.) rather than raw hex values. Do not add new tokens without updating `globals.css`.

### Design conventions

- Max content width: `max-w-2xl mx-auto px-6` — used on every section
- Section separation: `border-t border-divider py-20`
- Headings: `font-serif font-bold text-ink`
- Body/captions: `font-serif italic text-muted`
- Labels/badges: `font-sans text-xs font-semibold uppercase tracking-wider text-orange`
- Animations: always use `motion/react` (import from `"motion/react"`, not `"framer-motion"`)

### Environment variables

| Variable | Used in |
|---|---|
| `RESEND_API_KEY` | `app/api/waitlist/route.ts` |
| `RESEND_AUDIENCE_ID` | `app/api/waitlist/route.ts` |
| `ANTHROPIC_API_KEY` | `app/api/generate/route.ts` (to be built) |

### Deployment

Deployed on Vercel with GitHub auto-deploy on push to `master`. No manual deploy step needed.
