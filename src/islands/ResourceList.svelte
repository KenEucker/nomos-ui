<!--
  Supports list responses shaped as: { data: { [dataKey]: [] }, meta: { total } },
  { [dataKey]: [], total }, { data: [], meta: { total } }, { data: [] }, or [].
  Query params: page, pageSize, search (when provided), sort=key:dir.
-->
<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import DataTable from "../components/DataTable.svelte"
  import { apiGet } from "../lib/api"
  import type { ResourceDefinition } from "../lib/types"

  export let definition: ResourceDefinition

  type Row = Record<string, any>

  const tableIdPrefix = "resource"

  let items: Row[] = []
  let total = 0
  let query = {
    page: 1,
    pageSize: 20,
    search: "",
    sortKey: null as string | null,
    sortDir: "asc" as "asc" | "desc",
  }
  let loading = false
  let debounceId: ReturnType<typeof setTimeout> | null = null
  let requestId = 0
  let dataKey: string | undefined = definition.dataKey
  let rowIdKey: string | undefined = definition.singleDataKey

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

  const buildUrl = (nextQuery = query) => {
    const params = new URLSearchParams()
    params.set("page", String(nextQuery.page))
    params.set("pageSize", String(nextQuery.pageSize))
    if (nextQuery.search.trim()) params.set("search", nextQuery.search.trim())
    if (nextQuery.sortKey) params.set("sort", `${nextQuery.sortKey}:${nextQuery.sortDir}`)
    const query = params.toString()
    return query ? `${definition.endpoints.list}?${query}` : definition.endpoints.list
  }

  const fetchList = async (nextQuery = query) => {
    const currentRequest = ++requestId
    loading = true
    try {
      const response = await apiGet<any>(buildUrl(nextQuery))
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

  const scheduleFetch = (delayMs: number, nextQuery = query) => {
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => {
      fetchList(nextQuery)
    }, delayMs)
  }

  const handleQueryChange = async (nextQuery: {
    page: number
    pageSize: number
    search: string
    sortKey: string | null
    sortDir: "asc" | "desc"
  }) => {
    if (debounceId) clearTimeout(debounceId)
    const previousSearch = query.search
    query = { ...nextQuery }

    if (previousSearch !== query.search) {
      scheduleFetch(250, query)
      return
    }

    await fetchList(query)
  }

  onMount(() => {
    query = {
      ...query,
      pageSize: listConfig.pageSize ?? 20,
      sortKey: listConfig.defaultSort?.key ?? null,
      sortDir: listConfig.defaultSort?.direction ?? "asc",
    }

    fetchList(query)
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
  dataKey={dataKey}
  rowIdKey={rowIdKey}
  page={query.page}
  pageSize={query.pageSize}
  total={total}
  loading={loading}
  showSearch={listConfig.searchable ?? false}
  searchPlaceholder={listConfig.searchPlaceholder ?? "Search..."}
  showSelection={false}
  showActions={false}
  enableEdit={false}
  disableControlsWhileLoading={true}
  onQueryChange={handleQueryChange}
/>
