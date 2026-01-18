import { createResourceDefinition } from "$lib/utils"
import type { ResourceDefinition } from "$lib/types"

export const permissionsResource: ResourceDefinition = createResourceDefinition({
  name: "permissions",

  labels: {
    label: "Permission",
    labelPlural: "Permissions",
  },

  endpoints: {
    list: "/api/permissions",
    get: "/api/permissions?id={id}",
    create: "/api/permissions",
    update: "/api/permissions?id={id}",
    delete: "/api/permissions?id={id}",
  },

  dataKey: "permissions",
  singleDataKey: "permission",

  list: {
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description", sortable: true, hideOnMobile: true },
    ],
    rowActions: {
      view: true,
      edit: true,
      delete: true,
    },
    defaultSort: {
      key: "name",
      direction: "asc",
    },
    searchable: true,
    searchPlaceholder: "Search permissions...",
    pageSize: 20,
  },

  form: {
    fields: [
      {
        name: "name",
        label: "Permission name",
        type: "text",
        required: true,
        placeholder: "Users: Read",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe the permission scope.",
      },
    ],
  },

  schema: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      description: { type: "string" },
    },
  },
})
