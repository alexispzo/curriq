# Curriq Landing Page — Design Spec
_2026-05-07_

## Overview

A single marketing landing page for Curriq — an AI instructional designer for indie course creators. No product functionality. Goal: collect waitlist emails to validate willingness to pay before building the product.

**Success metric:** 20–50 signups from strangers.

---

## Design Decisions

| Decision | Choice |
|---|---|
| Visual direction | Editorial — warm cream, serif, burnt orange |
| Heading typeface | Lora 700 (Google Fonts) |
| Body typeface | Lora 400 italic |
| Accent color | `#c9580a` (burnt orange) |
| Background | `#faf6f0` (warm cream) |
| Body text | `#7a6a58` |
| Dividers | `#e8ddd0` |
| How It Works layout | Stacked accent cards |
| Social proof content | Reddit quote + 250+ survey stat |
| Waitlist backend | Resend Contacts API (no confirmation email) |

---

## Architecture

### File Structure

```
app/
├── page.tsx                    # Composition root
├── layout.tsx                  # Lora font, metadata, cream background
├── globals.css                 # Tailwind base + font CSS variable
├── api/
│   └── waitlist/
│       └── route.ts            # POST → Resend Contacts API
└── components/
    ├── Hero.tsx                # "use client" — fade-up entrance animation
    ├── HowItWorks.tsx          # "use client" — staggered card scroll animation
    ├── SocialProof.tsx         # Static server component
    ├── WaitlistForm.tsx        # "use client" — form state + submit logic
    └── Footer.tsx              # Static server component
```

### Environment Variables

```
RESEND_API_KEY=...
RESEND_AUDIENCE_ID=...
```

---

## Page Sections

### Hero

- Wordmark: `curriq` — Lora 700, small, left-aligned
- Tag: `AI Instructional Designer` — 10px uppercase, burnt orange, tracked
- Headline: `Stop guessing your course structure.` — Lora 700, ~52px
- Subheadline: `Get a Bloom-mapped curriculum in 30 seconds — backed by real pedagogical thinking, not AI guesswork.` — Lora 400 italic
- CTA button: `Join the waitlist` — burnt orange, smooth-scrolls to `#waitlist`
- Entrance: Motion fade-up on load

### How It Works

- Section tag: `How it works`
- Heading: `From idea to curriculum in seconds.`
- 3 stacked accent cards, left orange border on step 1 (active):
  1. **Describe your course** — Topic, audience, and the transformation you want students to achieve
  2. **AI applies backwards design** — Bloom's taxonomy, prerequisite mapping, pacing suggestions — built in
  3. **Get your full curriculum** — Modules, per-lesson objectives, common misconceptions — ready to build from
- Animation: cards stagger in on scroll via Motion `whileInView`

### Social Proof

- Slightly darker cream panel: `#f0e8de`
- Large decorative open-quote mark (Lora, burnt orange)
- Quote: *"Coming up with the structure of my course is the hardest part."*
- Attribution: `— Course creator, r/OnlineCourses`
- Two stat pills below: `250+ creators surveyed` · `Course structure: top 3 blocker`

### Waitlist Form (`id="waitlist"`)

- Heading: `Be first when we launch.`
- Sub: `Early access · No spam · Unsubscribe any time`
- Inline row: email input + `Join the waitlist` button (stacks on mobile)
- States:
  - **Idle**: default
  - **Loading**: spinner in button, input + button disabled
  - **Success**: form replaced with `"You're on the list. We'll be in touch."`
  - **Error**: inline message `"Something went wrong — try again"`, button re-enabled

### Footer

- Single line: `© 2026 Curriq · Built for indie course creators`

---

## API Route: `POST /api/waitlist`

**Request:** `{ email: string }`

**Logic:**
1. Validate email format (regex, server-side only)
2. Call `resend.contacts.create({ email, audienceId })` 
3. Return `200 { ok: true }` on success
4. Return `400 { error: "Invalid email" }` on bad input
5. Return `500 { error: "Something went wrong" }` on Resend error

No confirmation email at this stage.

---

## Animations (Motion v12)

- **Hero**: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`, 0.6s ease
- **HowItWorks cards**: staggered `whileInView`, each card delays by 0.1s × index
- **WaitlistForm**: fade-in on scroll

---

## Out of Scope

- Auth, database, user accounts
- Product functionality (curriculum generator)
- Confirmation / welcome emails
- Analytics (can add later)
- Dark mode
