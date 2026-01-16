<script lang="ts">
  import { onMount } from "svelte"
  import { Input } from "../ui/input"
  import { Button } from "../ui/button"
  import { Badge } from "../ui/badge"

  export type Option = { value: string; label: string }

  export let label: string = ""
  export let value: string | string[] | null = null
  export let multiple = false
  export let placeholder = "Search…"
  export let loadOptions: (search: string) => Promise<Option[]>
  export let onChange: (value: string | string[] | null) => void

  let search = ""
  let options: Option[] = []
  let loading = false
  let error: string | null = null

  const fetchOptions = async (term: string) => {
    loading = true
    error = null
    try {
      options = await loadOptions(term)
    } catch (err: any) {
      error = err?.message ?? "Failed to load options"
      options = []
    } finally {
      loading = false
    }
  }

  const toggleValue = (option: Option) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : []
      if (current.includes(option.value)) {
        onChange(current.filter((v) => v !== option.value))
      } else {
        onChange([...current, option.value])
      }
    } else {
      onChange(option.value)
    }
  }

  const clearSelection = () => {
    onChange(multiple ? [] : null)
  }

  $: selected = multiple
    ? options.filter((opt) => (Array.isArray(value) ? value : []).includes(opt.value))
    : options.find((opt) => opt.value === value)

  onMount(() => {
    fetchOptions("")
  })
</script>

<div class="space-y-2">
  {#if label}
    <div class="text-sm font-medium">{label}</div>
  {/if}
  <div class="flex items-center gap-2">
    <Input
      value={search}
      placeholder={placeholder}
      oninput={(e) => {
        search = (e.currentTarget as HTMLInputElement).value
        fetchOptions(search)
      }}
    />
    <Button size="sm" variant="secondary" onclick={clearSelection}>Clear</Button>
  </div>

  {#if loading}
    <div class="text-xs text-muted-foreground">Loading options…</div>
  {:else if error}
    <div class="text-xs text-destructive">{error}</div>
  {:else if options.length === 0}
    <div class="text-xs text-muted-foreground">No options found.</div>
  {:else}
    <div class="grid gap-2 sm:grid-cols-2">
      {#each options as option (option.value)}
        <button
          type="button"
          class={`rounded-md border px-3 py-2 text-left text-sm transition ${
            (multiple
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value)
              ? "border-primary bg-primary/5"
              : "border-muted"
          }`}
          onclick={() => toggleValue(option)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}

  {#if multiple && Array.isArray(value) && value.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each value as val (val)}
        <Badge variant="secondary">{options.find((opt) => opt.value === val)?.label ?? val}</Badge>
      {/each}
    </div>
  {/if}

  {#if !multiple && value}
    <div class="text-xs text-muted-foreground">Selected: {selected?.label ?? value}</div>
  {/if}
</div>
