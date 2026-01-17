import { Layouts } from "../layouts"
import { adminFetch } from "../runtime/http"
import type { PanelModule } from "../types"

const dashboardPanel: PanelModule = {
  id: "dashboard",
  title: "Admin Dashboard",
  subtitle: "System overview and build info.",

  query: async (ctx) => {
    const overview = await adminFetch<{ buildId: string; serverTime: string }>(ctx, "/api/admin/overview")

    return {
      stats: overview,
    }
  },

  commandBar: () => [
    {
      type: "link",
      label: "Resources",
      href: "/admin/p/resources",
    },
    {
      type: "method",
      label: "Refresh",
      endpoint: "/api/admin/refresh",
      toast: { success: "Dashboard refreshed" },
    },
  ],

  layout: () => [
    Layouts.rows([
      Layouts.columns([
        {
          span: 6,
          nodes: [
            Layouts.card({
              title: "Build",
              description: "Latest server build id.",
              nodes: [Layouts.stat({ label: "Build ID", valueKey: "stats.buildId" })],
            }),
          ],
        },
        {
          span: 6,
          nodes: [
            Layouts.card({
              title: "Server Time",
              description: "Current server timestamp.",
              nodes: [Layouts.stat({ label: "UTC", valueKey: "stats.serverTime" })],
            }),
          ],
        },
      ]),
    ]),
  ],
}

export default dashboardPanel
