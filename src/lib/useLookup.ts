import { writable } from "svelte/store"

export const useLookup = <T>() => {
  const open = writable(false)
  const result = writable<T | null>(null)

  const show = () => open.set(true)
  const hide = () => open.set(false)
  const resolve = (value: T) => {
    result.set(value)
    open.set(false)
  }

  return { open, result, show, hide, resolve }
}
