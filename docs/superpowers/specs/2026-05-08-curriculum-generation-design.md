# Curriculum Generation Feature — Design Spec

**Date:** 2026-05-08  
**Status:** Approved  
**Scope:** End-to-end generation flow — form input → Claude API streaming → rendered curriculum output

---

## Overview

Add a live curriculum generation page at `/generate`. Users fill in three inputs (topic, target audience, desired transformation), submit, and watch Claude stream a structured, Bloom-mapped curriculum into view in real time. No auth, no payments, no database.

The landing page gains a second CTA ("Generate your curriculum →") pointing to `/generate`. The existing waitlist CTA and all other landing page sections stay untouched.

---

## Entry Point

**Landing page change (Hero.tsx only):**

The current single CTA becomes two:
- Primary: `"Generate your curriculum →"` — burnt orange filled button, links to `/generate`
- Secondary: `"Join the waitlist"` — ghost button (white bg, orange border + text), links to `#waitlist`

No other sections on the landing page change.

---

## Architecture

### File structure

```
app/
  generate/
    page.tsx                  ← new page (client component)
  api/
    generate/
      route.ts                ← new streaming API route
  components/
    GenerateForm.tsx           ← 3-input form
    CurriculumOutput.tsx       ← streaming output renderer
  page.tsx                    ← updated (Hero dual CTA)
  components/
    Hero.tsx                  ← updated (dual CTA)
```

### New dependency

```bash
npm install @anthropic-ai/sdk
```

No other new dependencies. All other packages (`motion/react`, Tailwind v4, TypeScript) are already installed.

---

## API Route — `/api/generate`

**File:** `app/api/generate/route.ts`

### Rate limiting

Module-level `Map` — persists across requests within the same server process:

```ts
const ipCounts = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
```

IP is read from `request.headers.get("x-forwarded-for")` (Vercel sets this), falling back to `"unknown"`. Requests from `"unknown"` are counted under the same bucket (safe for solo early-stage use).

When the limit is exceeded, return:
```json
{ "error": "rate_limited" }
```
with status `429`.

### Input validation

Required fields: `topic`, `audience`, `transformation` — all must be non-empty strings, max 500 chars each. Return `400` with `{ "error": "invalid_input" }` if validation fails.

### Claude streaming

Use `@anthropic-ai/sdk` with `messages.stream()`. The system prompt is marked `cache_control: { type: "ephemeral" }` so it is cached across requests.

**System prompt (static, fully cacheable):**

```
You are an expert instructional designer. Given a course topic, target audience,
and desired transformation, apply backwards design to produce a structured curriculum.

Output format — one line per item, no other text, no markdown, no blank lines:
MODULE: <module title>
OBJECTIVE: <one Bloom's-verb learning objective>
BLOOM: <Bloom's taxonomy levels covered, e.g. "Remember + Understand">
PREREQ: <one sentence on prerequisite knowledge>

Rules:
- 3–6 modules
- 2–4 OBJECTIVE lines per module, immediately after its MODULE line
- One BLOOM line per module, immediately after its objectives
- One PREREQ line at the very end, after all modules
- No preamble, no closing remarks, no extra lines
```

**User message (not cached, unique per request):**

```
Topic: {topic}
Target audience: {audience}
Desired transformation: {transformation}
```

### Streaming response

The route returns a `ReadableStream` with `Content-Type: text/plain; charset=utf-8`. Lines from Claude are piped through as-is. The client splits on `\n` and dispatches tagged lines to state.

```ts
export async function POST(request: Request) {
  // 1. Rate limit check
  // 2. Input validation
  // 3. Create Anthropic client
  // 4. Call messages.stream() with cached system prompt
  // 5. Return ReadableStream piping Claude's text chunks
}
```

---

## Streaming Protocol

Claude outputs one tagged line at a time. The client parses each `\n`-delimited line:

| Prefix | Action |
|--------|--------|
| `MODULE: <title>` | Push new module object `{ title, objectives: [], bloom: "" }` to state |
| `OBJECTIVE: <text>` | Append to current module's `objectives[]` |
| `BLOOM: <level>` | Set current module's `bloom` field |
| `PREREQ: <text>` | Set top-level `prereqNote` field |
| Anything else | Silently skip (malformed lines dropped) |

The parser is forgiving — unrecognised lines never throw. A module card renders as soon as its `MODULE:` line arrives; objectives stream in underneath it; the Bloom tag appears when `BLOOM:` arrives.

---

## `/generate` Page — State Machine

**File:** `app/generate/page.tsx`

Four states:

| State | Description |
|-------|-------------|
| `idle` | Form visible, inputs empty or pre-filled (when editing) |
| `generating` | Form replaced by compact input summary chip + spinner + progressively rendering modules |
| `done` | Full curriculum rendered + "Copy curriculum" + "Edit inputs" action buttons |
| `error` | Error message inline with retry button, form reappears |

### `idle` state

- Breadcrumb: `← curriq` linking back to `/`
- Page title: `"Design your curriculum."` (Lora serif, bold)
- Subtitle: `"Describe your course and get a Bloom-mapped structure in seconds."` (Lora italic, muted)
- Three labelled inputs (see GenerateForm below)
- Submit button: `"Generate curriculum →"`

### `generating` state

- Breadcrumb stays
- Page title stays
- Input summary chip (cream-dark bg, three `TOPIC / AUDIENCE / GOAL` pills) replaces the form
- Spinner (orange border-top, 14px, `animate-spin`) + italic muted label `"Building your curriculum…"`
- Module cards appear progressively as lines arrive
- The last objective in the actively-streaming module shows a blinking `|` cursor using `motion.span` with Variants (see Animation section)

