import type { PanelCtx, QueryState } from "./types"

const parseQueryParams = (url: URL): Record<string, string | string[]> => {
  const result: Record<string, string | string[]> = {}
  url.searchParams.forEach((value, key) => {
    if (result[key]) {
      const current = result[key]
      result[key] = Array.isArray(current) ? [...current, value] : [current, value]
      return
    }
    result[key] = value
  })
  return result
}

export const parseStateFromUrl = (url: URL): QueryState => {
  const page = Number(url.searchParams.get("page") ?? "1")
  const pageSize = Number(url.searchParams.get("pageSize") ?? "10")
  const search = url.searchParams.get("search") ?? undefined
  const sortParam = url.searchParams.get("sort")
  const sort = sortParam
    ? {
        key: sortParam.split(":")[0],
        dir: (sortParam.split(":")[1] ?? "asc") as "asc" | "desc",
      }
    : undefined

  return {
    page: Number.isNaN(page) ? 1 : page,
    pageSize: Number.isNaN(pageSize) ? 10 : pageSize,
    search,
    sort,
  }
}

export const buildPanelCtx = (url: URL, params: Record<string, string>): PanelCtx => {
  return {
    url: url.toString(),
    params,
    query: parseQueryParams(url),
    state: parseStateFromUrl(url),
  }
}

export const updateUrlWithState = (url: URL, state: QueryState): URL => {
  const next = new URL(url.toString())
  next.searchParams.set("page", String(state.page))
  next.searchParams.set("pageSize", String(state.pageSize))
  if (state.search) {
    next.searchParams.set("search", state.search)
  } else {
    next.searchParams.delete("search")
  }
  if (state.sort?.key) {
    next.searchParams.set("sort", `${state.sort.key}:${state.sort.dir}`)
  } else {
    next.searchParams.delete("sort")
  }
  return next
}
