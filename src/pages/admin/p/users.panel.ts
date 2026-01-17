import { Layouts } from "../../../admin/layouts"
import type { PanelModule } from "../../../admin/types"

const usersPanel: PanelModule = {
  id: "users",
  title: "Users",
  subtitle: "Directory of workspace users.",

  query: async (ctx) => {
    const params = new URLSearchParams()
    params.set("page", String(ctx.state.page))
    params.set("pageSize", String(ctx.state.pageSize))
    if (ctx.state.search) params.set("search", ctx.state.search)
    if (ctx.state.sort) params.set("sort", `${ctx.state.sort.key}:${ctx.state.sort.dir}`)

    const response = await fetch(new URL(`/api/users?${params.toString()}`, ctx.url)).then((res) => res.json())

    return {
      users: response.data?.users ?? [],
      meta: {
        total: response.meta?.total ?? 0,
        page: ctx.state.page,
        pageSize: ctx.state.pageSize,
        search: ctx.state.search,
        sort: ctx.state.sort,
      },
    }
  },

  commandBar: () => [
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
      Layouts.table({
        key: "users",
        title: "Users",
        description: "Showing users from the /api/users endpoint.",
        rowsKey: "users",
        paginationKey: "meta",
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true, hideOnMobile: true },
          { key: "role", label: "Role", sortable: true },
          { key: "team", label: "Team", sortable: true, hideOnMobile: true },
          { key: "status", label: "Status", sortable: true },
        ],
      }),
    ]),
  ],
}

export default usersPanel
