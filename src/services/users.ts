import { withLatency } from "./mock"

export type User = {
  id: string
  name: string
  email: string
  role: string
  team: string
  status: string
}

let USERS: User[] = Array.from({ length: 42 }).map((_, index) => {
  const id = `user-${index + 1}`
  const name = `User ${index + 1}`
  const email = `user${index + 1}@nomos.local`
  const role = ["Admin", "Editor", "Viewer"][index % 3]
  const team = ["Atlas", "Orion", "Helios"][index % 3]
  const status = index % 2 === 0 ? "Active" : "Invited"
  return { id, name, email, role, team, status }
})

export const listUsers = async (params: {
  page: number
  pageSize: number
  search: string
  sortKey: keyof User | null
  sortDir: "asc" | "desc"
}) => {
  const { page, pageSize, search, sortKey, sortDir } = params
  const normalized = search.trim().toLowerCase()

  let data = USERS.filter((user) =>
    normalized
      ? Object.values(user).some((value) => String(value).toLowerCase().includes(normalized))
      : true
  )

  if (sortKey) {
    data = [...data].sort((a, b) => {
      const left = String(a[sortKey] ?? "")
      const right = String(b[sortKey] ?? "")
      const comparison = left.localeCompare(right)
      return sortDir === "asc" ? comparison : -comparison
    })
  }

  const total = data.length
  const start = (page - 1) * pageSize
  const items = data.slice(start, start + pageSize)

  return withLatency({ items, total })
}

export const listRoles = async (search = "") => {
  const roles = ["Admin", "Editor", "Viewer", "Billing", "Support"]
  const normalized = search.trim().toLowerCase()
  return withLatency(
    roles
      .filter((role) => role.toLowerCase().includes(normalized))
      .map((role) => ({ value: role, label: role }))
  )
}

export const listTeams = async (search = "") => {
  const teams = ["Atlas", "Orion", "Helios", "Lumen", "Vega"]
  const normalized = search.trim().toLowerCase()
  return withLatency(
    teams
      .filter((team) => team.toLowerCase().includes(normalized))
      .map((team) => ({ value: team, label: team }))
  )
}

export const runUsernameLookup = async (values: Record<string, any>) => {
  const name = String(values.name ?? "")
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
  return withLatency({ username: slug || "new.user" })
}

export const updateUser = async (id: string, patch: Partial<User>) => {
  const index = USERS.findIndex((user) => user.id === id)
  if (index === -1) {
    return withLatency(null)
  }
  const next = { ...USERS[index], ...patch }
  USERS = [...USERS.slice(0, index), next, ...USERS.slice(index + 1)]
  return withLatency(next)
}
