<script lang="ts">
  import type { LayoutNode, QueryState } from "../types"
  import DataTable from "../../components/DataTable.svelte"

  export let nodes: LayoutNode[] = []
  export let data: Record<string, any> = {}
  export let state: QueryState
  export let tableIdPrefix: string
  export let onStateChange: (state: QueryState) => void

  const getValue = (source: Record<string, any>, path?: string) => {
    if (!path) return undefined
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), source)
  }

  const spanClass = (span?: number) => {
    switch (span) {
      case 1:
        return "col-span-1"
      case 2:
        return "col-span-2"
      case 3:
        return "col-span-3"
      case 4:
        return "col-span-4"
      case 5:
        return "col-span-5"
      case 6:
        return "col-span-6"
      case 7:
        return "col-span-7"
      case 8:
        return "col-span-8"
      case 9:
        return "col-span-9"
      case 10:
        return "col-span-10"
      case 11:
        return "col-span-11"
      default:
        return "col-span-12"
    }
  }
</script>

<div class="space-y-6">
  {#each nodes as node, index (index)}
    {#if node.type === "rows"}
      <div class="space-y-6">
        <svelte:self
          nodes={node.props.nodes}
          {data}
          {state}
          {tableIdPrefix}
          {onStateChange}
        />
      </div>
    {:else if node.type === "columns"}
      <div class="grid grid-cols-12 gap-4">
        {#each node.props.columns as column (column)}
          <div class={spanClass(column.span)}>
            <svelte:self
              nodes={column.nodes}
              {data}
              {state}
              {tableIdPrefix}
              {onStateChange}
            />
          </div>
        {/each}
      </div>
    {:else if node.type === "card"}
      <div class="rounded-xl border bg-card p-6 shadow-sm">
        {#if node.props.title}
          <div class="text-lg font-semibold text-foreground">{node.props.title}</div>
        {/if}
        {#if node.props.description}
          <div class="text-sm text-muted-foreground">{node.props.description}</div>
        {/if}
        <div class="mt-4 space-y-4">
          <svelte:self
            nodes={node.props.nodes}
            {data}
            {state}
            {tableIdPrefix}
            {onStateChange}
          />
        </div>
      </div>
    {:else if node.type === "table"}
      <DataTable
        id={node.props.key}
        tableIdPrefix={tableIdPrefix}
        title={node.props.title ?? "Table"}
        description={node.props.description}
        columns={node.props.columns}
        rows={data[node.props.rowsKey] ?? []}
        dataKey={node.props.rowsKey}
        rowIdKey="id"
        showSelection={false}
        showActions={true}
        enableEdit={true}
        page={state.page}
        pageSize={state.pageSize}
        total={node.props.paginationKey ? data[node.props.paginationKey]?.total : undefined}
        loading={false}
        onQueryChange={(query) =>
          onStateChange({
            page: query.page,
            pageSize: query.pageSize,
            search: query.search || undefined,
            sort: query.sortKey ? { key: query.sortKey, dir: query.sortDir } : undefined,
          })
        }
        onSave={async ({ row, patch }) => {
          const response = await fetch("/api/users", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: row.id, patch }),
          })
          if (!response.ok) {
            throw new Error(`Save failed with status ${response.status}`)
          }
          onStateChange(state)
        }}
      />
    {:else if node.type === "fieldset"}
      <fieldset class="space-y-4 rounded-xl border bg-card p-6">
        {#if node.props.title}
          <legend class="px-2 text-sm font-semibold text-muted-foreground">{node.props.title}</legend>
        {/if}
        <svelte:self
          nodes={node.props.nodes}
          {data}
          {state}
          {tableIdPrefix}
          {onStateChange}
        />
      </fieldset>
    {:else if node.type === "text"}
      <p class="text-sm text-foreground">{node.props.value ?? getValue(data, node.props.valueKey)}</p>
    {:else if node.type === "stat"}
      <div class="rounded-lg border bg-background p-4">
        <div class="text-xs uppercase tracking-wide text-muted-foreground">{node.props.label}</div>
        <div class="mt-1 text-2xl font-semibold text-foreground">
          {getValue(data, node.props.valueKey) ?? "—"}
        </div>
      </div>
    {/if}
  {/each}
</div>
