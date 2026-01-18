import { withLatency } from "./mock"
import { SUBJECTS, type SubjectSeed } from "../lib/data/subjects"

export type SubjectRecord = SubjectSeed

let SUBJECTS_STORE: SubjectRecord[] = SUBJECTS.map((subject) => ({ ...subject, roles: [...subject.roles] }))

const normalizeRoles = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  if (value === null || value === undefined || value === "") {
    return []
  }
  return [String(value)]
}

export const listSubjects = async (params: {
  page: number
  pageSize: number
  search: string
  sortKey: keyof SubjectRecord | null
  sortDir: "asc" | "desc"
}) => {
  const { page, pageSize, search, sortKey, sortDir } = params
  const normalized = search.trim().toLowerCase()

  let data = SUBJECTS_STORE.filter((subject) =>
    normalized
      ? Object.values(subject).some((value) => String(value).toLowerCase().includes(normalized))
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

export const getSubject = async (id: string) => {
  const subject = SUBJECTS_STORE.find((entry) => entry.id === id) ?? null
  return withLatency(subject)
}

export const createSubject = async (payload: Partial<SubjectRecord>) => {
  const id = payload.id ?? `subject-${SUBJECTS_STORE.length + 1}`
  const next: SubjectRecord = {
    id,
    name: payload.name ?? "New Subject",
    email: payload.email ?? "subject@nomos.dev",
    level: (payload.level as SubjectRecord["level"]) ?? "viewer",
    roles: normalizeRoles(payload.roles),
  }
  SUBJECTS_STORE = [next, ...SUBJECTS_STORE]
  return withLatency(next)
}

export const updateSubject = async (id: string, patch: Partial<SubjectRecord>) => {
  const index = SUBJECTS_STORE.findIndex((subject) => subject.id === id)
  if (index === -1) {
    return withLatency(null)
  }
  const current = SUBJECTS_STORE[index]
  const next: SubjectRecord = {
    ...current,
    ...patch,
    roles: patch.roles !== undefined ? normalizeRoles(patch.roles) : current.roles,
  }
  SUBJECTS_STORE = [...SUBJECTS_STORE.slice(0, index), next, ...SUBJECTS_STORE.slice(index + 1)]
  return withLatency(next)
}

export const deleteSubject = async (id: string) => {
  const existing = SUBJECTS_STORE.find((entry) => entry.id === id) ?? null
  if (!existing) return withLatency(null)
  SUBJECTS_STORE = SUBJECTS_STORE.filter((entry) => entry.id !== id)
  return withLatency(existing)
}

export const assignRolesToSubject = async (id: string, roles: string[]) => {
  return updateSubject(id, { roles })
}
