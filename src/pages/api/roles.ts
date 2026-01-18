import type { APIRoute } from "astro"
import { createRole, deleteRole, getRole, listRoles, updateRole } from "../../services/roles"

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id")
  if (id) {
    const role = await getRole(id)
    if (!role) {
      return new Response(JSON.stringify({ ok: false, error: "Role not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      })
    }
    return new Response(JSON.stringify({ data: { role } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const page = Number(url.searchParams.get("page") ?? "1")
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20")
  const search = url.searchParams.get("search") ?? ""
  const sort = url.searchParams.get("sort") ?? ""

  const [sortKey, sortDir] = sort.includes(":") ? sort.split(":") : [sort, ""]
  const resolvedSortKey = sortKey ? sortKey.replace(/^-/, "") : null
  const resolvedSortDir = sortKey.startsWith("-") ? "desc" : sortDir || "asc"
  const result = await listRoles({
    page,
    pageSize,
    search,
    sortKey: resolvedSortKey as any,
    sortDir: resolvedSortDir === "desc" ? "desc" : "asc",
  })
  const { items, total } = result

  return new Response(JSON.stringify({ data: { roles: items }, meta: { total } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as Record<string, any>
  const created = await createRole(payload)
  return new Response(JSON.stringify({ ok: true, data: { role: created } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

export const PATCH: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as {
    id?: string
    patch?: Record<string, any>
  }
  const idFromQuery =
    request instanceof Request ? new URL(request.url).searchParams.get("id") : null
  const resolvedId = payload.id ?? idFromQuery ?? undefined
  const patch = payload.patch ?? payload
  if (!resolvedId || !patch) {
    return new Response(JSON.stringify({ ok: false, error: "Missing id or patch" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const updated = await updateRole(resolvedId, patch)
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

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id")
  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: "Missing id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const deleted = await deleteRole(id)
  if (!deleted) {
    return new Response(JSON.stringify({ ok: false, error: "Role not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ ok: true, data: { role: deleted } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
