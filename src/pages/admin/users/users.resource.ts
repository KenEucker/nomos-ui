import { createResourceDefinition } from "$lib/utils"
import type { ResourceDefinition } from "$lib/types"

export const usersResource: ResourceDefinition = createResourceDefinition({
  name: "users",

  labels: {
    label: "User",
    labelPlural: "Users",
  },

  endpoints: {
    list: "/api/users",
    get: "/api/users?id={id}",
    create: "/api/users",
    update: "/api/users?id={id}",
    delete: "/api/users?id={id}",
  },

  dataKey: "users",
  singleDataKey: "user",

  list: {
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true, hideOnMobile: true },
      { key: "role", label: "Role", sortable: true },
      { key: "team", label: "Team", sortable: true, hideOnMobile: true },
      { key: "status", label: "Status", sortable: true },
    ],
    defaultSort: {
      key: "name",
      direction: "asc",
    },
    searchable: true,
    searchPlaceholder: "Search users...",
    pageSize: 20,
  },

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
        type: "email",
        required: true,
        placeholder: "ava@nomos.io",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: [
          { value: "Admin", label: "Admin" },
          { value: "Editor", label: "Editor" },
          { value: "Viewer", label: "Viewer" },
        ],
      },
      {
        name: "team",
        label: "Team",
        type: "text",
        placeholder: "Atlas",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Invited", label: "Invited" },
        ],
      },
    ],
  },

  schema: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      role: { type: "string" },
      team: { type: "string" },
      status: { type: "string" },
    },
  },
})
