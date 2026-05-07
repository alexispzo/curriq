# Curriq Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Curriq marketing landing page — Hero, How It Works, Social Proof, Waitlist Form, Footer — with a Resend-backed email capture API route.

**Architecture:** Section-component approach. Each page section is an isolated component in `app/components/`. `"use client"` only on components that need Motion animations or React state. API route at `app/api/waitlist/route.ts` calls Resend Contacts API. No test framework is installed — verification uses `curl` for the API and browser for UI.

**Tech Stack:** Next.js 16.2.5 App Router, React 19, Tailwind CSS v4 (`@theme` tokens), Motion v12 (`motion/react`), Resend SDK, TypeScript, Lora via `next/font/google`

---

### Task 1: Install Resend and configure environment

**Files:**
- Modify: `.gitignore`
- Create: `.env.local`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install the Resend SDK**

```bash
npm install resend
```

Expected: `node_modules/resend/` created, `package.json` `dependencies` updated with `"resend": "..."`.

- [ ] **Step 2: Add `.superpowers/` to `.gitignore`**

Open `.gitignore`. Add this block before the `# typescript` section:

```
# brainstorm session files
.superpowers/
```

- [ ] **Step 3: Create `.env.local`**

Create `/.env.local` at the project root:

```
RESEND_API_KEY=re_your_api_key_here
```

> To get a real key: sign up at resend.com → API Keys → Create API Key.

- [ ] **Step 4: Commit**

```bash
git add .gitignore package.json package-lock.json
git commit -m "chore: install resend, ignore .superpowers"
```

---

### Task 2: Configure fonts, design tokens, and root layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

Tailwind v4 uses `@theme {}` blocks in CSS (no `tailwind.config.js`) to define custom tokens. Defining `--color-orange` in `@theme` creates `bg-orange`, `text-orange`, `border-orange` utility classes automatically.

Lora is not a variable font — explicit weights must be listed. The `variable` option emits a CSS custom property (`--font-lora`) on the `<html>` element. We then wire `--font-lora` to `--font-serif` in `@theme`, which overrides Tailwind's built-in `font-serif` utility to use Lora throughout.

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-cream: #faf6f0;
  --color-cream-dark: #f0e8de;
  --color-orange: #c9580a;
  --color-ink: #1a1a1a;
  --color-muted: #7a6a58;
  --color-divider: #e8ddd0;
  --font-serif: var(--font-lora);
}