### `done` state

- Spinner disappears
- All module cards visible
- Prerequisite block rendered (orange left border, cream-dark bg)
- Action buttons: `"Copy curriculum"` and `"← Edit inputs"` (both ghost style, row, border-top divider)
- "Copy curriculum" flips to `"Copied!"` for 2 seconds then resets (no toast)
- "← Edit inputs" restores `idle` state with all three inputs pre-filled

### `error` state

| Scenario | Message |
|----------|---------|
| Rate limited (429) | `"You've generated 3 curricula this hour. Come back later."` |
| Claude API error | `"Something went wrong generating your curriculum."` + retry button |
| Stream interrupted mid-way | Whatever modules arrived are shown + `"Generation was cut short — try again."` + retry button |
| Validation failure | Field-level errors, no API call made |

---

## Components

### `GenerateForm.tsx`

Three fields, all required:

| Field | Label | Input type | Placeholder |
|-------|-------|------------|-------------|
| Topic | `TOPIC` | `<input type="text">` | `"e.g. Freelance design, sourdough baking…"` |
| Audience | `TARGET AUDIENCE` | `<input type="text">` | `"e.g. Complete beginners with no clients yet"` |
| Transformation | `DESIRED TRANSFORMATION` | `<textarea>` (2 rows) | `"e.g. Land your first client in 90 days"` |

- All labels use orange small-caps (`font-sans text-xs font-semibold uppercase tracking-wider text-orange`)
- All inputs: `min-height: 44px`, `border border-divider bg-white`, focus ring `focus:border-orange`
- Validation: on submit only (not on keystroke). Empty fields get `border-orange` highlight + inline error below the field
- Button disabled + spinner during `generating` state, matching `WaitlistForm` pattern

### `CurriculumOutput.tsx`

Receives `{ topic, audience, transformation, modules, prereqNote }` as props. Only rendered when state is `generating` or `done` (the page unmounts it during `idle` and `error`). Renders:

1. Input summary chip — three pills showing the submitted inputs (`TOPIC / AUDIENCE / GOAL`)
2. Module cards — one per module:
   - Number badge: `01`, `02` … (orange bg, white text, `font-sans text-xs font-bold`)
   - Module title (Lora serif bold)
   - Objectives list — `border-l-2 border-divider pl-4`, each objective `font-serif text-sm italic text-muted`
   - Bloom tag — `font-sans text-xs text-orange` prefixed with `↑`
3. Prerequisite block (same as `SampleOutput`: orange left border, cream-dark bg, orange label)

This component is read-only; it receives state from the parent page and never manages its own data.

---

## Animation

All animations use the existing `motion/react` dependency. All must respect `prefers-reduced-motion`.

### Streaming cursor

On the last objective of the actively-streaming module:

```tsx
<motion.span
  variants={{
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.01, repeat: Infinity, repeatDelay: 0.4, repeatType: "reverse" }
    }
  }}
  initial="initial"
  animate="animate"
  className="inline-block w-px h-3 bg-orange align-middle ml-0.5"
/>
```

Cursor disappears when the module's `BLOOM:` line arrives (module is complete).

### Module card entrance (during streaming)

Each new module card fades in from below as its `MODULE:` line arrives — no stagger, just immediate per-card entrance:

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

Cards are already on screen when streaming completes, so no re-entrance animation fires in the `done` state. The `done` transition is just the spinner disappearing and the action bar fading in (`opacity: 0 → 1`, 200ms).

### Reduced motion

Wrap all `motion` components with:
```tsx
const prefersReducedMotion = useReducedMotion()
```
Pass `duration: 0` and skip stagger delays when true.

---

## Visual Design

The `/generate` page shares the full design system of the landing page:

- **Background:** `#faf6f0` (cream) + subtle CSS noise grain overlay at 3% opacity (`background-image: url("data:image/svg+xml,...")` — a minimal SVG noise pattern)
- **Max width:** `max-w-2xl mx-auto px-6` — matches all landing page sections
- **Typography:** Lora serif for headings and body text, `font-sans` (system sans) for labels and badges
- **Accent:** `#c9580a` (orange) for badges, labels, Bloom tags, focus rings, cursor
- **Dividers:** `border-divider` (`#e8ddd0`) for section separation
- **Cards/surfaces:** `bg-white border border-divider` for module cards; `bg-cream-dark` for input summary and prereq

No new CSS variables or Tailwind config needed — all tokens already defined in `globals.css`.

---

## Accessibility

- All form inputs have explicit `<label htmlFor>` associations
- Submit button has `aria-busy="true"` during `generating` state
- The streaming output region has `aria-live="polite"` so screen readers announce newly arriving module content
- Error messages use `role="alert"` for immediate announcement
- Focus is moved to the first invalid field on submit validation failure
- All interactive elements meet the 44px touch target floor
- Cursor animation and stagger animations suppressed when `prefers-reduced-motion` is enabled

---

## Landing Page Change

**`Hero.tsx` only.** Current single CTA anchor tag becomes two buttons side by side (stacked on mobile):

```tsx
<div className="mt-8 flex flex-col gap-3 sm:flex-row">
  <a href="/generate" className="... bg-orange text-white ...">
    Generate your curriculum →
  </a>
  <a href="#waitlist" className="... bg-white border border-orange text-orange ...">
    Join the waitlist
  </a>
</div>
```

---

## Out of Scope

- Authentication or user accounts
- Saving or persisting generated curricula
- PDF or markdown export
- Sharing generated curricula via URL
- Analytics or event tracking on the generation page
- Dark mode
