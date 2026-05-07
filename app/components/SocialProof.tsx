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
