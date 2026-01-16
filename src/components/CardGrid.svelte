<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
  import { Button } from "./ui/button"
  import type { PanelAction } from "../lib/types"

  export type CardGridItem = {
    title: string
    value: string | number
    description?: string
    actions?: Array<PanelAction>
    href?: string
  }

  export let cards: CardGridItem[] = []
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {#each cards as card (card.title)}
    {#if card.href}
      <a href={card.href} class="block transition hover:translate-y-0.5">
        <Card class="bg-muted/10 hover:border-primary/40">
          <CardHeader class="pb-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <CardTitle class="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                {#if card.description}
                  <CardDescription>{card.description}</CardDescription>
                {/if}
              </div>
              {#if card.actions?.length}
                <div class="flex items-center gap-2">
                  {#each card.actions as action (action.id)}
                    <Button size="sm" variant={action.variant ?? "secondary"}>
                      {action.label}
                    </Button>
                  {/each}
                </div>
              {/if}
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-semibold">{card.value}</div>
          </CardContent>
        </Card>
      </a>
    {:else}
      <Card class="bg-muted/10">
        <CardHeader class="pb-2">
          <div class="flex items-start justify-between gap-2">
            <div>
              <CardTitle class="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              {#if card.description}
                <CardDescription>{card.description}</CardDescription>
              {/if}
            </div>
            {#if card.actions?.length}
              <div class="flex items-center gap-2">
                {#each card.actions as action (action.id)}
                  <Button size="sm" variant={action.variant ?? "secondary"}>
                    {action.label}
                  </Button>
                {/each}
              </div>
            {/if}
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-semibold">{card.value}</div>
        </CardContent>
      </Card>
    {/if}
  {/each}
</div>
