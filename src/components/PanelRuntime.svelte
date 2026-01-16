<script lang="ts">
  import type { LayoutNode, PanelAction, PanelModule, PanelRenderContext } from "../lib/types"
  import { loadPanelById } from "../lib/loader"
  import { notify, toastError } from "../lib/toast"

  import { Button } from "./ui/button"
  import PanelNodes from "./PanelNodes.svelte"
  import ErrorBox from "./ErrorBox.svelte"

  export let panelId: string
  export let title: string
  export let subtitle: string | undefined

  export let initialData: any = null
  export let initialError: string | null = null
  export let context: PanelRenderContext | undefined = undefined

  let panel: PanelModule<any> | null = null
  let loading = true
  let error: string | null = initialError

  // This is the state you’ll eventually make reactive (search/sort/filter, optimistic patches, etc.)
  let data: any = initialData
  let nodes: LayoutNode[] = []
  $: containerClass =
    context?.mode === "embed"
      ? "mx-auto max-w-xl p-6 space-y-6"
      : context?.mode === "modal"
        ? "mx-auto max-w-3xl p-4 space-y-6"
        : "mx-auto max-w-5xl p-6 space-y-6"

  const computeNodes = () => {
    if (!panel || error) {
      nodes = []
      return
    }

    try {
      const fallbackUrl =
        typeof window !== "undefined" ? new URL(window.location.href) : undefined
      const renderCtx: PanelRenderContext<any> = {
        ...(context ?? { mode: "page", url: fallbackUrl }),
        updateData: (updater) => {
          data = updater(data)
          computeNodes()
        },
        notify: (message, tone) => notify(message, tone),
      }
      nodes = panel.layout.length >= 2 ? panel.layout(data, renderCtx) : panel.layout(data)
    } catch (e: any) {
      error = e?.message ?? String(e)
      nodes = []
    }
  }

  const init = async () => {
    loading = true
    try {
      panel = await loadPanelById(panelId)

      if (!data && panel.load) {
        data = await panel.load({ request: new Request(""), url: new URL(window.location.href) })
      }

      computeNodes()
    } catch (e: any) {
      error = e?.message ?? String(e)
      toastError("Panel load failed", error)
    } finally {
      loading = false
    }
  }

  $: if (panel && data && !error) computeNodes()

  const runAction = async (action: PanelAction, row?: Record<string, any>) => {
    if (!panel) return
    try {
      await action.run?.({
        data,
        row,
        updateData: (updater) => {
          data = updater(data)
          computeNodes()
        },
        notify: (message, tone) => notify(message, tone),
      })
    } catch (err: any) {
      toastError(action.label, err?.message ?? "Action failed")
    }
  }

  init()
</script>

<div class={containerClass}>
  <header class="space-y-1">
    <h1 class="text-2xl font-bold">{title}</h1>
    {#if subtitle}
      <p class="text-muted-foreground">{subtitle}</p>
    {/if}
  </header>

  {#if loading}
    <div class="text-muted-foreground">Loading…</div>
  {:else if error}
    <ErrorBox title="Panel error" message={error} />
  {:else}
    {#if panel?.actions?.length}
      <div class="flex flex-wrap items-center gap-2">
        {#each panel.actions as action (action.id)}
          <Button
            size="sm"
            variant={action.variant ?? "secondary"}
            onclick={() => runAction(action)}
          >
            {action.label}
          </Button>
        {/each}
      </div>
    {/if}

    <PanelNodes nodes={nodes} {panelId} onAction={runAction} />
  {/if}
</div>
