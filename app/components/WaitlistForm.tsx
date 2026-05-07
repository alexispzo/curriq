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
