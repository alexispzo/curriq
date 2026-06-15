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

**Stack:** Next.js 16.2.5 App Router · React 19 · Tailwind v4 · TypeScript · `motion/react` v12 · Resend · `@anthropic-ai/sdk`

All application code lives under `app/`. The project uses the App Router exclusively — no Pages Router.

### Routing

- `app/page.tsx` — landing page (server component), composes section components
- `app/generate/page.tsx` — generation page (client component); manages the 4-state machine (idle / generating / done / error)
- `app/api/*/route.ts` — Route Handlers using native Web `Request`/`Response` APIs

Route Handlers are plain async functions exported by name (`GET`, `POST`, etc.). They use `Response.json(...)` and `new Response(...)` — not Next.js-specific helpers.

### Components

All components live in `app/components/`. They are either:
- **Server components** (no directive) — static sections like `Hero`, `HowItWorks`, `SampleOutput`, `SocialProof`, `Footer`
- **Client components** (`"use client"`) — anything with state or `motion/react` animations: `WaitlistForm`, `GenerateForm`, `CurriculumOutput`

There is no `lib/`, `utils/`, or shared helper layer.

#### Generation components

**`GenerateForm.tsx`** — 3-field form (topic / target audience / desired transformation). Validates on submit, focuses first invalid field on error, pre-fills from `initialValues` prop. Exports `FormValues` type.

**`CurriculumOutput.tsx`** — streaming curriculum renderer. Receives `{ topic, audience, transformation, modules, prereqNote, isStreaming, onEdit? }`. Shows input summary chip, animated module cards (fade-in from below via `motion/react`), blinking cursor on the active objective during streaming, prerequisite block, and action buttons (Copy / Edit inputs) when `isStreaming=false && onEdit` is provided. Exports `Module` type.

### Streaming architecture

`POST /api/generate` streams plain text (`text/plain; charset=utf-8`). Claude outputs one tagged line per newline:

```
MODULE: <title>
OBJECTIVE: <text>
BLOOM: <taxonomy levels>
PREREQ: <one sentence>
```

The client buffers incomplete lines and dispatches complete ones to a parser that incrementally updates `modules[]` and `prereqNote` state. On stream close, page transitions to `done`. On fetch/read error, transitions to `error`.

The system prompt is marked `cache_control: { type: "ephemeral" }` for Anthropic prompt caching. Rate limiting: 3 requests/IP/hour via module-level `Map` in the route handler.

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

- Max content width: `max-w-2xl mx-auto px-6` — used on every section and the generate page
- Section separation: `border-t border-divider py-20`
- Headings: `font-serif font-bold text-ink`
- Body/captions: `font-serif italic text-muted`
- Labels/badges: `font-sans text-xs font-semibold uppercase tracking-wider text-orange`
- All interactive elements: `min-h-[44px]` touch target floor
- Animations: always import from `"motion/react"` (not `"framer-motion"`); respect `useReducedMotion()`

### Environment variables

| Variable | Used in |
|---|---|
| `RESEND_API_KEY` | `app/api/waitlist/route.ts` |
| `RESEND_AUDIENCE_ID` | `app/api/waitlist/route.ts` |
| `ANTHROPIC_API_KEY` | `app/api/generate/route.ts` |

### Deployment

Deployed on Vercel with GitHub auto-deploy on push to `master`. No manual deploy step needed.

### Write zones

- **Human-authored (NEVER auto-write):** all source under `app/` (components, route handlers, `globals.css`), config, and copy. This is a hand-built codebase.
- **Machine-refreshable (safe to regenerate):** none in-repo. Curriculum generation streams to the browser at runtime (`POST /api/generate`) and is never written back to repo files. Treat every committed file as a human zone.
