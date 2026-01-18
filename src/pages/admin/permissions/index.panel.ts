import { Layouts } from "$lib/layouts"
import type { PanelModule, RowAction } from "$lib/types"
import { permissionsResource } from "./permissions.resource"

const title = "Permissions"
const subtitle = "Define the actions available across the platform."
const basePath = "/admin/permissions"

const resolveRowActions = (): RowAction[] => {
  const config = permissionsResource.list?.rowActions
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

const permissionsPanel: PanelModule = {
  id: "permissions",
  title,
  subtitle,

  query: async (ctx) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", "250")

    const response = await fetch(new URL(`/api/permissions?${params.toString()}`, ctx.url)).then((res) => res.json())

    return {
      permissions: response.data?.permissions ?? [],
      meta: {
        total: response.meta?.total ?? 0,
        page: 1,
        pageSize: 250,
      },
    }
  },

  commandBar: () => [{ type: "link", label: "Create Permission", href: `${basePath}/create` }],

  layout: () => [
    Layouts.rows([
      Layouts.header({
        title,
        subtitle,
      }),
      Layouts.table({
        key: "permissions",
        title: "Permissions",
        description: "Showing permissions from the /api/permissions endpoint.",
        rowsKey: "permissions",
        paginationKey: "meta",
        enableEdit: false,
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "description", label: "Description", sortable: true, hideOnMobile: true },
        ],
        rowActions: resolveRowActions(),
        rowActionBasePath: basePath,
        rowActionDeleteEndpoint: permissionsResource.endpoints.delete,
      }),
    ]),
  ],
}

export default permissionsPanel
