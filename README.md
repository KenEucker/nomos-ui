# Nomos-UI

Nomos-UI provides a panel-first admin UI system inspired by Laravel Orchid. Panels are declarative, typed, and composed from standard primitives (cards, tables, forms, tabs, charts) so that both humans and LLMs can reliably build admin experiences.

## Panel model

Panels are module files (e.g. `src/pages/users.panel.ts`) that export a `PanelModule`:

```ts
import type { PanelModule } from "./src/lib/types"

const panel: PanelModule = {
  id: "users",
  title: "Users",
  subtitle: "Manage access",
  schema: myZodSchema,
  load: async (ctx) => ({ /* data */ }),
  actions: [
    { id: "refresh", label: "Refresh", run: ({ notify }) => notify("Loaded", "success") },
  ],
  layout: (data, ctx) => [/* Layouts.card(), Layouts.table(), ... */],
}
```

`PanelHost` renders panels as pages, modals, or embedded regions by passing a `mode`:

```astro
<PanelHost panel={usersPanel} mode="page" />
```

## Adding a panel

1. Create `src/pages/<name>.panel.ts` that exports a `PanelModule`.
2. Create `src/pages/<name>.astro` and render the panel inside `AppShell`.
3. Update navigation links if needed.

## Datatable panel example

```ts
Layouts.table({
  id: "users",
  title: "Directory",
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
  ],
  rows: data.users,
  rowActions: [
    { id: "delete", label: "Delete", variant: "destructive", run: ({ row }) => {/* ... */} },
  ],
  page: data.query.page,
  pageSize: data.query.pageSize,
  total: data.total,
  onQueryChange: async (query) => { /* fetch rows */ },
})
```

## Form panel example

```ts
Layouts.form({
  id: "create-user",
  title: "New user",
  schema: userSchema,
  fields: [
    { name: "name", label: "Name", type: "text" },
    { name: "role", label: "Role", type: "relation", loadOptions: listRoles },
    {
      name: "username",
      label: "Username",
      type: "lookup",
      lookup: {
        title: "Generate username",
        fields: [{ name: "name", label: "Display name" }],
        onLookup: runUsernameLookup,
        applyResult: (result) => ({ username: result.username }),
      },
    },
  ],
  onSubmit: async (values) => {/* ... */},
})
```

## Development

```sh
npm install
npm run dev
```

## Admin Panels (Orchid-style runtime)

The admin spike lives under `src/admin/` and is accessed via `/admin` and `/admin/p/:panelId`.
Panels are single-file modules with a declarative contract:

```ts
import type { PanelModule } from "./src/admin/types"
import { Layouts } from "./src/admin/layouts"

const panel: PanelModule = {
  id: "dashboard",
  title: "Admin Dashboard",
  subtitle: "System overview.",
  query: async (ctx) => ({
    stats: await fetch(new URL("/api/admin/overview", ctx.url)).then((res) => res.json()),
  }),
  commandBar: () => [
    { type: "link", label: "Resources", href: "/admin/p/resources" },
    { type: "method", label: "Refresh", endpoint: "/api/admin/refresh" },
  ],
  layout: () => [
    Layouts.card({
      title: "Build",
      nodes: [Layouts.stat({ label: "Build ID", valueKey: "stats.buildId" })],
    }),
  ],
}
```

### SSR/CSR lifecycle

1. `src/pages/admin/p/[panelId].astro` resolves the panel, builds `ctx`, runs `query(ctx)`,
   computes `layout(data, ctx)`, and renders the first paint.
2. `PanelRuntime.svelte` hydrates on the client, re-runs `query()` when actions fire or
   when the URL-driven list state changes, and re-renders the layout nodes.

### Adding a new admin panel

1. Create `src/admin/panels/<panel>.panel.ts` and export a `PanelModule`.
2. Register the panel in `src/admin/panels/index.ts`.
3. Link to it from `/admin` or other panels using a `commandBar()` link action.
