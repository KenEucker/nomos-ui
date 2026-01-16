import { toast } from "svelte-sonner"

export const toastSuccess = (message: string, description?: string) =>
  toast.success(message, { description })

export const toastError = (message: string, description?: string) =>
  toast.error(message, { description })

export const toastInfo = (message: string, description?: string) =>
  toast.info(message, { description })

export const notify = (message: string, tone: "success" | "error" | "info" = "info") => {
  if (tone === "success") return toastSuccess(message)
  if (tone === "error") return toastError(message)
  return toastInfo(message)
}
