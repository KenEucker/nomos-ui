// src/lib/mutations.ts

export type OptimisticPatch<T> = (current: T) => T
export type Rollback = () => void

export type MutationOptions<TData, TResult = unknown> = {
  optimistic?: OptimisticPatch<TData>
  request: () => Promise<TResult>
  onSuccess?: (result: TResult) => void
  onError?: (error: unknown) => void
}

/**
 * Runs an optimistic mutation:
 * - apply optimistic patch (if provided)
 * - run request
 * - rollback on error
 */
export const runMutation = async <TData, TResult>(
  getData: () => TData,
  setData: (next: TData) => void,
  opts: MutationOptions<TData, TResult>
) => {
  const before = getData()
  let didPatch = false

  try {
    if (opts.optimistic) {
      const patched = opts.optimistic(before)
      setData(patched)
      didPatch = true
    }

    const result = await opts.request()
    opts.onSuccess?.(result)
    return result
  } catch (err) {
    if (didPatch) setData(before)
    opts.onError?.(err)
    throw err
  }
}
