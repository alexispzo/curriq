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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/generate"
              className="inline-flex min-h-[44px] items-center justify-center rounded bg-orange px-6 py-3 font-serif text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Generate your curriculum →
            </a>
            <a
              href="#waitlist"
              className="inline-flex min-h-[44px] items-center justify-center rounded border border-orange bg-white px-6 py-3 font-serif text-sm font-bold text-orange transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Join the waitlist
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
