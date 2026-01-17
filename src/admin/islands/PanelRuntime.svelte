<script lang="ts">
  import type { ActionDescriptor, MethodAction, PanelModule, PanelCtx, QueryState } from "../types"
  import { onMount } from "svelte"
  import { loadPanelById } from "../panels"
  import { buildPanelCtx, paramsFromPath, parseStateFromUrl, updateUrlWithState } from "../runtime/state"
  import { notify, toastError } from "../../lib/toast"
  import LayoutRenderer from "./LayoutRenderer.svelte"

  export let panelId: string
  export let initialData: Record<string, any> | null = null
  export let initialNodes: any[] = []
  export let initialTitle: string
  export let initialSubtitle: string | undefined

  let panel: PanelModule | null = null
  let data: Record<string, any> | null = initialData
  let nodes = initialNodes
  let actions: ActionDescriptor[] = []
  let error: string | null = null
  let loading = false
  let currentState: QueryState = parseStateFromUrl(new URL(typeof window === "undefined" ? "http://localhost" : window.location.href))

  const buildClientCtx = (): PanelCtx => {
    const url = new URL(window.location.href)
    const params = paramsFromPath(url.pathname)
    return buildPanelCtx(url, params)
  }

  const runQuery = async () => {
    if (!panel) return
    loading = true
    error = null
    try {
      const ctx = buildClientCtx()
      currentState = ctx.state
      const result = await panel.query(ctx)
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("Panel query must return a keyed data bag")
      }
      data = result
      nodes = panel.layout(result, ctx)
      actions = panel.commandBar(ctx, result)
    } catch (err) {
      error = err instanceof Error ? err.message : "Query failed"
      toastError("Panel query failed", error)
    } finally {
      loading = false
    }
  }

  const executeMethodAction = async (action: MethodAction, payloadOverride?: Record<string, any>) => {
    if (action.confirm) {
      const confirmed = window.confirm(`${action.confirm.title}\n${action.confirm.body ?? ""}`)
      if (!confirmed) return
    }

    loading = true
    error = null
    try {
      const ctx = buildClientCtx()
      const payload = payloadOverride ?? action.payload?.(ctx, data ?? {})
      const response = await fetch(action.endpoint, {
        method: action.method ?? "POST",
        headers: {
          "content-type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      if (action.toast?.success) {
        notify(action.toast.success, "success")
      }

      if (action.after === "navigate" && action.endpoint) {
        window.location.href = action.endpoint
        return
      }

      await runQuery()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed"
      toastError(action.toast?.error ?? action.label, message)
    } finally {
      loading = false
    }
  }

  const handleAction = async (action: ActionDescriptor) => {
    if (action.type === "link") {
      window.location.href = action.href
      return
    }
    await executeMethodAction(action)
  }

  const handleFormAction = async (action: MethodAction, payload: Record<string, any>) => {
    await executeMethodAction(action, payload)
  }

  const handleStateChange = (next: QueryState) => {
    const url = updateUrlWithState(new URL(window.location.href), next)
    window.history.replaceState({}, "", url.toString())
    runQuery()
  }

  const init = async () => {
    try {
      panel = loadPanelById(panelId)
      const ctx = buildClientCtx()
      currentState = ctx.state
      if (!data) {
        data = await panel.query(ctx)
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Panel query must return a keyed data bag")
      }
      nodes = panel.layout(data, ctx)
      actions = panel.commandBar(ctx, data)
    } catch (err) {
      error = err instanceof Error ? err.message : "Panel load failed"
    }
  }

  onMount(() => {
    init()
  })
</script>

<div class="space-y-6">
  <header class="rounded-xl border bg-card p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">{initialTitle}</h1>
        {#if initialSubtitle}
          <p class="mt-1 text-sm text-muted-foreground">{initialSubtitle}</p>
        {/if}
      </div>
      <div class="flex flex-wrap gap-2">
        {#each actions as action (action.label)}
          {#if action.type === "link"}
            <button
              class="rounded-md border px-4 py-2 text-sm font-medium"
              type="button"
              on:click={() => handleAction(action)}
            >
              {action.label}
            </button>
          {:else}
            <button
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              type="button"
              on:click={() => handleAction(action)}
            >
              {action.label}
            </button>
          {/if}
        {/each}
      </div>
    </div>
  </header>

  {#if error}
    <div class="rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive">
      {error}
    </div>
  {:else}
    {#if loading}
      <div class="text-sm text-muted-foreground">Loading...</div>
    {/if}
    <LayoutRenderer
      {nodes}
      data={data ?? {}}
      state={currentState}
      onMethodAction={handleFormAction}
      onStateChange={handleStateChange}
    />
  {/if}
</div>
