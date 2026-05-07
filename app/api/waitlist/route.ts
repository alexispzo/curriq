import { Resend } from "resend"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.contacts.create({
    email: body.email,
    segments: [{ id: process.env.RESEND_AUDIENCE_ID! }],
  })
  if (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
  return Response.json({ ok: true })
}
