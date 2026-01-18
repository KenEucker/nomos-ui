import { createResourceDefinition } from "$lib/utils"
import type { ResourceDefinition } from "$lib/types"
import { ROLES } from "$lib/data/roles"

const roleOptions = ROLES.map((role) => ({
  value: role.id,
  label: role.name,
}))

export const subjectsResource: ResourceDefinition = createResourceDefinition({
  name: "subjects",

  labels: {
    label: "Subject",
    labelPlural: "Subjects",
  },

  endpoints: {
    list: "/api/subjects",
    get: "/api/subjects?id={id}",
    create: "/api/subjects",
    update: "/api/subjects?id={id}",
    delete: "/api/subjects?id={id}",
  },

  intents: {
    read: "subjects.read",
    create: "subjects.create",
    update: "subjects.update",
    delete: "subjects.delete",
  },

  dataKey: "subjects",
  singleDataKey: "subject",

  list: {
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true, hideOnMobile: true },
      { key: "level", label: "Level", sortable: true },
      { key: "roles", label: "Roles" },
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
    searchPlaceholder: "Search subjects...",
    pageSize: 20,
  },

  form: {
    fields: [
      {
        name: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "Ada Admin",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "ada@nomos.dev",
      },
      {
        name: "level",
        label: "Level",
        type: "select",
        options: [
          { value: "viewer", label: "Viewer" },
          { value: "manager", label: "Manager" },
          { value: "admin", label: "Admin" },
        ],
      },
      {
        name: "roles",
        label: "Roles",
        type: "multiselect",
        options: roleOptions,
        helperText: "Assign one or more roles.",
      },
    ],
  },

  schema: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      level: { type: "string" },
      roles: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
})
