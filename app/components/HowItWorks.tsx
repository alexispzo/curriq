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
