import type { AdminResourceInput } from "../types"

export const rolesResource: AdminResourceInput = {
  identity: "role",
  label: "Role",
  labelPlural: "Roles",
  menu: {
    group: "Administration",
    order: 2,
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a4 4 0 0 0-4 4v1.5H6.5A2.5 2.5 0 0 0 4 10v8a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-8a2.5 2.5 0 0 0-2.5-2.5H16V6a4 4 0 0 0-4-4Zm-2 5.5V6a2 2 0 1 1 4 0v1.5h-4Z"/></svg>',
  },
  endpoints: {
    list: "/api/roles",
    get: "/api/roles/{id}",
    create: "/api/roles",
    update: "/api/roles/{id}",
    delete: "/api/roles/{id}",
  },
  list: {
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description" },
    ],
    defaultSort: { key: "name", direction: "asc" },
    searchable: true,
    searchPlaceholder: "Search roles",
    pageSize: 25,
  },
  form: {
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  requiredPermission: "roles:manage",
  dataKey: "roles",
  singleDataKey: "role",
}
