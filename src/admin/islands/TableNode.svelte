<script lang="ts">
  import type { ColumnDef, QueryState } from "../types"

  export let columns: ColumnDef[] = []
  export let rows: Array<Record<string, any>> = []
  export let meta: { total?: number } | undefined
  export let state: QueryState
  export let onStateChange: (state: QueryState) => void

  $: total = meta?.total ?? rows.length
  $: totalPages = Math.max(1, Math.ceil(total / state.pageSize))

  const handleSearch = (event: Event) => {
    const target = event.target as HTMLInputElement
    onStateChange({ ...state, search: target.value || undefined, page: 1 })
  }

  const handlePageSize = (event: Event) => {
    const target = event.target as HTMLSelectElement
    onStateChange({ ...state, pageSize: Number(target.value), page: 1 })
  }

  const handleSort = (column: ColumnDef) => {
    if (!column.sortable) return
    const nextDir = state.sort?.key === column.key && state.sort?.dir === "asc" ? "desc" : "asc"
    onStateChange({ ...state, sort: { key: column.key, dir: nextDir }, page: 1 })
  }

  const prevPage = () => {
    if (state.page <= 1) return
    onStateChange({ ...state, page: state.page - 1 })
  }

  const nextPage = () => {
    if (state.page >= totalPages) return
    onStateChange({ ...state, page: state.page + 1 })
  }
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-2">
      <input
        class="h-9 w-60 rounded-md border bg-background px-3 text-sm text-foreground"
        placeholder="Search..."
        value={state.search ?? ""}
        on:input={handleSearch}
      />
    </div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Rows</span>
      <select
        class="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
        value={state.pageSize}
        on:change={handlePageSize}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>
    </div>
  </div>

  <div class="overflow-hidden rounded-xl border">
    <table class="w-full text-sm">
      <thead class="bg-muted/50 text-xs uppercase text-muted-foreground">
        <tr>
          {#each columns as column (column.key)}
            <th
              class="cursor-pointer px-4 py-3 text-left"
              role="button"
              tabindex="0"
              on:click={() => handleSort(column)}
            >
              <span class="inline-flex items-center gap-1">
                {column.label}
                {#if state.sort?.key === column.key}
                  <span>{state.sort.dir === "asc" ? "▲" : "▼"}</span>
                {/if}
              </span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y">
        {#if rows.length === 0}
          <tr>
            <td class="px-4 py-6 text-center text-muted-foreground" colspan={columns.length}>
              No results.
            </td>
          </tr>
        {:else}
          {#each rows as row (row.id ?? row.name ?? row)}
            <tr class="hover:bg-muted/30">
              {#each columns as column (column.key)}
                <td class="px-4 py-3 text-foreground">{row[column.key]}</td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <div class="flex items-center justify-between text-sm text-muted-foreground">
    <div>
      Page {state.page} of {totalPages}
    </div>
    <div class="flex items-center gap-2">
      <button
        class="rounded-md border px-3 py-1 disabled:opacity-50"
        on:click={prevPage}
        disabled={state.page <= 1}
      >
        Prev
      </button>
      <button
        class="rounded-md border px-3 py-1 disabled:opacity-50"
        on:click={nextPage}
        disabled={state.page >= totalPages}
      >
        Next
      </button>
    </div>
  </div>
</div>
