<script lang="ts">
  import type { ActionDescriptor } from "../lib/types"

  export let title: string
  export let subtitle: string | undefined = undefined
  export let commands: ActionDescriptor[] = []
  export let onCommand: (command: ActionDescriptor) => void
</script>

<header class="rounded-xl border bg-card p-6">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-foreground">{title}</h1>
      {#if subtitle}
        <p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      {/if}
    </div>
    {#if commands.length}
      <div class="flex flex-wrap gap-2">
        {#each commands as command (command.label)}
          {#if command.type === "link"}
            <button
              class="rounded-md border px-4 py-2 text-sm font-medium"
              type="button"
              on:click={() => onCommand(command)}
            >
              {command.label}
            </button>
          {:else}
            <button
              class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              type="button"
              on:click={() => onCommand(command)}
            >
              {command.label}
            </button>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</header>
