# Nomos UI Agent Guidelines

This repository uses an Orchid-style admin runtime. Follow these rules for new admin panel pages to avoid breaking table controls or hydration.

## Panel placement and loading
- **Colocate panels with their Astro pages** under `src/pages/admin/p/`.
  - Example: `src/pages/admin/p/users.astro` and `src/pages/admin/p/users.panel.ts`.
- **Do not create a panel registry** or a dynamic panel lookup by ID.
- **Do not pass modules or functions into Svelte islands.** Pass only JSON-serializable props:
  - `panelModuleKey` (string path such as `/src/pages/admin/p/users.panel.ts`)
  - `initialData`
  - `initialNodes`
  - `href`
- The island must load the panel module via `import.meta.glob("/src/pages/admin/p/**/*.panel.ts")` keyed by `panelModuleKey`.

## Panel contract (required)
Each panel module must export a default object with:
- `query(ctx)` → returns a **keyed data bag**: `{ users, meta }` (never a bare array).
- `layout(data, ctx)` → returns declarative layout nodes; nodes must read from the data bag by key.
- `commandBar(ctx, data)` → returns **action descriptors only** (no inline handlers).

## DataTable usage (critical)
- Always render tables with **`src/components/DataTable.svelte`**.
- For local-only sorting/search/paging, **load all rows in `query()`** and **do not pass** `page`, `pageSize`, `total`, or `onQueryChange`.
  - This lets DataTable manage its internal UI state for sorting, searching, and page size.
- Inline edits should be wired via `onSave` and persisted through `/api/users` (PATCH). Keep refresh by re-running `query()`.

## SSR flow (Astro)
- In the Astro page, statically import the colocated panel module.
- Build `ctx` from `Astro.url`, run `await panel.query(ctx)`, compute `nodes = panel.layout(data, ctx)`.
- Render the island with JSON-only props (see above).

## CSR flow (Svelte island)
- Load the panel module using `panelModuleKey` and `import.meta.glob`.
- Re-run `query()` on refresh or edits and recompute layout nodes.
- Keep UI state deterministic by parsing the URL into `ctx.state`.

## API routes
- Use `/api/users` as the data source for the admin users panel.
- Implement `PATCH /api/users` to persist inline edits; return `200` and the updated record.

## Do not do this
- No panel registry.
- No additional admin landing pages beyond `/admin` redirecting to `/admin/p/users`.
- No custom table components.
