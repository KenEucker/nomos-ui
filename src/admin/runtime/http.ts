import type { PanelCtx } from "../types"

export const adminFetch = async <T>(ctx: PanelCtx, path: string, init?: RequestInit): Promise<T> => {
  const url = new URL(path, ctx.url)
  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}
