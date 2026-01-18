import type { APIRoute } from "astro"
import { assignPermissionToRole } from "../../services/roles"

export const POST: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as {
    roleId?: string
    permissionId?: string
  }

  if (!payload.roleId || !payload.permissionId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing roleId or permissionId" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const updated = await assignPermissionToRole(payload.roleId, payload.permissionId)
  if (!updated) {
    return new Response(JSON.stringify({ ok: false, error: "Role not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ ok: true, data: { role: updated } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
