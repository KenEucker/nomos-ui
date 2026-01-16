<script lang="ts">
  import { Button } from "../ui/button"
  import * as Dialog from "../ui/dialog"
  import { Input } from "../ui/input"

  export type LookupField = {
    name: string
    label: string
    type?: "text" | "email"
  }

  export let title: string
  export let description: string | undefined = undefined
  export let submitLabel: string = "Run lookup"
  export let fields: LookupField[] = []
  export let onLookup: (values: Record<string, any>) => Promise<Record<string, any>>
  export let onApply: (result: Record<string, any>) => void

  let open = false
  let loading = false
  let error: string | null = null
  let values: Record<string, any> = {}

  const submit = async () => {
    loading = true
    error = null
    try {
      const result = await onLookup(values)
      onApply(result)
      open = false
      values = {}
    } catch (err: any) {
      error = err?.message ?? "Lookup failed"
    } finally {
      loading = false
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger asChild>
    <Button size="sm" variant="secondary">Open lookup</Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      {#if description}
        <Dialog.Description>{description}</Dialog.Description>
      {/if}
    </Dialog.Header>

    <div class="space-y-4 py-2">
      {#each fields as field (field.name)}
        <div class="space-y-1">
          <label class="text-sm font-medium" for={field.name}>{field.label}</label>
          <Input
            id={field.name}
            type={field.type ?? "text"}
            value={values[field.name] ?? ""}
            oninput={(e) =>
              (values = { ...values, [field.name]: (e.currentTarget as HTMLInputElement).value })}
          />
        </div>
      {/each}

      {#if error}
        <div class="text-sm text-destructive">{error}</div>
      {/if}
    </div>

    <Dialog.Footer class="gap-2">
      <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={submit} disabled={loading}>{loading ? "Running…" : submitLabel}</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
