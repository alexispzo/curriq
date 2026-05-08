"use client"

import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"

export type Module = {
  title: string
  objectives: string[]
  bloom: string
}

type Props = {
  topic: string
  audience: string
  transformation: string
  modules: Module[]
  prereqNote: string
  isStreaming: boolean
  onEdit?: () => void
}

export default function CurriculumOutput({
  topic,
  audience,
  transformation,
  modules,
  prereqNote,
  isStreaming,
  onEdit,
}: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")

  const showActions = !isStreaming && onEdit !== undefined && modules.length > 0

  function buildCopyText(): string {
    const lines: string[] = [
      `Topic: ${topic}`,
      `Audience: ${audience}`,
      `Goal: ${transformation}`,
      "",
    ]
    modules.forEach((m, i) => {
      lines.push(`Module ${i + 1}: ${m.title}`)
      m.objectives.forEach(o => lines.push(`  - ${o}`))
      if (m.bloom) lines.push(`  Bloom's level: ${m.bloom}`)
      lines.push("")
    })
    if (prereqNote) lines.push(`Prerequisites: ${prereqNote}`)
    return lines.join("\n").trim()
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText())
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 2000)
    } catch {
      // clipboard API unavailable — fail silently
    }
  }

  return (
    <div>
      {/* Input summary chip */}
      <div className="mb-8 rounded-lg bg-cream-dark px-5 py-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div>
            <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-orange">
              Topic
            </span>
            <span className="font-serif text-sm text-ink">{topic}</span>
          </div>
          <div>
            <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-orange">
              Audience
            </span>
            <span className="font-serif text-sm text-ink">{audience}</span>
          </div>
          <div>
            <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-orange">
              Goal
            </span>
            <span className="font-serif text-sm text-ink">{transformation}</span>
          </div>
        </div>
      </div>

      {/* Spinner — only while streaming */}
      {isStreaming && (
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-divider border-t-orange"
          />
          <span className="font-serif text-sm italic text-muted">
            Building your curriculum…
          </span>
        </div>
      )}

      {/* Module cards */}
      <div
        aria-live="polite"
        aria-label="Generated curriculum"
        className="flex flex-col gap-6"
      >
        {modules.map((mod, i) => {
          const isActiveModule =
            isStreaming && i === modules.length - 1 && !mod.bloom

          return (
            <motion.div
              key={i}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: "easeOut" }
              }
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded bg-orange px-2 py-0.5 font-sans text-xs font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif font-bold text-ink">{mod.title}</h3>
              </div>

              <ul className="flex flex-col gap-2 border-l-2 border-divider pl-4">
                {mod.objectives.map((obj, j) => {
                  const showCursor =
                    isActiveModule && j === mod.objectives.length - 1

                  return (
                    <li
                      key={j}
                      className="font-serif text-sm italic leading-relaxed text-muted"
                    >
                      {obj}
                      {showCursor && (
                        <motion.span
                          aria-hidden="true"
                          variants={{
                            initial: { opacity: 0 },
                            animate: {
                              opacity: 1,
                              transition: {
                                duration: 0.01,
                                repeat: Infinity,
                                repeatDelay: 0.4,
                                repeatType: "reverse",
                              },
                            },
                          }}
                          initial="initial"
                          animate={prefersReducedMotion ? "initial" : "animate"}
                          className="ml-0.5 inline-block h-3 w-px bg-orange align-middle"
                        />
                      )}
                    </li>
                  )
                })}
              </ul>

              {mod.bloom && (
                <p className="mt-2 font-sans text-xs text-orange">
                  ↑ Bloom&apos;s level: {mod.bloom}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Prerequisite block */}
      {prereqNote && (
        <div className="mt-6 border-l-4 border-orange bg-cream-dark p-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-orange">
            Prerequisite note
          </p>
          <p className="mt-1 font-serif text-sm italic leading-relaxed text-muted">
            {prereqNote}
          </p>
          <p className="mt-2 font-sans text-xs text-orange">
            ↑ Generated from your inputs
          </p>
        </div>
      )}

      {/* Action buttons — only in done state */}
      {showActions && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          className="mt-8 flex gap-3 border-t border-divider pt-6"
        >
          <button
            onClick={handleCopy}
            className="min-h-[44px] flex-1 cursor-pointer rounded border border-divider bg-white px-4 py-3 font-serif text-sm text-muted transition-colors hover:border-orange hover:text-orange"
          >
            {copyState === "copied" ? "Copied!" : "Copy curriculum"}
          </button>
          <button
            onClick={onEdit}
            className="min-h-[44px] flex-1 cursor-pointer rounded border border-divider bg-white px-4 py-3 font-serif text-sm text-muted transition-colors hover:border-orange hover:text-orange"
          >
            Edit inputs
          </button>
        </motion.div>
      )}
    </div>
  )
}
