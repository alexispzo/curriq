# SampleOutput Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static `SampleOutput` component between `HowItWorks` and `SocialProof` that shows a concrete annotated curriculum example.

**Architecture:** One new static server component (`app/components/SampleOutput.tsx`) with all content hardcoded. One line added to `app/page.tsx` to insert it in the correct position. No state, no animation, no client code.

**Tech Stack:** Next.js 16.2.5 App Router, Tailwind CSS v4 (existing `@theme` tokens: `text-orange`, `bg-cream-dark`, `border-divider`, `text-muted`, `text-ink`, `font-serif`), TypeScript

---

### Task 1: Create SampleOutput component

**Files:**
- Create: `app/components/SampleOutput.tsx`

- [ ] **Step 1: Create `app/components/SampleOutput.tsx`**

```tsx
export default function SampleOutput() {
  return (
    <section className="border-t border-divider px-6 py-20">
      <div className="mx-auto max-w-2xl">

        {/* Section label + heading */}
        <p className="mb-3 font-serif text-xs uppercase tracking-widest text-orange">
          See it in action
        </p>
        <h2 className="mb-8 font-serif text-3xl font-bold leading-snug text-ink">
          What your curriculum actually looks like.
        </h2>

        {/* Input metadata panel */}
        <div className="mb-10 rounded-lg bg-cream-dark px-5 py-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-orange">
                Topic
              </span>
              <span className="font-serif text-sm text-ink">
                How to start freelancing as a designer
              </span>
            </div>
            <div>
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-orange">
                Audience
              </span>
              <span className="font-serif text-sm text-ink">Complete beginners</span>
            </div>
            <div>
              <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-orange">
                Goal
              </span>
              <span className="font-serif text-sm text-ink">
                Land your first client in 90 days
              </span>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="flex flex-col gap-6">

          {/* Module 1 */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded bg-orange px-2 py-0.5 font-sans text-xs font-bold text-white">
                01
              </span>
              <h3 className="font-serif font-bold text-ink">
                The Freelance Mindset Shift
              </h3>
            </div>
            <ul className="flex flex-col gap-2 border-l-2 border-divider pl-4">
              <li className="font-serif text-sm italic leading-relaxed text-muted">
                Define what freelancing actually means vs. a traditional job
              </li>
              <li className="font-serif text-sm italic leading-relaxed text-muted">
                Identify the three fears that stop most beginners from ever starting
              </li>
            </ul>
            <p className="mt-2 font-sans text-xs text-orange">
              ↑ Bloom&apos;s level: Remember + Understand
            </p>
          </div>

          {/* Module 2 */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded bg-orange px-2 py-0.5 font-sans text-xs font-bold text-white">
                02
              </span>
              <h3 className="font-serif font-bold text-ink">
                Positioning Your Design Services
              </h3>
            </div>
            <ul className="flex flex-col gap-2 border-l-2 border-divider pl-4">
              <li className="font-serif text-sm italic leading-relaxed text-muted">
                Choose a niche using the overlap of skill, demand, and enjoyment
              </li>
              <li className="font-serif text-sm italic leading-relaxed text-muted">
                Write a one-sentence positioning statement a client could act on
              </li>
            </ul>
            <p className="mt-2 font-sans text-xs text-orange">
              ↑ Bloom&apos;s level: Analyse + Apply
            </p>
          </div>

          {/* Module 3 */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded bg-orange px-2 py-0.5 font-sans text-xs font-bold text-white">
                03
              </span>
              <h3 className="font-serif font-bold text-ink">
                Landing Your First Client
              </h3>
            </div>
            <ul className="flex flex-col gap-2 border-l-2 border-divider pl-4">
              <li className="font-serif text-sm italic leading-relaxed text-muted">
                Build a 3-piece portfolio without paid work experience
              </li>
              <li className="font-serif text-sm italic leading-relaxed text-muted">
                Send your first outreach message using the warm-contact method
              </li>
            </ul>
            <p className="mt-2 font-sans text-xs text-orange">
              ↑ Bloom&apos;s level: Apply + Create
            </p>
          </div>

          {/* Prerequisite note */}
          <div className="border-l-4 border-orange bg-cream-dark p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-orange">
              Prerequisite note
            </p>
            <p className="mt-1 font-serif text-sm italic leading-relaxed text-muted">
              Students should have basic proficiency in at least one design tool
              (Figma, Adobe XD, or similar). No business or marketing background
              required.
            </p>
            <p className="mt-2 font-sans text-xs text-orange">
              ↑ Auto-detected from audience inputs
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run build to confirm no TypeScript errors**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors. The component is static so no runtime concerns.

- [ ] **Step 3: Commit**

```bash
git add app/components/SampleOutput.tsx
git commit -m "feat: add SampleOutput section with annotated curriculum example"
```

---

### Task 2: Wire SampleOutput into page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `app/page.tsx`**

```tsx
import Footer from "@/app/components/Footer"
import Hero from "@/app/components/Hero"
import HowItWorks from "@/app/components/HowItWorks"
import SampleOutput from "@/app/components/SampleOutput"
import SocialProof from "@/app/components/SocialProof"
import WaitlistForm from "@/app/components/WaitlistForm"

export default function Page() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <SampleOutput />
      <SocialProof />
      <WaitlistForm />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Run build and do a quick visual check**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Then:

```bash
npm run dev
```

Open http://localhost:3000 and scroll to verify:
- [ ] SampleOutput appears between HowItWorks and SocialProof
- [ ] Input metadata panel shows Topic / Audience / Goal in cream-dark panel
- [ ] Three modules with orange numbered badges
- [ ] Objectives indented with left divider border, italic serif
- [ ] Orange `↑ Bloom's level:` callout under each module
- [ ] Prerequisite note has left orange border, cream-dark background
- [ ] Orange `↑ Auto-detected from audience inputs` callout under prereq

Stop dev server.

- [ ] **Step 3: Commit and push**

```bash
git add app/page.tsx
git commit -m "feat: insert SampleOutput between HowItWorks and SocialProof"
git push
```

Expected: Vercel auto-deploy triggers within seconds.
