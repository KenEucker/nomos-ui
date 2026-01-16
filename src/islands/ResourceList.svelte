<!--
  Supports list responses shaped as: { data: { [dataKey]: [] }, meta: { total } },
  { [dataKey]: [], total }, { data: [], meta: { total } }, { data: [] }, or [].
  Query params: page, pageSize, search (when provided), sort=key:dir.
-->
<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import DataTable from "../components/DataTable.svelte"
  import { apiGet } from "../lib/api"
  import { uiState } from "../lib/state"
  import type { ResourceDefinition } from "../lib/types"

  export let definition: ResourceDefinition

  type Row = Record<string, any>

  const tableIdPrefix = "resource"
  $: tableId = `${tableIdPrefix}:${definition.name}`

  let items: Row[] = []
  let total = 0
  let page = 1
  let pageSize = 20
  let search = ""
  let sortKey: string | null = null
  let sortDir: "asc" | "desc" = "asc"
  let loading = false
  let defaultsApplied = false
  let debounceId: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  $: listConfig = definition.list ?? {}
  $: columns = listConfig.columns ?? []

  const getLabelPlural = (resource: ResourceDefinition) => {
    if ("labels" in resource && resource.labels) return resource.labels.labelPlural
    return resource.labelPlural ?? resource.label ?? resource.name
  }

  $: title = getLabelPlural(definition)
  $: emptyMessage = `No ${title} found.`

  const unwrapItems = (response: any, dataKey?: string) => {
    const key = dataKey ?? ""
    const candidate =
      (key && response?.data?.[key]) ??
      (key && response?.[key]) ??
      response?.data ??
      response ??
      []
    const items = Array.isArray(candidate) ? candidate : []
    const total = response?.meta?.total ?? response?.total ?? items.length
    return { items, total }
  }

  const buildUrl = () => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (search.trim()) params.set("search", search.trim())
    if (sortKey) params.set("sort", `${sortKey}:${sortDir}`)
    const query = params.toString()
    return query ? `${definition.endpoints.list}?${query}` : definition.endpoints.list
  }

  const fetchList = async () => {
    const currentRequest = ++requestId
    loading = true
    try {
      const response = await apiGet<any>(buildUrl())
      if (currentRequest !== requestId) return
      const { items: nextItems, total: nextTotal } = unwrapItems(response, definition.dataKey)
      items = nextItems
      total = nextTotal
    } catch (error) {
      if (currentRequest !== requestId) return
      items = []
      total = 0
    } finally {
      if (currentRequest === requestId) loading = false
    }
  }

  const scheduleFetch = (delayMs: number) => {
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => {
      fetchList()
    }, delayMs)
  }

  const handleQueryChange = async (query: {
    page: number
    pageSize: number
    search: string
    sortKey: string | null
    sortDir: "asc" | "desc"
  }) => {
    if (debounceId) clearTimeout(debounceId)
    const previousSearch = search
    page = query.page
    pageSize = query.pageSize
    search = query.search
    sortKey = query.sortKey
    sortDir = query.sortDir

    if (previousSearch !== search) {
      scheduleFetch(250)
      return
    }

    await fetchList()
  }

  onMount(() => {
    if (!defaultsApplied) {
      pageSize = listConfig.pageSize ?? 20
      sortKey = listConfig.defaultSort?.key ?? null
      sortDir = listConfig.defaultSort?.direction ?? "asc"
      defaultsApplied = true
    }

    uiState.resetTable(tableId)
    uiState.setTablePageSize(tableId, pageSize)

    if (sortKey) {
      uiState.toggleTableSort(tableId, sortKey)
      if (sortDir === "desc") {
        uiState.toggleTableSort(tableId, sortKey)
      }
    }

    fetchList()
  })

  onDestroy(() => {
    if (debounceId) clearTimeout(debounceId)
  })
</script>

<DataTable
  id={definition.name}
  tableIdPrefix={tableIdPrefix}
  title={title}
  columns={columns}
  rows={items}
  emptyMessage={emptyMessage}
  page={page}
  pageSize={pageSize}
  total={total}
  loading={loading}
  showSearch={listConfig.searchable ?? false}
  searchPlaceholder={listConfig.searchPlaceholder ?? "Search..."}
  showSelection={false}
  showActions={false}
  enableEdit={false}
  onQueryChange={handleQueryChange}
/>
