<script lang="ts">
  import type { ActionDescriptor, LayoutNode, QueryState } from "../types"
  import LayoutRenderer from "./LayoutRenderer.svelte"

  export let tabs: Array<{ key: string; label: string; nodes: LayoutNode[] }> = []
  export let data: Record<string, any> = {}
  export let state: QueryState
  export let onMethodAction: (action: ActionDescriptor, payload?: Record<string, any>) => void
  export let onStateChange: (state: QueryState) => void

  let activeKey = tabs[0]?.key

  const setActive = (key: string) => {
    activeKey = key
  }
</script>

<div class="space-y-4">
  <div class="flex flex-wrap gap-2 border-b">
    {#each tabs as tab (tab.key)}
      <button
        class={`border-b-2 px-3 py-2 text-sm font-medium ${
          tab.key === activeKey
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground"
        }`}
        type="button"
        on:click={() => setActive(tab.key)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  {#each tabs as tab (tab.key)}
    {#if tab.key === activeKey}
      <LayoutRenderer
        nodes={tab.nodes}
        {data}
        {state}
        {onMethodAction}
        {onStateChange}
      />
    {/if}
  {/each}
</div>
