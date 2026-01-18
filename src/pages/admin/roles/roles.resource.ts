import { createResourceDefinition } from "$lib/utils"
import type { ResourceDefinition } from "$lib/types"
import { PERMISSIONS } from "$lib/data/permissions"

const permissionOptions = PERMISSIONS.map((permission) => ({
  value: permission.id,
  label: permission.name,
}))

export const rolesResource: ResourceDefinition = createResourceDefinition({
  name: "roles",

  labels: {
    label: "Role",
    labelPlural: "Roles",
  },

  endpoints: {
    list: "/api/roles",
    get: "/api/roles?id={id}",
    create: "/api/roles",
    update: "/api/roles?id={id}",
    delete: "/api/roles?id={id}",
  },

  dataKey: "roles",
  singleDataKey: "role",

  list: {
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description", sortable: true, hideOnMobile: true },
      { key: "permissions", label: "Permissions", sortable: false },
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
    searchPlaceholder: "Search roles...",
    pageSize: 20,
  },

  form: {
    fields: [
      {
        name: "name",
        label: "Role name",
        type: "text",
        required: true,
        placeholder: "Support",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe what this role can do.",
      },
      {
        name: "permissions",
        label: "Permissions",
        type: "multiselect",
        options: permissionOptions,
        helperText: "Select one or more permissions.",
      },
    ],
  },

  schema: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      permissions: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
})
