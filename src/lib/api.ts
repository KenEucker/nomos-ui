export const apiGet = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    method: "GET",
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
