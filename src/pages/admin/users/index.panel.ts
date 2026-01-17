import { Layouts } from "$lib/layouts"
import type { PanelModule, RowAction } from "$lib/types"
import { usersResource } from "./users.resource"

const title = "Users"
const subtitle = "Directory of workspace users."
const basePath = "/admin/users"

const resolveRowActions = (): RowAction[] => {
  const config = usersResource.list?.rowActions
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

const usersPanel: PanelModule = {
  id: "users",
  title,
  subtitle,

  query: async (ctx) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", "250")

    const response = await fetch(new URL(`/api/users?${params.toString()}`, ctx.url)).then((res) => res.json())

    return {
      users: response.data?.users ?? [],
      meta: {
        total: response.meta?.total ?? 0,
        page: 1,
        pageSize: 250,
      },
    }
  },

  commandBar: () => [
    { type: "link", label: "Create User", href: `${basePath}/create` },
    {
      type: "method",
      label: "Refresh",
      endpoint: "/api/users",
      method: "POST",
      toast: { success: "Users refreshed" },
    },
  ],

  layout: () => [
    Layouts.rows([
      Layouts.header({
        title,
        subtitle,
      }),
      Layouts.table({
        key: "users",
        title: "Users",
        description: "Showing users from the /api/users endpoint.",
        rowsKey: "users",
        paginationKey: "meta",
        enableEdit: false,
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true, hideOnMobile: true },
          { key: "role", label: "Role", sortable: true },
          { key: "team", label: "Team", sortable: true, hideOnMobile: true },
          { key: "status", label: "Status", sortable: true },
        ],
        rowActions: resolveRowActions(),
        rowActionBasePath: basePath,
        rowActionDeleteEndpoint: usersResource.endpoints.delete,
      }),
    ]),
  ],
}

export default usersPanel
