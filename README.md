# Nomos-UI

Nomos-UI is an Astro + Svelte admin UI runtime inspired by Laravel Orchid. The UI is driven by panel modules that fetch data and describe layout nodes. Astro handles SSR for the first paint, while a Svelte island rehydrates and refreshes panel data on the client.

## Framework architecture

### Panel modules
- Panels live in `src/pages/**.panel.ts` and export a `PanelModule` object from `src/lib/types.ts`.
- A `PanelModule` has three required functions:
  - `query(ctx)` → returns a **keyed data bag** (object) used by layouts.
  - `layout(data, ctx)` → returns an array of layout nodes created with `Layouts` (`src/lib/layouts.ts`).
  - `commandBar(ctx, data)` → returns action descriptors only (link or method actions).

### SSR (Astro)
- Astro pages import the panel module and call `query()` to get initial data.
- The page computes layout nodes and command bar actions, then renders the `PanelRuntime` island via `PanelPage.astro` or `ResourcePanelPage.astro`.
- The island receives **JSON-only props** such as `panelModuleKey`, `initialData`, `initialNodes`, and `href`.

### CSR (Svelte island)
- `PanelRuntime.svelte` loads the panel module dynamically using:
  ```ts
  import.meta.glob(["/src/pages/**/*.panel.ts", "/src/lib/resource.panel.ts"])
  ```
- It re-runs `query()` when state changes, then rebuilds layout nodes and command actions.
- `LayoutRenderer.svelte` renders layout nodes and always uses `src/components/DataTable.svelte` for tables.

### Resource panels
- `createResourcePanel` in `src/lib/resource-panel.ts` creates list/create/edit/view panels for a resource definition.
- `ResourcePanelPage.astro` wraps the runtime and passes a serializable `resourceConfig` to the Svelte island.

## Admin panels

The default admin route redirects to `/admin/users`. The user list panel is defined by:

- `src/pages/admin/users/index.astro`
- `src/pages/admin/users/index.panel.ts`

List/create/edit/view pages under `/admin/users` use the same runtime and layouts.

## Development

```sh
npm install
npm run dev
```
