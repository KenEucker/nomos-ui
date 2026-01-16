export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const withLatency = async <T>(value: T, ms = 350): Promise<T> => {
  await delay(ms)
  return value
}
