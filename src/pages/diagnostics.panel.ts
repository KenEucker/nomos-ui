import { Layouts } from "../lib/layouts"
import type { PanelModule } from "../lib/types"

type Data = {
  status: string
  routes: Array<{ method: string; path: string }>
  jobs: Array<{ id: string; schedule?: string }>
}

const diagnosticsPanel: PanelModule<Data> = {
  id: "diagnostics",
  title: "Diagnostics",
  subtitle: "A slightly richer Panel: cards + tables + sections.",

  query: async () => {
    // Stubbed data to keep this drop-in vanilla.
    // Replace later with real fetches.
    return {
      status: "OK",
      routes: [
        { method: "GET", path: "/admin/hello" },
        { method: "GET", path: "/admin/diagnostics" },
      ],
      jobs: [
        { id: "cleanup-temp", schedule: "0 * * * *" },
        { id: "sync-metrics", schedule: "*/5 * * * *" },
      ],
    }
  },

  layout: (data) => [
    Layouts.section(
      { title: "Overview", description: "High-level system signals." },
      [
        Layouts.card({ title: "Status", value: data.status, description: "Runtime health" }),
        Layouts.card({ title: "Routes", value: data.routes.length }),
        Layouts.card({ title: "Jobs", value: data.jobs.length }),
      ]
    ),

    Layouts.section(
      { title: "Routes", description: "Registered endpoints." },
      [
        Layouts.table({
          id: "routes",
          title: "Routes",
          columns: [
            { key: "method", label: "Method" },
            { key: "path", label: "Path" },
            { key: "id", label: "ID" },
          ],
          rows: data.routes,
          emptyMessage: "No routes.",
        }),
      ]
    ),

    Layouts.section(
      { title: "Jobs", description: "Scheduled work." },
      [
        Layouts.table({
          id: "jobs",
          title: "Jobs",
          columns: [
            { key: "id", label: "Job" },
            { key: "schedule", label: "Schedule" },
          ],
          rows: data.jobs,
          emptyMessage: "No jobs.",
        }),
      ]
    ),
  ],
}

export default diagnosticsPanel
