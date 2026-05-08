"use client"

import { useRef, useState } from "react"

export type FormValues = {
  topic: string
  audience: string
  transformation: string
}

type FieldErrors = Partial<Record<keyof FormValues, string>>

type Props = {
  initialValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isSubmitting: boolean
}

export default function GenerateForm({ initialValues, onSubmit, isSubmitting }: Props) {
  const [values, setValues] = useState<FormValues>({
    topic: initialValues?.topic ?? "",
    audience: initialValues?.audience ?? "",
    transformation: initialValues?.transformation ?? "",
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const topicRef = useRef<HTMLInputElement>(null)
  const audienceRef = useRef<HTMLInputElement>(null)
  const transformationRef = useRef<HTMLTextAreaElement>(null)

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!values.topic.trim()) errs.topic = "Topic is required"
    if (!values.audience.trim()) errs.audience = "Target audience is required"
    if (!values.transformation.trim()) errs.transformation = "Desired transformation is required"
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      if (errs.topic) topicRef.current?.focus()
      else if (errs.audience) audienceRef.current?.focus()
      else if (errs.transformation) transformationRef.current?.focus()
      return
    }
    onSubmit(values)
  }

  function clearError(field: keyof FormValues) {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const inputBase =
    "w-full min-h-[44px] rounded border bg-white px-4 py-3 font-serif text-sm text-ink placeholder:text-muted focus:border-orange focus:outline-none disabled:opacity-60 transition-colors"

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Topic */}
      <div>
        <label
          htmlFor="topic"
          className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-orange"
        >
          Topic
        </label>
        <input
          ref={topicRef}
          id="topic"
          type="text"
          value={values.topic}
          onChange={e => { setValues(v => ({ ...v, topic: e.target.value })); clearError("topic") }}
          placeholder="e.g. Freelance design, sourdough baking…"
          disabled={isSubmitting}
          aria-describedby={errors.topic ? "topic-error" : undefined}
          aria-invalid={!!errors.topic}
          className={`${inputBase} ${errors.topic ? "border-orange" : "border-divider"}`}
        />
        {errors.topic && (
          <p id="topic-error" role="alert" className="mt-1 font-sans text-xs text-orange">
            {errors.topic}
          </p>
        )}
      </div>

      {/* Audience */}
      <div>
        <label
          htmlFor="audience"
          className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-orange"
        >
          Target audience
        </label>
        <input
          ref={audienceRef}
          id="audience"
          type="text"
          value={values.audience}
          onChange={e => { setValues(v => ({ ...v, audience: e.target.value })); clearError("audience") }}
          placeholder="e.g. Complete beginners with no clients yet"
          disabled={isSubmitting}
          aria-describedby={errors.audience ? "audience-error" : undefined}
          aria-invalid={!!errors.audience}
          className={`${inputBase} ${errors.audience ? "border-orange" : "border-divider"}`}
        />
        {errors.audience && (
          <p id="audience-error" role="alert" className="mt-1 font-sans text-xs text-orange">
            {errors.audience}
          </p>
        )}
      </div>

      {/* Transformation */}
      <div>
        <label
          htmlFor="transformation"
          className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-orange"
        >
          Desired transformation
        </label>
        <textarea
          ref={transformationRef}
          id="transformation"
          rows={2}
          value={values.transformation}
          onChange={e => { setValues(v => ({ ...v, transformation: e.target.value })); clearError("transformation") }}
          placeholder="e.g. Land your first client in 90 days"
          disabled={isSubmitting}
          aria-describedby={errors.transformation ? "transformation-error" : undefined}
          aria-invalid={!!errors.transformation}
          className={`${inputBase} resize-none ${errors.transformation ? "border-orange" : "border-divider"}`}
        />
        {errors.transformation && (
          <p id="transformation-error" role="alert" className="mt-1 font-sans text-xs text-orange">
            {errors.transformation}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="flex min-h-[44px] cursor-pointer items-center justify-center rounded bg-orange px-6 py-3 font-serif text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          />
        ) : (
          "Generate curriculum →"
        )}
      </button>
    </form>
  )
}
