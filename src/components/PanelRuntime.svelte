<script lang="ts">
  import type { LayoutNode, PanelModule } from "../lib/types"
  import { loadPanelById } from "../lib/loader"
  import { uiState } from "../lib/state"
  import { runMutation } from "../lib/mutations"

  $: $uiState

  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
  import DataTable from "./DataTable.svelte"

  export let panelId: string
  export let title: string
  export let subtitle: string | undefined

  export let initialData: any = null
  export let initialError: string | null = null

  let panel: PanelModule<any> | null = null
  let loading = true
  let error: string | null = initialError

  // This is the state you’ll eventually make reactive (search/sort/filter, optimistic patches, etc.)
  let data: any = initialData
  let nodes: LayoutNode[] = []

  const computeNodes = () => {
    if (!panel || error) {
      nodes = []
      return
    }

    try {
      // layout can optionally accept ctx; for now we only give minimal info
      nodes = panel.layout.length >= 2
        ? panel.layout(data, { url: window.location.href })
        : panel.layout(data)
    } catch (e: any) {
      error = e?.message ?? String(e)
      nodes = []
    }
  }

  const init = async () => {
    loading = true
    try {
      panel = await loadPanelById(panelId)

      // If SSR failed, we can still try to fetch in client later (next step)
      // For now: if we don't have data and no error, we just render empty.
      computeNodes()
    } catch (e: any) {
      error = e?.message ?? String(e)
    } finally {
      loading = false
    }
  }

  $: if (panel && data && !error) computeNodes()

  const normalize = (v: unknown) => String(v ?? "").toLowerCase()

  const matchesSearch = (row: Record<string, any>, search: string) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    // simple: search across all visible values in row
    return Object.values(row).some((v) => normalize(v).includes(q))
  }

  const compare = (a: any, b: any) => {
    // numbers sort numerically, else string compare
    const an = typeof a === "number" ? a : Number(a)
    const bn = typeof b === "number" ? b : Number(b)
    const aIsNum = !Number.isNaN(an) && a !== "" && a !== null && a !== undefined
    const bIsNum = !Number.isNaN(bn) && b !== "" && b !== null && b !== undefined
    if (aIsNum && bIsNum) return an - bn
    return String(a ?? "").localeCompare(String(b ?? ""))
  }

  const deriveRows = (
    rows: Array<Record<string, any>>,
    tableState: { search: string; sortKey: string | null; sortDir: "asc" | "desc" }
  ) => {
    const filtered = rows.filter((r) => matchesSearch(r, tableState.search))

    if (!tableState.sortKey) return filtered

    const sorted = [...filtered].sort((ra, rb) => {
      const res = compare(ra[tableState.sortKey!], rb[tableState.sortKey!])
      return tableState.sortDir === "asc" ? res : -res
    })

    return sorted
  }

  const patchRow = (current: any, dataKey: string, rowIdKey: string, row: any, patch: any) => {
    const arr = current?.[dataKey]
    if (!Array.isArray(arr)) return current

    const targetId = row?.[rowIdKey]
    const nextArr = arr.map((item: any) =>
        item?.[rowIdKey] === targetId ? { ...item, ...patch } : item
    )

    return { ...current, [dataKey]: nextArr }
  }

  init()
</script>

<div class="mx-auto max-w-5xl p-6 space-y-6">
  <header class="space-y-1">
    <h1 class="text-2xl font-bold">{title}</h1>
    {#if subtitle}
      <p class="text-muted-foreground">{subtitle}</p>
    {/if}
  </header>

  {#if loading}
    <div class="text-muted-foreground">Loading…</div>
  {:else if error}
    <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      {error}
    </div>
  {:else}
    <div class="space-y-6">
      {#each nodes as node, idx (idx)}
        {#if node.type === "card"}
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">
                {node.props.title}
              </CardTitle>
              {#if node.props.description}
                <CardDescription>{node.props.description}</CardDescription>
              {/if}
            </CardHeader>
            <CardContent>
              <div class="text-xl font-semibold">{node.props.value}</div>
            </CardContent>
          </Card>

        {:else if node.type === "table"}
          <DataTable
            tableIdPrefix={`${panelId}:table`}
            id={node.props.id}
            title={node.props.title}
            description={node.props.description}
            columns={node.props.columns}
            rows={node.props.rows}
            emptyMessage={node.props.emptyMessage}
            dataKey={node.props.dataKey}
            rowIdKey={node.props.rowIdKey}
            onSave={async ({ tableId, dataKey, rowIdKey, row, patch }) => {
                await runMutation(
                    () => data,
                    (next) => {
                    data = next
                    computeNodes()
                    },
                    {
                    optimistic: (current) => {
                        if (dataKey && rowIdKey) return patchRow(current, dataKey, rowIdKey, row, patch)
                        return current
                    },
                    request: async () => {
                        await new Promise((r) => setTimeout(r, 400))
                        return { ok: true }
                    },
                    onError: (err) => {
                        error = (err as any)?.message ?? "Save failed"
                    },
                    }
                )
            }}
          />
            


        {:else if node.type === "section"}
          <section class="space-y-3">
            <div>
              <h2 class="text-lg font-semibold">{node.props.title}</h2>
              {#if node.props.description}
                <p class="text-sm text-muted-foreground">{node.props.description}</p>
              {/if}
            </div>

            <div class="space-y-6">
              {#each node.props.children as child, cIdx (cIdx)}
                {#if child.type === "card"}
                  <Card>
                    <CardHeader class="pb-2">
                      <CardTitle class="text-sm font-medium text-muted-foreground">
                        {child.props.title}
                      </CardTitle>
                      {#if child.props.description}
                        <CardDescription>{child.props.description}</CardDescription>
                      {/if}
                    </CardHeader>
                    <CardContent>
                      <div class="text-xl font-semibold">{child.props.value}</div>
                    </CardContent>
                  </Card>

                {:else if child.type === "table"}
                  <DataTable
                    tableIdPrefix={`${panelId}:section:${node.props.title}:table`}
                    id={child.props.id}
                    title={child.props.title}
                    description={child.props.description}
                    columns={child.props.columns}
                    rows={child.props.rows}
                    emptyMessage={child.props.emptyMessage}
                    dataKey={child.props.dataKey}
                    rowIdKey={child.props.rowIdKey}
                    onSave={async ({ tableId, dataKey, rowIdKey, row, patch }) => {
                        await runMutation(
                            () => data,
                            (next) => {
                            data = next
                            computeNodes()
                            },
                            {
                            optimistic: (current) => {
                                if (dataKey && rowIdKey) return patchRow(current, dataKey, rowIdKey, row, patch)
                                return current
                            },
                            request: async () => {
                                await new Promise((r) => setTimeout(r, 400))
                                return { ok: true }
                            },
                            onError: (err) => {
                                error = (err as any)?.message ?? "Save failed"
                            },
                            }
                        )
                    }}
                  />
                {/if}
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
  {/if}
</div>
