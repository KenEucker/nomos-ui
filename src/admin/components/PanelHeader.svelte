<script lang="ts">
  export let title: string
  export let subtitle: string | undefined = undefined
</script>

<header class="rounded-xl border bg-card p-6">
  <h1 class="text-2xl font-semibold text-foreground">{title}</h1>
  {#if subtitle}
    <p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>
  {/if}
</header>
