"use client"

import Link from "next/link"
import { useState } from "react"
import CurriculumOutput, { type Module } from "@/app/components/CurriculumOutput"
import GenerateForm, { type FormValues } from "@/app/components/GenerateForm"

type PageState = "idle" | "generating" | "done" | "error"
type ErrorKind = "rate_limited" | "api_error" | "interrupted" | null

const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")"

export default function GeneratePage() {
  const [pageState, setPageState] = useState<PageState>("idle")
  const [errorKind, setErrorKind] = useState<ErrorKind>(null)
  const [formValues, setFormValues] = useState<FormValues>({
    topic: "",
    audience: "",
    transformation: "",
  })
  const [modules, setModules] = useState<Module[]>([])
  const [prereqNote, setPrereqNote] = useState("")

  async function handleGenerate(values: FormValues) {
    setFormValues(values)
    setPageState("generating")
    setModules([])
    setPrereqNote("")
    setErrorKind(null)

    function parseLine(line: string) {
      if (line.startsWith("MODULE: ")) {
        const title = line.slice(8).trim()
        if (title) {
          setModules(prev => [...prev, { title, objectives: [], bloom: "" }])
        }
      } else if (line.startsWith("OBJECTIVE: ")) {
        const obj = line.slice(11).trim()
        if (obj) {
          setModules(prev => {
            if (prev.length === 0) return prev
            const next = [...prev]
            next[next.length - 1] = {
              ...next[next.length - 1],
              objectives: [...next[next.length - 1].objectives, obj],
            }
            return next
          })
        }
      } else if (line.startsWith("BLOOM: ")) {
        const bloom = line.slice(7).trim()
        if (bloom) {
          setModules(prev => {
            if (prev.length === 0) return prev
            const next = [...prev]
            next[next.length - 1] = { ...next[next.length - 1], bloom }
            return next
          })
        }
      } else if (line.startsWith("PREREQ: ")) {
        const prereq = line.slice(8).trim()
        if (prereq) setPrereqNote(prereq)
      } else if (line === "ERROR") {
        setErrorKind("api_error")
        setPageState("error")
      }
    }

    let res: Response
    try {
      res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
    } catch {
      setErrorKind("api_error")
      setPageState("error")
      return
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string }
      setErrorKind(data.error === "rate_limited" ? "rate_limited" : "api_error")
      setPageState("error")
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      setErrorKind("api_error")
      setPageState("error")
      return
    }

    const decoder = new TextDecoder()
    let buffer = ""
    let hadError = false

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed) parseLine(trimmed)
        }
      }
      if (buffer.trim()) parseLine(buffer.trim())
    } catch {
      hadError = true
    } finally {
      reader.releaseLock()
    }

    if (!hadError) {
      setPageState(prev => prev === "error" ? "error" : "done")
    } else {
      setErrorKind("interrupted")
      setPageState("error")
    }
  }

  function handleEdit() {
    setPageState("idle")
    setErrorKind(null)
  }

  return (
    <main className="relative min-h-dvh">
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ opacity: 0.03, backgroundImage: GRAIN_SVG }}
      />

      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-10 font-serif text-xs uppercase tracking-widest">
          <Link href="/" className="text-orange hover:underline">
            curriq
          </Link>
          <span className="text-muted"> / generate</span>
        </p>

        {/* Page heading */}
        <h1 className="mb-2 font-serif text-3xl font-bold leading-snug text-ink">
          Design your curriculum.
        </h1>
        <p className="mb-10 font-serif text-sm italic leading-relaxed text-muted">
          Describe your course and get a Bloom-mapped structure in seconds.
        </p>

        {/* Rate-limited — no form */}
        {pageState === "error" && errorKind === "rate_limited" && (
          <div role="alert" className="rounded-lg border border-divider bg-cream-dark p-5">
            <p className="font-serif text-sm italic text-muted">
              You&apos;ve generated 3 curricula this hour. Come back later.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block font-serif text-sm text-orange hover:underline"
            >
              ← Back to curriq
            </Link>
          </div>
        )}

        {/* Idle — form */}
        {pageState === "idle" && (
          <GenerateForm
            initialValues={formValues}
            onSubmit={handleGenerate}
            isSubmitting={false}
          />
        )}

        {/* Generating — streaming output */}
        {pageState === "generating" && (
          <CurriculumOutput
            topic={formValues.topic}
            audience={formValues.audience}
            transformation={formValues.transformation}
            modules={modules}
            prereqNote={prereqNote}
            isStreaming={true}
          />
        )}

        {/* Done — full output with actions */}
        {pageState === "done" && (
          <CurriculumOutput
            topic={formValues.topic}
            audience={formValues.audience}
            transformation={formValues.transformation}
            modules={modules}
            prereqNote={prereqNote}
            isStreaming={false}
            onEdit={handleEdit}
          />
        )}

        {/* API error / interrupted */}
        {pageState === "error" && errorKind !== "rate_limited" && (
          <div>
            {/* Partial output — no action buttons */}
            {modules.length > 0 && (
              <CurriculumOutput
                topic={formValues.topic}
                audience={formValues.audience}
                transformation={formValues.transformation}
                modules={modules}
                prereqNote={prereqNote}
                isStreaming={false}
              />
            )}

            <div
              role="alert"
              className={`rounded-lg border border-divider bg-cream-dark p-5 ${modules.length > 0 ? "mt-6" : ""}`}
            >
              <p className="font-serif text-sm italic text-muted">
                {errorKind === "interrupted"
                  ? "Generation was cut short — try again."
                  : "Something went wrong generating your curriculum."}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleGenerate(formValues)}
                  className="min-h-[44px] cursor-pointer rounded bg-orange px-5 py-2 font-serif text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Try again
                </button>
                {modules.length === 0 && (
                  <button
                    onClick={handleEdit}
                    className="min-h-[44px] cursor-pointer rounded border border-divider bg-white px-5 py-2 font-serif text-sm text-muted transition-colors hover:border-orange hover:text-orange"
                  >
                    Edit inputs
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
