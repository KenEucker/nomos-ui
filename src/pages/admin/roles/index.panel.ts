import { Layouts } from "$lib/layouts"
import type { PanelModule, RowAction } from "$lib/types"
import { rolesResource } from "./roles.resource"

const title = "Roles"
const subtitle = "Define permission bundles for your workspace."
const basePath = "/admin/roles"

const resolveRowActions = (): RowAction[] => {
  const config = rolesResource.list?.rowActions
  const actions: RowAction[] = []
  if (config?.view ?? true) {
    actions.push({ id: "view", label: "View", variant: "secondary", intent: "roles.read" })
  }
  if (config?.edit ?? true) {
    actions.push({ id: "edit", label: "Edit", variant: "secondary", intent: "roles.update" })
  }
  if (config?.delete ?? true) {
    actions.push({ id: "delete", label: "Delete", variant: "destructive", intent: "roles.delete" })
  }
  return actions
}

const rolesPanel: PanelModule = {
  id: "roles",
  title,
  subtitle,

  query: async (ctx) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", "250")

    const response = await fetch(new URL(`/api/roles?${params.toString()}`, ctx.url)).then((res) => res.json())

    return {
      roles: response.data?.roles ?? [],
      meta: {
        total: response.meta?.total ?? 0,
        page: 1,
        pageSize: 250,
      },
    }
  },

  commandBar: () => [
    { type: "link", label: "Create Role", href: `${basePath}/create`, intent: "roles.create" },
  ],

  layout: () => [
    Layouts.rows([
      Layouts.header({
        title,
        subtitle,
        requiredIntent: "roles.read",
      }),
      Layouts.table({
        key: "roles",
        title: "Roles",
        description: "Showing roles from the /api/roles endpoint.",
        rowsKey: "roles",
        paginationKey: "meta",
        enableEdit: false,
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "description", label: "Description", sortable: true, hideOnMobile: true },
          { key: "permissions", label: "Permissions" },
        ],
        rowActions: resolveRowActions(),
        rowActionBasePath: basePath,
        rowActionDeleteEndpoint: rolesResource.endpoints.delete,
        requiredIntent: "roles.read",
      }),
      Layouts.form({
        id: "roles-create",
        title: "Create role",
        description: "Add a new role with bundled permissions.",
        fields: rolesResource.form?.fields ?? [],
        submitLabel: "Create role",
        submitEndpoint: rolesResource.endpoints.create,
        submitMethod: "POST",
        after: "refresh",
        requiredIntent: "roles.create",
      }),
    ]),
  ],
}

export default rolesPanel