body {
  background-color: #faf6f0;
  color: #1a1a1a;
}
```

- [ ] **Step 2: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import { Lora } from "next/font/google"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Curriq — AI Instructional Designer",
  description:
    "Stop guessing your course structure. Get a Bloom-mapped curriculum in 30 seconds — backed by real pedagogical thinking.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Start dev server to confirm fonts load**

```bash
npm run dev
```

Open http://localhost:3000. The default page renders on a cream (`#faf6f0`) background with no console errors. Stop dev server with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: configure Lora font and editorial design tokens"
```

---

### Task 3: Create the waitlist API route

**Files:**
- Create: `app/api/waitlist/route.ts`

Route handlers in Next.js 16 use native Web `Request` and `Response` APIs. The file exports a named `POST` function. No `NextRequest` needed here.

- [ ] **Step 1: Create `app/api/waitlist/route.ts`**

```ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 })
  }

  try {
    await resend.contacts.create({ email: body.email })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Start dev server and test the route**

```bash
npm run dev
```

In a second terminal, run these curl commands and verify the expected responses:

```bash
# Invalid email → 400
curl -s -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail"}'
```
Expected: `{"error":"Invalid email"}`

```bash
# Missing field → 400
curl -s -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{}'
```
Expected: `{"error":"Invalid email"}`

```bash
# Valid email with placeholder key → 500 (reaches Resend, fails auth)
curl -s -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
Expected: `{"error":"Something went wrong"}` — confirms the route reaches the Resend call. Once a real API key is set, this returns `{"ok":true}`.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add app/api/waitlist/route.ts
git commit -m "feat: add waitlist API route with Resend integration"
```

---

### Task 4: Create Footer component

**Files:**
- Create: `app/components/Footer.tsx`

Static server component — no `"use client"` needed.

- [ ] **Step 1: Create `app/components/Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-divider py-8 px-6">
      <p className="text-center font-serif text-sm italic text-muted">
        © 2026 Curriq · Built for indie course creators
      </p>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Footer.tsx
git commit -m "feat: add Footer component"
```

---

### Task 5: Create SocialProof component

**Files:**
- Create: `app/components/SocialProof.tsx`

Static server component. The `bg-cream-dark` class maps to `#f0e8de` from the `@theme` token defined in Task 2.

- [ ] **Step 1: Create `app/components/SocialProof.tsx`**

```tsx
export default function SocialProof() {
  return (
    <section className="bg-cream-dark px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <span
          className="block font-serif text-6xl leading-none text-orange select-none"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <blockquote className="mt-2">
          <p className="font-serif text-2xl italic leading-relaxed text-ink">
            Coming up with the structure of my course is the hardest part.
          </p>
          <footer className="mt-6 font-serif text-sm italic text-muted">
            — Course creator, r/OnlineCourses
          </footer>
        </blockquote>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full border border-divider bg-cream px-4 py-1.5 font-serif text-xs text-muted">
            250+ creators surveyed
          </span>
          <span className="rounded-full border border-divider bg-cream px-4 py-1.5 font-serif text-xs text-muted">
            Course structure: top 3 blocker
          </span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/SocialProof.tsx
git commit -m "feat: add SocialProof component"
```

---

### Task 6: Create Hero component

**Files:**
- Create: `app/components/Hero.tsx`

`"use client"` is required because Motion's `animate` prop runs on the client. The CTA `href="#waitlist"` smooth-scrolls to the WaitlistForm section (added in Task 8).

- [ ] **Step 1: Create `app/components/Hero.tsx`**

```tsx
"use client"

import { motion } from "motion/react"

export default function Hero() {
  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-8 font-serif text-xs font-bold uppercase tracking-widest text-ink">
            curriq
          </p>
          <p className="mb-3 font-serif text-xs uppercase tracking-widest text-orange">
            AI Instructional Designer
          </p>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
            Stop guessing your course structure.
          </h1>
          <p className="mt-6 font-serif text-lg italic leading-relaxed text-muted">
            Get a Bloom-mapped curriculum in 30 seconds — backed by real
            pedagogical thinking, not AI guesswork.
          </p>
          <a
            href="#waitlist"
            className="mt-8 inline-block rounded bg-orange px-6 py-3 font-serif text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Join the waitlist
          </a>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Hero.tsx
git commit -m "feat: add Hero component with Motion entrance animation"
```

---

### Task 7: Create HowItWorks component

**Files:**
- Create: `app/components/HowItWorks.tsx`

`"use client"` required for `whileInView`. `viewport={{ once: true }}` ensures cards only animate in once (not every time you scroll past).

- [ ] **Step 1: Create `app/components/HowItWorks.tsx`**

```tsx
"use client"

import { motion } from "motion/react"

const steps = [
  {
    number: "1",
    title: "Describe your course",
    description:
      "Topic, audience, and the transformation you want students to achieve.",
    active: true,
  },
  {
    number: "2",
    title: "AI applies backwards design",
    description:
      "Bloom's taxonomy, prerequisite mapping, pacing suggestions — built in.",
    active: false,
  },
  {
    number: "3",
    title: "Get your full curriculum",
    description:
      "Modules, per-lesson objectives, common misconceptions — ready to build from.",
    active: false,
  },
]

export default function HowItWorks() {
  return (
    <section className="border-t border-divider px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 font-serif text-xs uppercase tracking-widest text-orange">
          How it works
        </p>
        <h2 className="mb-10 font-serif text-3xl font-bold leading-snug text-ink">
          From idea to curriculum in seconds.
        </h2>
        <div className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
              className={`flex gap-4 rounded-lg border bg-white p-5 ${
                step.active ? "border-orange" : "border-divider"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.active
                    ? "bg-orange text-white"
                    : "bg-cream-dark text-orange"
                }`}
              >
                {step.number}
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink">{step.title}</h3>
                <p className="mt-1 font-serif text-sm italic leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/HowItWorks.tsx
git commit -m "feat: add HowItWorks component with staggered scroll animation"
```

---

### Task 8: Create WaitlistForm component

**Files:**
- Create: `app/components/WaitlistForm.tsx`

`"use client"` required for `useState` and the submit handler. The `id="waitlist"` matches the `href="#waitlist"` in Hero. The spinner is a pure CSS `animate-spin` border trick — no extra packages needed.

- [ ] **Step 1: Create `app/components/WaitlistForm.tsx`**

```tsx
"use client"

import { motion } from "motion/react"
import { useState } from "react"

type Status = "idle" | "loading" | "success" | "error"

export default function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data: { ok?: boolean; error?: string } = await res.json()
      setStatus(data.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <motion.section
      id="waitlist"
      className="border-t border-divider px-6 py-20"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="font-serif text-3xl font-bold text-ink">
          Be first when we launch.
        </h2>
        <p className="mt-2 font-serif text-sm italic text-muted">
          Early access · No spam · Unsubscribe any time
        </p>

        {status === "success" ? (
          <p className="mt-8 font-serif text-lg italic text-orange">
            You&apos;re on the list. We&apos;ll be in touch.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 rounded border border-divider bg-white px-4 py-3 font-serif text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center rounded bg-orange px-6 py-3 font-serif text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Join the waitlist"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 font-serif text-sm italic text-orange">
            Something went wrong — try again.
          </p>
        )}
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/WaitlistForm.tsx
git commit -m "feat: add WaitlistForm with idle/loading/success/error states"
```

---

### Task 9: Wire up page.tsx and verify the full page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Footer from "@/app/components/Footer"
import Hero from "@/app/components/Hero"
import HowItWorks from "@/app/components/HowItWorks"
import SocialProof from "@/app/components/SocialProof"
import WaitlistForm from "@/app/components/WaitlistForm"

export default function Page() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <SocialProof />
      <WaitlistForm />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Run dev and do a full visual check**

```bash
npm run dev
```

Open http://localhost:3000. Verify each item:

- [ ] Page background is cream (`#faf6f0`) — not white, not grey
- [ ] Hero: `curriq` wordmark visible, fade-up animation plays on load
- [ ] Hero: "AI Instructional Designer" label in burnt orange above the headline
- [ ] Hero: headline in large Lora bold, subheadline in italic
- [ ] Hero: "Join the waitlist" button is burnt orange
- [ ] Clicking the CTA button smooth-scrolls to the form section
- [ ] How It Works: 3 cards stagger in as you scroll down; step 1 has orange left border and orange dot
- [ ] Social Proof: background is slightly darker cream; large quote mark visible; two stat pills below
- [ ] Waitlist form: inline row on wide viewport; stacks vertically at mobile widths
- [ ] Waitlist form: submitting with placeholder keys shows error state; button re-enables
- [ ] Footer: one italic line centred

- [ ] **Step 3: Run build to catch TypeScript errors**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with zero errors. If any TypeScript errors appear, fix them before committing.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose Curriq landing page"
```

---

## After the plan: going live

1. **Get real Resend credentials:**
   - Sign up at resend.com
   - API Keys → Create API Key → copy value into `RESEND_API_KEY`

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```
   Set `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` in Vercel → Project → Settings → Environment Variables.

3. **Test live form** with a real email to confirm contacts appear in your Resend Audience dashboard.
