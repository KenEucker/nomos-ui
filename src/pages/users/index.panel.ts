import { Layouts } from "../../lib/layouts"
import type { PanelAction, PanelModule, ResourceDefinition } from "../../lib/types"
import { listUsers, type User } from "../../services/users"
import { usersResource } from "../resources/users.resource"

const userSchema = usersResource.schema
const listConfig = usersResource.list ?? {}

const getLabelPlural = (resource: ResourceDefinition) => {
  if ("labels" in resource && resource.labels) return resource.labels.labelPlural
  return resource.labelPlural ?? resource.label ?? resource.name
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
    const result = await listUsers(query)
    return { users: result.items, total: result.total, query, loading: false }
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
        const result = await listUsers(normalizedQuery)
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
