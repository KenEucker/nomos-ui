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

Admin panels live next to their Astro pages. For example, `/admin/p/users` is backed by:

- `src/pages/admin/p/users.astro`
- `src/pages/admin/p/users.panel.ts`

Panels export `query`, `layout`, and `commandBar`, and the runtime hydrates in the Svelte island
using a `panelModuleKey` (string) rather than passing module instances.
