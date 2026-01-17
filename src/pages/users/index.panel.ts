import { Layouts } from "../../lib/layouts"
import { apiGet } from "../../lib/api"
import type { PanelAction, PanelModule, ResourceDefinition } from "../../lib/types"
import type { User } from "../../services/users"
import { usersResource } from "../resources/users.resource"

const userSchema = usersResource.schema
const listConfig = usersResource.list ?? {}
const usersDataKey = usersResource.dataKey ?? "users"

const getLabelPlural = (resource: ResourceDefinition) => {
  if ("labels" in resource && resource.labels) return resource.labels.labelPlural
  return resource.labelPlural ?? resource.label ?? resource.name
}

const buildUrl = (query: {
  page: number
  pageSize: number
  search: string
  sortKey: string | null
  sortDir: "asc" | "desc"
}) => {
  const params = new URLSearchParams()
  params.set("page", String(query.page))
  params.set("pageSize", String(query.pageSize))
  if (query.search.trim()) params.set("search", query.search.trim())
  if (query.sortKey) params.set("sort", `${query.sortKey}:${query.sortDir}`)
  const queryString = params.toString()
  return queryString ? `${usersResource.endpoints.list}?${queryString}` : usersResource.endpoints.list
}

const unwrapUsers = (response: any) => {
  const candidate =
    response?.data?.[usersDataKey] ?? response?.[usersDataKey] ?? response?.data ?? response ?? []
  const items = Array.isArray(candidate) ? candidate : []
  const total = response?.meta?.total ?? response?.total ?? items.length
  return { items, total }
}

type Data = {
  users: User[]
  total: number
  query: {
    page: number
    pageSize: number
    search: string
    sortKey: keyof User | null
    sortDir: "asc" | "desc"
  }
  loading: boolean
}

const rowActions: Array<PanelAction<Data>> = [
  {
    id: "view-user",
    label: "View",
    variant: "secondary",
    run: ({ row, notify }) => {
      if (!row) return
      notify(`Viewing ${row.name}`, "info")
    },
  },
  {
    id: "delete-user",
    label: "Delete",
    variant: "destructive",
    run: ({ row, updateData, notify }) => {
      if (!row) return
      updateData((current) => ({
        ...current,
        users: current.users.filter((user) => user.id !== row.id),
        total: Math.max(0, current.total - 1),
      }))
      notify(`Deleted ${row.name}`, "success")
    },
  },
]

const usersPanel: PanelModule<Data> = {
  id: "users",
  title: "Users",
  subtitle: "Manage access, teams, and invitations.",
  schema: userSchema,

  load: async () => {
    const query = {
      page: 1,
      pageSize: listConfig.pageSize ?? 20,
      search: "",
      sortKey: (listConfig.defaultSort?.key as keyof User | undefined) ?? null,
      sortDir: listConfig.defaultSort?.direction ?? ("asc" as const),
    }
    const response = await apiGet<any>(buildUrl(query))
    const { items, total } = unwrapUsers(response)
    return { users: items, total, query, loading: false }
  },

  layout: (data, ctx) => [
    Layouts.table({
      id: "users",
      title: getLabelPlural(usersResource),
      description: "Search, sort, and paginate through users.",
      columns: listConfig.columns ?? [],
      rows: data.users,
      emptyMessage: "No users found.",
      rowIdKey: "id",
      rowActions,
      page: data.query.page,
      pageSize: data.query.pageSize,
      total: data.total,
      loading: data.loading,
      onQueryChange: async (query) => {
        const normalizedQuery = { ...query, sortKey: query.sortKey as keyof User | null }
        ctx?.updateData?.((current) => ({ ...current, loading: true, query: normalizedQuery }))
        const response = await apiGet<any>(buildUrl(normalizedQuery))
        const result = unwrapUsers(response)
        ctx?.updateData?.((current) => ({
          ...current,
          loading: false,
          users: result.items,
          total: result.total,
        }))
      },
    }),
  ],
}

export default usersPanel
