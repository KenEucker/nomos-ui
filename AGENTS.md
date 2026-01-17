# Nomos UI Agent Guidelines

This repository uses an Orchid-style admin runtime. Follow these rules for new admin panel pages to avoid breaking table controls or hydration.

## Framework architecture (current)
- **Panel modules** live in `src/pages/**.panel.ts` and export a `PanelModule` with `query`, `layout`, and `commandBar`.
- **Astro SSR** happens in `PanelPage.astro`/`ResourcePanelPage.astro`: build a `PanelCtx`, run `query()`, then render the Svelte island with JSON-only props (`panelModuleKey`, `initialData`, `initialNodes`, `initialCommands`, `href`).
- **Svelte CSR** happens in `PanelRuntime.svelte`: it loads the panel module via `import.meta.glob(["/src/pages/**/*.panel.ts", "/src/lib/resource.panel.ts"])`, re-runs `query()` on state changes, and renders nodes with `LayoutRenderer.svelte`.
- **Layouts** are declared with `src/lib/layouts.ts` and rendered by `LayoutRenderer.svelte`.
- **Data tables** always use `src/components/DataTable.svelte` through a `Layouts.table()` node.

## Panel placement and loading
- **Colocate panels with their Astro pages** under `src/pages/`.
  - Example: `src/pages/admin/users/index.astro` and `src/pages/admin/users/index.panel.ts`.
- **Do not create a panel registry** or a dynamic panel lookup by ID.
- **Do not pass modules or functions into Svelte islands.** Pass only JSON-serializable props:
  - `panelModuleKey` (string path such as `/src/pages/admin/users/index.panel.ts`)
  - `initialData`
  - `initialNodes`
  - `initialCommands`
  - `href`
- The island must load the panel module via `import.meta.glob(["/src/pages/**/*.panel.ts", "/src/lib/resource.panel.ts"])` keyed by `panelModuleKey`.

## Panel contract (required)
Each panel module must export a default object with:
- `query(ctx)` → returns a **keyed data bag**: `{ users, meta }` (never a bare array).
- `layout(data, ctx)` → returns declarative layout nodes; nodes must read from the data bag by key.
- `commandBar(ctx, data)` → returns **action descriptors only** (no inline handlers).

## DataTable usage (critical)
- Always render tables with **`src/components/DataTable.svelte`** via `Layouts.table()`.
- For local-only sorting/search/paging, **load all rows in `query()`** and **do not set** `serverSide`/`paginationKey`.
  - This lets DataTable manage its internal UI state for sorting, searching, and page size.
- Inline edits should be wired via `saveEndpoint` + `saveMethod` and persisted through `/api/users` (PATCH). Keep refresh by re-running `query()`.

## SSR flow (Astro)
- In the Astro page, statically import the colocated panel module.
- Build `ctx` from `Astro.url` or `Astro.request.url`, run `await panel.query(ctx)`, compute `nodes = panel.layout(data, ctx)`.
- Render the island with JSON-only props (see above).

## CSR flow (Svelte island)
- Load the panel module using `panelModuleKey` and `import.meta.glob`.
- Re-run `query()` on refresh or edits and recompute layout nodes.
- Keep UI state deterministic by parsing the URL into `ctx.state`.

## API routes
- Use `/api/users` as the data source for the admin users panel.
- Implement `PATCH /api/users` to persist inline edits; return `200` and the updated record.

## Adding new pages (LLM instructions)
When adding new admin pages, follow this exact flow:
1. **Create the Astro page** under `src/pages/admin/<resource>/`.
   - List pages should be `index.astro` (e.g. `/admin/projects`).
   - Create/edit/view pages can be `create.astro`, `edit.astro`, `view.astro`.
2. **Create or update the colocated panel module** under the same folder:
   - `index.panel.ts` for list pages.
   - Use `PanelModule` with `query`, `layout`, `commandBar`.
3. **Wire the page to the panel runtime**:
   - For custom panels, render `<PanelPage panel={panel} panelModuleKey="/src/pages/.../index.panel.ts" />`.
   - For resource CRUD pages, use `createResourcePanel` + `<ResourcePanelPage />` with `resourceConfig`.
4. **Keep props serializable**: only pass strings/objects/arrays, never functions or modules.
5. **Use `Layouts.table()` + DataTable** for tables. Avoid custom table components.
6. **Hook APIs**: list pages should fetch from `/api/<resource>`; edit/save should call PATCH endpoints as needed.

## Do not do this
- No panel registry.
- No additional admin landing pages beyond `/admin` redirecting to `/admin/users`.
- No custom table components.
