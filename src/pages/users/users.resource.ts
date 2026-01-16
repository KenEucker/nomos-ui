import { z } from "zod"
import { createResourceDefinition } from "../../lib/utils"
import type { ResourceDefinition } from "../../lib/types"

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(1, "Pick a role"),
  teams: z.array(z.string()).min(1, "Select at least one team"),
  username: z.string().min(3, "Username is required"),
})

export const usersResource: ResourceDefinition = createResourceDefinition({
  name: "users",

  labels: {
    label: "User",
    labelPlural: "Users",
  },

  menu: {
    group: "Access",
    order: 10,
    icon:
      '<svg class="flex-shrink-0 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  },

  endpoints: {
    list: "/api/users",
    get: "/api/users/{id}",
    create: "/api/users",
    update: "/api/users/{id}",
    delete: "/api/users/{id}",
  },

  // Response unwrapping keys (adjust if your API uses different keys)
  dataKey: "users",
  singleDataKey: "user",

  schema: userSchema,

  list: {
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
      { key: "team", label: "Team", sortable: true, hideOnMobile: true },
      { key: "status", label: "Status", sortable: true, hideOnMobile: true },
    ],
    defaultSort: {
      key: "name",
      direction: "asc",
    },
    searchable: true,
    searchPlaceholder: "Search users...",
    pageSize: 20,
  },

  // Form fields here are intentionally minimal (Option A):
  // users is not fully expressed as trivial CRUD yet (relations/multiselect/lookup are panel-specific).
  form: {
    fields: [
      {
        name: "name",
        label: "Full name",
        type: "text",
        required: true,
        placeholder: "Ava Martins",
      },
      {
        name: "email",
        label: "Email",
        type: "text",
        required: true,
        placeholder: "ava@nomos.io",
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        placeholder: "ava.martins",
      },
    ],
  },

  requiredPermission: "users:manage",
})
