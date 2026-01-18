import { withLatency } from "./mock"
import { PERMISSIONS, type PermissionSeed } from "../lib/data/permissions"

export type Permission = PermissionSeed

let PERMISSIONS_STORE: Permission[] = PERMISSIONS.map((permission) => ({ ...permission }))

export const listPermissions = async (params: {
  page: number
  pageSize: number
  search: string
  sortKey: keyof Permission | null
  sortDir: "asc" | "desc"
}) => {
  const { page, pageSize, search, sortKey, sortDir } = params
  const normalized = search.trim().toLowerCase()

  let data = PERMISSIONS_STORE.filter((permission) =>
    normalized
      ? Object.values(permission).some((value) =>
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

export const getPermission = async (id: string) => {
  const permission = PERMISSIONS_STORE.find((entry) => entry.id === id) ?? null
  return withLatency(permission)
}

export const createPermission = async (payload: Partial<Permission>) => {
  const id = payload.id ?? `perm-${PERMISSIONS_STORE.length + 1}`
  const next: Permission = {
    id,
    name: payload.name ?? "New Permission",
    description: payload.description ?? "",
  }
  PERMISSIONS_STORE = [next, ...PERMISSIONS_STORE]
  return withLatency(next)
}

export const updatePermission = async (id: string, patch: Partial<Permission>) => {
  const index = PERMISSIONS_STORE.findIndex((permission) => permission.id === id)
  if (index === -1) {
    return withLatency(null)
  }
  const next = { ...PERMISSIONS_STORE[index], ...patch }
  PERMISSIONS_STORE = [...PERMISSIONS_STORE.slice(0, index), next, ...PERMISSIONS_STORE.slice(index + 1)]
  return withLatency(next)
}

export const deletePermission = async (id: string) => {
  const existing = PERMISSIONS_STORE.find((entry) => entry.id === id) ?? null
  if (!existing) return withLatency(null)
  PERMISSIONS_STORE = PERMISSIONS_STORE.filter((entry) => entry.id !== id)
  return withLatency(existing)
}
