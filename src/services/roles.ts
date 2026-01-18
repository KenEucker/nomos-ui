import { withLatency } from "./mock"
import { ROLES, type RoleSeed } from "../lib/data/roles"

export type Role = RoleSeed

let ROLES_STORE: Role[] = ROLES.map((role) => ({ ...role, permissions: [...role.permissions] }))

const normalizePermissions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  if (value === null || value === undefined || value === "") {
    return []
  }
  return [String(value)]
}

export const listRoles = async (params: {
  page: number
  pageSize: number
  search: string
  sortKey: keyof Role | null
  sortDir: "asc" | "desc"
}) => {
  const { page, pageSize, search, sortKey, sortDir } = params
  const normalized = search.trim().toLowerCase()

  let data = ROLES_STORE.filter((role) =>
    normalized
      ? Object.values(role).some((value) =>
          String(value).toLowerCase().includes(normalized)
        )
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

export const getRole = async (id: string) => {
  const role = ROLES_STORE.find((entry) => entry.id === id) ?? null
  return withLatency(role)
}

export const createRole = async (payload: Partial<Role>) => {
  const id = payload.id ?? `role-${ROLES_STORE.length + 1}`
  const next: Role = {
    id,
    name: payload.name ?? "New Role",
    description: payload.description ?? "",
    permissions: normalizePermissions(payload.permissions),
  }
  ROLES_STORE = [next, ...ROLES_STORE]
  return withLatency(next)
}

export const updateRole = async (id: string, patch: Partial<Role>) => {
  const index = ROLES_STORE.findIndex((role) => role.id === id)
  if (index === -1) {
    return withLatency(null)
  }
  const current = ROLES_STORE[index]
  const next: Role = {
    ...current,
    ...patch,
    permissions: patch.permissions !== undefined ? normalizePermissions(patch.permissions) : current.permissions,
  }
  ROLES_STORE = [...ROLES_STORE.slice(0, index), next, ...ROLES_STORE.slice(index + 1)]
  return withLatency(next)
}

export const deleteRole = async (id: string) => {
  const existing = ROLES_STORE.find((entry) => entry.id === id) ?? null
  if (!existing) return withLatency(null)
  ROLES_STORE = ROLES_STORE.filter((entry) => entry.id !== id)
  return withLatency(existing)
}

export const assignPermissionToRole = async (id: string, permissionId: string) => {
  const role = ROLES_STORE.find((entry) => entry.id === id) ?? null
  if (!role) return withLatency(null)
  const permissions = new Set(role.permissions)
  permissions.add(permissionId)
  return updateRole(id, { permissions: Array.from(permissions) })
}
