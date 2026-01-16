import { Layouts } from "../lib/layouts"
import type { PanelModule } from "../lib/types"
import { getDailyMetric } from "../services/metrics"

type Data = {
  status: string
  routes: Array<{ id: string; method: string; path: string }>
  jobs: Array<{ id: string; schedule?: string }>
  trend: Array<{ date: string; value: number }>
}

const diagnosticsPanel: PanelModule<Data> = {
  id: "diagnostics",
  title: "Diagnostics",
  subtitle: "Runtime health and operational signals.",

  load: async () => {
    return {
      status: "OK",
      routes: [
        { id: "route-hello", method: "GET", path: "/admin/hello" },
        { id: "route-diagnostics", method: "GET", path: "/admin/diagnostics" },
      ],
      jobs: [
        { id: "cleanup-temp", schedule: "0 * * * *" },
        { id: "sync-metrics", schedule: "*/5 * * * *" },
      ],
      trend: await getDailyMetric(),
    }
  },

  actions: [
    {
      id: "toast-info",
      label: "Toast info",
      variant: "secondary",
      run: ({ notify }) => notify("Diagnostics refreshed", "info"),
    },
    {
      id: "toast-success",
      label: "Toast success",
      variant: "secondary",
      run: ({ notify }) => notify("All systems green", "success"),
    },
    {
      id: "toast-error",
      label: "Toast error",
      variant: "destructive",
      run: ({ notify }) => notify("Service degraded", "error"),
    },
  ],

  layout: (data, ctx) => [
    Layouts.cardGrid({
      cards: [
        { title: "Status", value: data.status, description: "Runtime health" },
        { title: "Routes", value: data.routes.length, description: "Registered endpoints" },
        { title: "Jobs", value: data.jobs.length, description: "Scheduled work" },
      ],
    }),

    Layouts.timeSeries({
      title: "Requests per day",
      description: "Synthetic traffic trend",
      data: data.trend,
    }),

    Layouts.errorBox({
      title: "Telemetry stream",
      message: "Error rate spike detected in shard 2.",
      details: "Sample trace: shard=2, error=timeout, service=metrics-bridge",
      retryLabel: "Retry fetch",
      onRetry: () => ctx?.notify?.("Retrying telemetry", "info"),
    }),

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
