import type { APIRoute } from "astro"
import { assignRolesToSubject } from "../../services/subjects"

export const POST: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as {
    subjectId?: string
    roles?: string[]
  }

  if (!payload.subjectId || payload.roles === undefined) {
    return new Response(JSON.stringify({ ok: false, error: "Missing subjectId or roles" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const updated = await assignRolesToSubject(payload.subjectId, payload.roles)
  if (!updated) {
    return new Response(JSON.stringify({ ok: false, error: "Subject not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ ok: true, data: { subject: updated } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
