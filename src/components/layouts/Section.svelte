<script lang="ts">
  import { Separator } from "../ui/separator"

  export let title: string
  export let description: string | undefined
  export let separated: boolean = false
</script>

<section class="space-y-3">
  <header class="space-y-1">
    <h2 class="text-lg font-semibold leading-none">{title}</h2>
    {#if description}
      <p class="text-sm text-muted-foreground">{description}</p>
    {/if}
  </header>

  {#if separated}
    <Separator />
  {/if}

  <div class="space-y-6">
    <slot />
  </div>
</section>
