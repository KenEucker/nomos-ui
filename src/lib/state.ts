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

  const updateTableState = (
    s: PanelUiState,
    tableId: string,
    updater: (current: TableUiState) => TableUiState
  ): PanelUiState => {
    const current = s.tables[tableId] ?? defaultTableState()
    const next = updater(current)
    return { ...s, tables: { ...s.tables, [tableId]: next } }
  }

  const ensureTable = (tableId: string) =>
    update((s) => {
      if (s.tables[tableId]) return s
      return { ...s, tables: { ...s.tables, [tableId]: defaultTableState() } }
    })

  const setTableSearch = (tableId: string, search: string) =>
    update((s) =>
      updateTableState(s, tableId, (current) => ({
        ...current,
        search,
        page: 1,
      }))
    )

  const toggleTableSort = (tableId: string, key: string) =>
    update((s) =>
      updateTableState(s, tableId, (current) => {
        if (current.sortKey === key) {
          return { ...current, sortDir: current.sortDir === "asc" ? "desc" : "asc" }
        }
        return { ...current, sortKey: key, sortDir: "asc" }
      })
    )

  const setTablePage = (tableId: string, page: number) =>
    update((s) =>
      updateTableState(s, tableId, (current) => ({
        ...current,
        page,
      }))
    )

  const setTablePageSize = (tableId: string, pageSize: number) =>
    update((s) =>
      updateTableState(s, tableId, (current) => ({
        ...current,
        pageSize,
        page: 1,
      }))
    )

  const setTableSort = (tableId: string, sortKey: string | null, sortDir: SortDir) =>
    update((s) =>
      updateTableState(s, tableId, (current) => ({
        ...current,
        sortKey,
        sortDir,
        page: 1,
      }))
    )

  const resetTable = (tableId: string) =>
    update((s) => ({ ...s, tables: { ...s.tables, [tableId]: defaultTableState() } }))

  return {
    subscribe,
    ensureTable,
    setTableSearch,
    toggleTableSort,
    setTableSort,
    setTablePage,
    setTablePageSize,
    resetTable,
  }
}

export const uiState = createUiState()
