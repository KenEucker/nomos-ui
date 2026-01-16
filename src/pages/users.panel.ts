import { z } from "zod"
import { Layouts } from "../lib/layouts"
import type { PanelAction, PanelModule } from "../lib/types"
import { listRoles, listTeams, listUsers, runUsernameLookup, type User } from "../services/users"

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(1, "Pick a role"),
  teams: z.array(z.string()).min(1, "Select at least one team"),
  username: z.string().min(3, "Username is required"),
})

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
    id: "edit-user",
    label: "Edit",
    variant: "secondary",
    run: ({ row, notify }) => {
      if (!row) return
      notify(`Editing ${row.name}`, "info")
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

    Layouts.section(
      { title: "Create user", description: "Invite a new team member." },
      [
        Layouts.form({
          id: "create-user",
          title: "New user",
          description: "Validated with the panel schema.",
          schema: userSchema,
          submitLabel: "Create user",
          fields: [
            { name: "name", label: "Full name", type: "text", placeholder: "Ava Martins" },
            { name: "email", label: "Email", type: "email", placeholder: "ava@nomos.io" },
            {
              name: "role",
              label: "Role",
              type: "relation",
              loadOptions: listRoles,
              placeholder: "Search roles…",
            },
            {
              name: "teams",
              label: "Teams",
              type: "multiselect",
              loadOptions: listTeams,
              placeholder: "Search teams…",
            },
            {
              name: "username",
              label: "Username",
              type: "lookup",
              helperText: "Generate a suggested username.",
              lookup: {
                title: "Generate username",
                description: "Derive a username from a display name.",
                submitLabel: "Generate",
                fields: [{ name: "name", label: "Display name" }],
                onLookup: runUsernameLookup,
                applyResult: (result) => ({ username: result.username }),
              },
            },
          ],
          onSubmit: async () => {
            ctx?.notify?.("Invitation sent", "success")
          },
        }),
      ]
    ),

    Layouts.section(
      { title: "Edit user", description: "Update a user record." },
      [
        Layouts.form({
          id: "edit-user",
          title: "Edit profile",
          description: "Uses the same validation schema.",
          schema: userSchema,
          submitLabel: "Save changes",
          initialValues: {
            name: data.users[0]?.name ?? "",
            email: data.users[0]?.email ?? "",
            role: data.users[0]?.role ?? "",
            teams: [data.users[0]?.team ?? ""].filter(Boolean),
            username: "user.primary",
          },
          fields: [
            { name: "name", label: "Full name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            {
              name: "role",
              label: "Role",
              type: "relation",
              loadOptions: listRoles,
            },
            {
              name: "teams",
              label: "Teams",
              type: "multiselect",
              loadOptions: listTeams,
            },
            {
              name: "username",
              label: "Username",
              type: "lookup",
              helperText: "Use lookup to regenerate username.",
              lookup: {
                title: "Regenerate username",
                description: "Pick a new handle for this user.",
                submitLabel: "Regenerate",
                fields: [{ name: "name", label: "Display name" }],
                onLookup: runUsernameLookup,
                applyResult: (result) => ({ username: result.username }),
              },
            },
          ],
          onSubmit: async () => {
            ctx?.notify?.("Profile updated", "success")
          },
        }),
      ]
    ),
  ],
}

export default usersPanel
