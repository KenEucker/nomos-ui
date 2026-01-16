<script lang="ts">
  import type { LayoutNode, PanelAction } from "../lib/types"
  import PanelNodes from "./PanelNodes.svelte"
  import ErrorBox from "./ErrorBox.svelte"

  export let title: string
  export let subtitle: string | undefined
  export let error: string | null = null
  export let nodes: LayoutNode[] = []
  export let panelId: string = "panel"
  export let onAction: (action: PanelAction, row?: Record<string, any>) => void = () => {}
</script>

<div class="mx-auto max-w-5xl p-6 space-y-6">
  <header class="space-y-1">
    <h1 class="text-2xl font-bold">{title}</h1>
    {#if subtitle}
      <p class="text-muted-foreground">{subtitle}</p>
    {/if}
  </header>

  {#if error}
    <ErrorBox title="Panel error" message={error} />
  {:else}
    <PanelNodes nodes={nodes} {panelId} {onAction} />
  {/if}
</div>
