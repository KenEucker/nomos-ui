<script lang="ts">
  import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
  import { onMount } from "svelte"

  export type TabConfig = {
    id: string
    label: string
  }

  export let tabs: TabConfig[] = []
  export let queryParam: string | undefined = undefined

  let activeId = tabs[0]?.id

  const updateQuery = (next: string) => {
    if (!queryParam || typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.set(queryParam, next)
    window.history.replaceState({}, "", url.toString())
  }

  const setActive = (next: string) => {
    activeId = next
    updateQuery(next)
  }

  onMount(() => {
    if (!queryParam || typeof window === "undefined") return
    const url = new URL(window.location.href)
    const fromQuery = url.searchParams.get(queryParam)
    if (fromQuery && tabs.some((tab) => tab.id === fromQuery)) {
      activeId = fromQuery
    }
  })
</script>

<Tabs value={activeId} onValueChange={setActive}>
  <TabsList>
    {#each tabs as tab (tab.id)}
      <TabsTrigger value={tab.id}>{tab.label}</TabsTrigger>
    {/each}
  </TabsList>
</Tabs>

{#if activeId}
  <div class="pt-4">
    <slot {activeId} />
  </div>
{/if}
