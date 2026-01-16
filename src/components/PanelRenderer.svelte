<script lang="ts">
  import type { LayoutNode } from "../lib/types"
  import Section from "./layouts/Section.svelte"

  // shadcn-svelte components (installed under /src/components/ui)
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
  } from "./ui/table"

  export let title: string
  export let subtitle: string | undefined
  export let error: string | null = null
  export let nodes: LayoutNode[] = []
</script>

<div class="mx-auto max-w-5xl p-6 space-y-6">
  <header class="space-y-1">
    <h1 class="text-2xl font-bold">{title}</h1>
    {#if subtitle}
      <p class="text-muted-foreground">{subtitle}</p>
    {/if}
  </header>

  {#if error}
    <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      {error}
    </div>
  {:else}
    <div class="space-y-6">
      {#each nodes as node (node)}
        {#if node.type === "card"}
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">
                {node.props.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-xl font-semibold">{node.props.value}</div>
              {#if node.props.description}
                <p class="mt-1 text-sm text-muted-foreground">{node.props.description}</p>
              {/if}
            </CardContent>
          </Card>

        {:else if node.type === "table"}
          <Card>
            <CardHeader>
              <CardTitle>{node.props.title}</CardTitle>
              {#if node.props.description}
                <CardDescription>{node.props.description}</CardDescription>
              {/if}
            </CardHeader>
            <CardContent class="pt-0">
              <div class="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {#each node.props.columns as col (col.key)}
                        <TableHead>{col.label}</TableHead>
                      {/each}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {#if node.props.rows.length === 0}
                      <TableRow>
                        <TableCell colspan={node.props.columns.length} class="text-muted-foreground">
                          {node.props.emptyMessage ?? "No data."}
                        </TableCell>
                      </TableRow>
                    {:else}
                      {#each node.props.rows as row, idx (idx)}
                        <TableRow>
                          {#each node.props.columns as col (col.key)}
                            <TableCell>{String(row[col.key] ?? "")}</TableCell>
                          {/each}
                        </TableRow>
                      {/each}
                    {/if}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        {:else if node.type === "section"}
          <Section title={node.props.title} description={node.props.description} separated={false}>
            <div class="space-y-6">
              {#each node.props.children as child (child)}
                {#if child.type === "card"}
                  <Card>
                    <CardHeader class="pb-2">
                      <CardTitle class="text-sm font-medium text-muted-foreground">
                        {child.props.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div class="text-xl font-semibold">{child.props.value}</div>
                      {#if child.props.description}
                        <p class="mt-1 text-sm text-muted-foreground">{child.props.description}</p>
                      {/if}
                    </CardContent>
                  </Card>

                {:else if child.type === "table"}
                  <Card>
                    <CardHeader>
                      <CardTitle>{child.props.title}</CardTitle>
                      {#if child.props.description}
                        <CardDescription>{child.props.description}</CardDescription>
                      {/if}
                    </CardHeader>
                    <CardContent class="pt-0">
                      <div class="rounded-md border overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {#each child.props.columns as col (col.key)}
                                <TableHead>{col.label}</TableHead>
                              {/each}
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {#if child.props.rows.length === 0}
                              <TableRow>
                                <TableCell colspan={child.props.columns.length} class="text-muted-foreground">
                                  {child.props.emptyMessage ?? "No data."}
                                </TableCell>
                              </TableRow>
                            {:else}
                              {#each child.props.rows as row, idx (idx)}
                                <TableRow>
                                  {#each child.props.columns as col (col.key)}
                                    <TableCell>{String(row[col.key] ?? "")}</TableCell>
                                  {/each}
                                </TableRow>
                              {/each}
                            {/if}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                {/if}
              {/each}
            </div>
          </Section>
        {/if}
      {/each}
    </div>
  {/if}
</div>
