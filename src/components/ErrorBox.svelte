<script lang="ts">
  import { Button } from "./ui/button"

  export let title: string
  export let message: string
  export let details: string | undefined = undefined
  export let retryLabel: string = "Retry"
  export let onRetry: (() => void | Promise<void>) | undefined = undefined

  let showDetails = false
</script>

<div class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
  <div class="flex items-start justify-between gap-4">
    <div class="space-y-1">
      <div class="text-sm font-semibold">{title}</div>
      <div class="text-sm text-destructive/90">{message}</div>
    </div>
    {#if onRetry}
      <Button size="sm" variant="destructive" onclick={() => onRetry?.()}>{retryLabel}</Button>
    {/if}
  </div>

  {#if details}
    <button
      type="button"
      class="mt-3 text-xs uppercase tracking-wide text-destructive/70"
      onclick={() => (showDetails = !showDetails)}
    >
      {showDetails ? "Hide details" : "Show details"}
    </button>
    {#if showDetails}
      <pre class="mt-2 whitespace-pre-wrap rounded-md bg-destructive/10 p-3 text-xs text-destructive/80">
        {details}
      </pre>
    {/if}
  {/if}
</div>
