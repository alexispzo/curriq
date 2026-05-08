import Anthropic from "@anthropic-ai/sdk"

const ipCounts = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000

const SYSTEM_PROMPT = `You are an expert instructional designer. Given a course topic, target audience, and desired transformation, apply backwards design to produce a structured curriculum.

Output format — one line per item, no other text, no markdown, no blank lines:
MODULE: <module title>
OBJECTIVE: <one Bloom's-verb learning objective>
BLOOM: <Bloom's taxonomy levels covered, e.g. "Remember + Understand">
PREREQ: <one sentence on prerequisite knowledge>

Rules:
- 3–6 modules
- 2–4 OBJECTIVE lines per module, immediately after its MODULE line
- One BLOOM line per module, immediately after its objectives
- One PREREQ line at the very end, after all modules
- No preamble, no closing remarks, no extra lines`

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"
  const now = Date.now()
  const bucket = ipCounts.get(ip)

  if (bucket) {
    if (now < bucket.resetAt) {
      if (bucket.count >= LIMIT) {
        return Response.json({ error: "rate_limited" }, { status: 429 })
      }
      bucket.count++
    } else {
      ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    }
  } else {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: "invalid_input" }, { status: 400 })

  const { topic, audience, transformation } = body as Record<string, unknown>
  if (
    typeof topic !== "string" || !topic.trim() || topic.length > 500 ||
    typeof audience !== "string" || !audience.trim() || audience.length > 500 ||
    typeof transformation !== "string" || !transformation.trim() || transformation.length > 500
  ) {
    return Response.json({ error: "invalid_input" }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: [
            {
              type: "text" as const,
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" as const },
            },
          ],
          messages: [
            {
              role: "user",
              content: `Topic: ${topic.trim()}\nTarget audience: ${audience.trim()}\nDesired transformation: ${transformation.trim()}`,
            },
          ],
        })

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
      } catch {
        controller.enqueue(new TextEncoder().encode("\nERROR\n"))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
