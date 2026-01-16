<script lang="ts">
  import { onMount } from "svelte"
  import { uiState } from "../lib/state"
  import type { TableNode } from "../lib/types"

  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
  import { Input } from "./ui/input"
  import { Button } from "./ui/button"
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
  } from "./ui/table"
  import { Checkbox } from "./ui/checkbox"
  import * as Dialog from "./ui/dialog"

  type Row = Record<string, any>

  export let id: string | undefined = undefined
  export let tableIdPrefix: string

  export let title: string
  export let description: string | undefined = undefined
  export let columns: TableNode["props"]["columns"]
  export let rows: TableNode["props"]["rows"]
  export let emptyMessage: string | undefined = undefined

  // metadata for deterministic patching
  export let dataKey: string | undefined = undefined
  export let rowIdKey: string | undefined = undefined

  // ✅ Svelte 5-forward “events”: callback props
  export let onSelect:
    | ((info: { tableId: string; rows: Row[]; rowIds: Array<string | number> }) => void)
    | undefined = undefined

  export let onSave:
    | ((info: {
        tableId: string
        dataKey?: string
        rowIdKey?: string
        row: Row
        patch: Partial<Row>
      }) => void | Promise<void>)
    | undefined = undefined

  $: tableId = `${tableIdPrefix}:${id ?? title}`

  // ---- Search / Sort helpers ----
  const normalize = (v: unknown) => String(v ?? "").toLowerCase()

  const matchesSearch = (row: Row, search: string) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return Object.values(row).some((v) => normalize(v).includes(q))
  }

  const compare = (a: any, b: any) => {
    const an = typeof a === "number" ? a : Number(a)
    const bn = typeof b === "number" ? b : Number(b)
    const aIsNum = !Number.isNaN(an) && a !== "" && a !== null && a !== undefined
    const bIsNum = !Number.isNaN(bn) && b !== "" && b !== null && b !== undefined
    if (aIsNum && bIsNum) return an - bn
    return String(a ?? "").localeCompare(String(b ?? ""))
  }

  const deriveRows = (
    source: Row[],
    state: { search: string; sortKey: string | null; sortDir: "asc" | "desc" }
  ) => {
    const filtered = source.filter((r) => matchesSearch(r, state.search))
    if (!state.sortKey) return filtered

    return [...filtered].sort((ra, rb) => {
      const res = compare(ra[state.sortKey!], rb[state.sortKey!])
      return state.sortDir === "asc" ? res : -res
    })
  }

  onMount(() => {
    uiState.ensureTable(tableId)
  })

  $: tableState = $uiState.tables?.[tableId] ?? { search: "", sortKey: null, sortDir: "asc" }
  $: displayRows = deriveRows((rows ?? []) as Row[], tableState)

  // ---- Selection + Dialog ----
  const getRowId = (row: Row, idx: number) =>
    rowIdKey && row?.[rowIdKey] != null ? (row[rowIdKey] as string | number) : idx

  let selectedIds = new Set<string | number>()
  $: selectedRows = displayRows.reduce<Row[]>((acc, row, idx) => {
    if (selectedIds.has(getRowId(row, idx))) acc.push(row)
    return acc
  }, [])
  $: selectedRowIds = displayRows.reduce<Array<string | number>>((acc, row, idx) => {
    const id = getRowId(row, idx)
    if (selectedIds.has(id)) acc.push(id)
    return acc
  }, [])
  $: onSelect?.({
    tableId,
    rows: selectedRows,
    rowIds: selectedRowIds,
  })

  let dialogOpen = false
  let editIndex: number | null = null
  let editDraft: Row | null = null

  const toggleSelected = (idx: number) => {
    const row = displayRows[idx]
    if (!row) return
    const id = getRowId(row, idx)
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds = next
  }

  const openEdit = (row: Row, idx: number) => {
    editIndex = idx
    editDraft = { ...row }
    dialogOpen = true
  }

  const saveEdit = async () => {
    if (editIndex == null || !editDraft) return
    const original = displayRows[editIndex]
    if (!original) return

    const patch: Partial<Row> = {}
    for (const col of columns) {
      if (editDraft[col.key] !== original[col.key]) patch[col.key] = editDraft[col.key]
    }

    if (Object.keys(patch).length === 0) {
      dialogOpen = false
      return
    }

    await onSave?.({ tableId, dataKey, rowIdKey, row: original, patch })
    dialogOpen = false
  }
</script>

<Card>
  <CardHeader>
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <CardTitle>{title}</CardTitle>
        {#if description}
          <CardDescription>{description}</CardDescription>
        {/if}
      </div>

      <div class="w-64">
        <Input
          value={tableState.search}
          placeholder="Search…"
          oninput={(e) => uiState.setTableSearch(tableId, (e.currentTarget as HTMLInputElement).value)}
        />
      </div>
    </div>
  </CardHeader>

  <CardContent class="pt-0">
    <div class="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10"></TableHead>

            {#each columns as col (col.key)}
              <TableHead>
                <Button
                  variant="ghost"
                  class="h-8 px-2 -ml-2"
                  onclick={() => uiState.toggleTableSort(tableId, col.key)}
                >
                  {col.label}
                  {#if tableState.sortKey === col.key}
                    <span class="ml-2 text-xs text-muted-foreground">
                      {tableState.sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  {/if}
                </Button>
              </TableHead>
            {/each}

            <TableHead class="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {#if displayRows.length === 0}
            <TableRow>
              <TableCell colspan={columns.length + 2} class="text-muted-foreground">
                {emptyMessage ?? "No data."}
              </TableCell>
            </TableRow>
          {:else}
            {#each displayRows as row, rIdx (rIdx)}
              <TableRow class={selectedIds.has(getRowId(row, rIdx)) ? "bg-muted/40" : ""}>
                <TableCell>
                  <!-- avoid Checkbox custom events: use button for a11y -->
                  <button
                    type="button"
                    class="inline-flex items-center"
                    onclick={() => toggleSelected(rIdx)}
                    aria-pressed={selectedIds.has(getRowId(row, rIdx))}
                  >
                    <Checkbox checked={selectedIds.has(getRowId(row, rIdx))} aria-label="Select row" />
                  </button>
                </TableCell>

                {#each columns as col (col.key)}
                  <TableCell>{String(row[col.key] ?? "")}</TableCell>
                {/each}

                <TableCell class="text-right">
                  <Button size="sm" variant="secondary" onclick={() => openEdit(row, rIdx)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            {/each}
          {/if}
        </TableBody>
      </Table>

      <Dialog.Root bind:open={dialogOpen}>
        <Dialog.Content class="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Edit</Dialog.Title>
            <Dialog.Description>Update fields and save.</Dialog.Description>
          </Dialog.Header>

          {#if editDraft}
            <div class="space-y-4 py-2">
              {#each columns as col (col.key)}
                <div class="space-y-1">
                  <div class="text-sm font-medium">{col.label}</div>
                  <Input
                    value={String(editDraft[col.key] ?? "")}
                    oninput={(e) => {
                      const v = (e.currentTarget as HTMLInputElement).value
                      editDraft = { ...editDraft, [col.key]: v }
                    }}
                  />
                </div>
              {/each}
            </div>
          {/if}

          <Dialog.Footer class="gap-2">
            <Button variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</Button>
            <Button onclick={saveEdit}>Save</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  </CardContent>
</Card>
