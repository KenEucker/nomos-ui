// src/lib/uiState.ts
import { writable } from "svelte/store"

export type SortDir = "asc" | "desc"

export type TableUiState = {
  search: string
  sortKey: string | null
  sortDir: SortDir
  page: number
  pageSize: number
}

export type PanelUiState = {
  tables: Record<string, TableUiState>
}

const defaultTableState = (): TableUiState => ({
  search: "",
  sortKey: null,
  sortDir: "asc",
  page: 1,
  pageSize: 10,
})

const createUiState = () => {
  const { subscribe, update } = writable<PanelUiState>({ tables: {} })

  const ensureTable = (tableId: string) =>
    update((s) => {
      if (!s.tables[tableId]) s.tables[tableId] = defaultTableState()
      return s
    })

  const setTableSearch = (tableId: string, search: string) =>
    update((s) => {
      s.tables[tableId] ??= defaultTableState()
      s.tables[tableId].search = search
      s.tables[tableId].page = 1
      return s
    })

  const toggleTableSort = (tableId: string, key: string) =>
    update((s) => {
      s.tables[tableId] ??= defaultTableState()
      const t = s.tables[tableId]

      if (t.sortKey === key) {
        t.sortDir = t.sortDir === "asc" ? "desc" : "asc"
      } else {
        t.sortKey = key
        t.sortDir = "asc"
      }

      return s
    })

  const setTablePage = (tableId: string, page: number) =>
    update((s) => {
      s.tables[tableId] ??= defaultTableState()
      s.tables[tableId].page = page
      return s
    })

  const setTablePageSize = (tableId: string, pageSize: number) =>
    update((s) => {
      s.tables[tableId] ??= defaultTableState()
      s.tables[tableId].pageSize = pageSize
      s.tables[tableId].page = 1
      return s
    })

  const resetTable = (tableId: string) =>
    update((s) => {
      s.tables[tableId] = defaultTableState()
      return s
    })

  return {
    subscribe,
    ensureTable,
    setTableSearch,
    toggleTableSort,
    setTablePage,
    setTablePageSize,
    resetTable,
  }
}

export const uiState = createUiState()
