# SampleOutput Section — Design Spec
_2026-05-08_

## Overview

Add a `SampleOutput` section to the Curriq landing page showing a concrete example of generated curriculum output. Goal: turn "how it works" into tangible proof — visitors see exactly what they'd receive before signing up.

---

## Placement

Inserted between `HowItWorks` and `SocialProof` in `app/page.tsx`.

Narrative flow: *how it works → proof of what it produces → social validation → sign up*

---

## Component

**File:** `app/components/SampleOutput.tsx`
**Type:** Static server component — no `"use client"`, no animations needed.

---

## Content

**Example inputs displayed:**
- Topic: How to start freelancing as a designer
- Audience: Complete beginners
- Goal: Land your first client in 90 days

**Three modules:**

### Module 1 — The Freelance Mindset Shift
- Define what freelancing actually means vs. a traditional job
- Identify the three fears that stop most beginners from ever starting
- Bloom's callout: `Remember + Understand`

### Module 2 — Positioning Your Design Services
- Choose a niche using the overlap of skill, demand, and enjoyment
- Write a one-sentence positioning statement a client could act on
- Bloom's callout: `Analyse + Apply`

### Module 3 — Landing Your First Client
- Build a 3-piece portfolio without paid work experience
- Send your first outreach message using the warm-contact method
- Bloom's callout: `Apply + Create`

**Prerequisite note:**
> Students should have basic proficiency in at least one design tool (Figma, Adobe XD, or similar). No business or marketing background required.

Callout: `Auto-detected from audience inputs`

---

## Visual Design

Follows all existing patterns — same tokens, same max-width, same section structure.

| Element | Treatment |
|---|---|
| Section tag | `See it in action` — `text-xs uppercase tracking-widest text-orange` |
| Heading | `What your curriculum actually looks like.` — Lora 700, `text-3xl` |
| Input metadata | Pill row on `bg-cream-dark` rounded panel — Topic · Audience · Goal |
| Module number | Burnt orange badge (`bg-orange text-white`) |
| Module title | Lora 700, `text-ink` |
| Objectives | Lora italic, `text-muted`, left `border-l-2 border-divider` |
| Bloom's callout | `↑ Bloom's level: X` — `text-xs text-orange font-sans` |
| Prereq note | Left `border-l-4 border-orange`, `bg-cream-dark`, Lora italic |
| Prereq callout | `↑ Auto-detected from audience inputs` — same callout style |
| Outer section | `border-t border-divider px-6 py-20`, cream background |

---

## Out of Scope

- No interactivity (no expand/collapse, no tab switching)
- No animation
- Content is hardcoded — not dynamically generated
