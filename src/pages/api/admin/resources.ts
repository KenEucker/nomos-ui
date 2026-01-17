import type { APIRoute } from "astro"

let resources = Array.from({ length: 12 }, (_, index) => ({
  id: `res-${index + 1}`,
  name: `Resource ${index + 1}`,
}))

const applySearch = (items: typeof resources, search: string) => {
  if (!search) return items
  const lowered = search.toLowerCase()
  return items.filter((item) => item.name.toLowerCase().includes(lowered) || item.id.includes(lowered))
}

const applySort = (items: typeof resources, sort?: string) => {
  if (!sort) return items
  const [key, dir = "asc"] = sort.split(":")
  if (!key) return items
  const sorted = [...items].sort((a, b) => {
    const left = a[key as keyof typeof a]
    const right = b[key as keyof typeof b]
    if (left < right) return -1
    if (left > right) return 1
    return 0
  })
  return dir === "desc" ? sorted.reverse() : sorted
}

export const GET: APIRoute = async ({ url }) => {
  const page = Number(url.searchParams.get("page") ?? "1")
  const pageSize = Number(url.searchParams.get("pageSize") ?? "10")
  const search = url.searchParams.get("search") ?? ""
  const sort = url.searchParams.get("sort") ?? ""

  const filtered = applySort(applySearch(resources, search), sort)
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return new Response(JSON.stringify({ items, total: filtered.length }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as { name?: string }
  const id = `res-${resources.length + 1}`
  const name = body.name ?? `Resource ${resources.length + 1}`
  const next = { id, name }
  resources = [next, ...resources]

  return new Response(JSON.stringify({ item: next }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
