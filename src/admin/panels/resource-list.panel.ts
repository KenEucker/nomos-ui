import { Layouts } from "../layouts"
import { adminFetch } from "../runtime/http"
import type { PanelModule } from "../types"

const resourceListPanel: PanelModule = {
  id: "resources",
  title: "Resources",
  subtitle: "Toy resources backed by stub API routes.",

  query: async (ctx) => {
    const query = new URLSearchParams()
    query.set("page", String(ctx.state.page))
    query.set("pageSize", String(ctx.state.pageSize))
    if (ctx.state.search) query.set("search", ctx.state.search)
    if (ctx.state.sort) query.set("sort", `${ctx.state.sort.key}:${ctx.state.sort.dir}`)

    const response = await adminFetch<{ items: Array<{ id: string; name: string }>; total: number }>(
      ctx,
      `/api/admin/resources?${query.toString()}`
    )

    return {
      items: response.items,
      meta: {
        total: response.total,
        page: ctx.state.page,
        pageSize: ctx.state.pageSize,
        search: ctx.state.search,
        sort: ctx.state.sort,
      },
    }
  },

  commandBar: (ctx, data) => [
    {
      type: "link",
      label: "Dashboard",
      href: "/admin/p/dashboard",
    },
    {
      type: "method",
      label: "Create Item",
      endpoint: "/api/admin/resources",
      payload: () => ({
        name: `Item ${Date.now()}`,
        page: ctx.state.page,
        pageSize: ctx.state.pageSize,
      }),
      toast: { success: "Resource created" },
    },
    {
      type: "method",
      label: "Refresh",
      endpoint: "/api/admin/refresh",
      payload: () => ({
        total: data.meta?.total ?? 0,
      }),
    },
  ],

  layout: () => [
    Layouts.rows([
      Layouts.card({
        title: "Resources",
        description: "Recent resource items.",
        nodes: [
          Layouts.table({
            key: "resources-table",
            rowsKey: "items",
            paginationKey: "meta",
            columns: [
              { key: "id", label: "ID", sortable: true },
              { key: "name", label: "Name", sortable: true },
            ],
          }),
        ],
      }),
    ]),
  ],
}

export default resourceListPanel
