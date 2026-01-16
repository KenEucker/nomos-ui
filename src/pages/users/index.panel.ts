import { Layouts } from "../../lib/layouts"
import type { PanelAction, PanelModule } from "../../lib/types"
import { listUsers, type User } from "../../services/users"
import { usersResource } from "../resources/users.resource"

const userSchema = usersResource.schema

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
    const query = { page: 1, pageSize: 5, search: "", sortKey: null, sortDir: "asc" as const }
    const result = await listUsers(query)
    return { users: result.items, total: result.total, query, loading: false }
  },

  layout: (data, ctx) => [
    Layouts.table({
      id: "users",
      title: "Directory",
      description: "Search, sort, and paginate through users.",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "team", label: "Team" },
        { key: "status", label: "Status" },
      ],
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
