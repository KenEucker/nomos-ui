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
    actions.push({ id: "view", label: "View", variant: "secondary" })
  }
  if (config?.edit ?? true) {
    actions.push({ id: "edit", label: "Edit", variant: "secondary" })
  }
  if (config?.delete ?? true) {
    actions.push({ id: "delete", label: "Delete", variant: "destructive" })
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

  commandBar: () => [{ type: "link", label: "Create Role", href: `${basePath}/create` }],

  layout: () => [
    Layouts.rows([
      Layouts.header({
        title,
        subtitle,
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
      }),
    ]),
  ],
}

export default rolesPanel
