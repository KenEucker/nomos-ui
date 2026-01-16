<script lang="ts">
  import type { LayoutNode, PanelAction } from "../lib/types"
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
  import { Button } from "./ui/button"
  import DataTable from "./DataTable.svelte"
  import CardGrid from "./CardGrid.svelte"
  import ErrorBox from "./ErrorBox.svelte"
  import TimeSeriesChart from "./TimeSeriesChart.svelte"
  import FormPanel from "./forms/FormPanel.svelte"
  import TabPanel from "./TabPanel.svelte"

  export let nodes: LayoutNode[] = []
  export let panelId: string
  export let onAction: (action: PanelAction, row?: Record<string, any>) => void
</script>

<div class="space-y-6">
  {#each nodes as node, idx (idx)}
    {#if node.type === "card"}
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">{node.props.title}</CardTitle>
          {#if node.props.description}
            <CardDescription>{node.props.description}</CardDescription>
          {/if}
        </CardHeader>
        <CardContent>
          <div class="text-xl font-semibold">{node.props.value}</div>
        </CardContent>
      </Card>

    {:else if node.type === "cardGrid"}
      <CardGrid cards={node.props.cards} />

    {:else if node.type === "timeSeries"}
      <Card>
        {#if node.props.title || node.props.description}
          <CardHeader>
            {#if node.props.title}
              <CardTitle>{node.props.title}</CardTitle>
            {/if}
            {#if node.props.description}
              <CardDescription>{node.props.description}</CardDescription>
            {/if}
          </CardHeader>
        {/if}
        <CardContent>
          <TimeSeriesChart data={node.props.data} />
        </CardContent>
      </Card>

    {:else if node.type === "errorBox"}
      <ErrorBox
        title={node.props.title}
        message={node.props.message}
        details={node.props.details}
        retryLabel={node.props.retryLabel ?? "Retry"}
        onRetry={node.props.onRetry}
      />

    {:else if node.type === "form"}
      <FormPanel
        id={node.props.id}
        title={node.props.title}
        description={node.props.description}
        schema={node.props.schema}
        fields={node.props.fields}
        submitLabel={node.props.submitLabel ?? "Save"}
        initialValues={node.props.initialValues ?? {}}
        onSubmit={node.props.onSubmit}
      />

    {:else if node.type === "table"}
      <DataTable
        tableIdPrefix={`${panelId}:table`}
        id={node.props.id}
        title={node.props.title}
        description={node.props.description}
        columns={node.props.columns}
        rows={node.props.rows}
        emptyMessage={node.props.emptyMessage}
        dataKey={node.props.dataKey}
        rowIdKey={node.props.rowIdKey}
        rowActions={node.props.rowActions}
        page={node.props.page}
        pageSize={node.props.pageSize}
        total={node.props.total}
        loading={node.props.loading}
        onQueryChange={node.props.onQueryChange}
        onRowAction={(action, row) => onAction(action, row)}
      />

    {:else if node.type === "tabs"}
      <Card>
        <CardContent>
          <TabPanel
            tabs={node.props.tabs.map((tab) => ({ id: tab.id, label: tab.label }))}
            queryParam={node.props.queryParam}
            let:activeId
          >
            {#each node.props.tabs as tab (tab.id)}
              {#if tab.id === activeId}
                <svelte:self nodes={tab.content} {panelId} {onAction} />
              {/if}
            {/each}
          </TabPanel>
        </CardContent>
      </Card>

    {:else if node.type === "section"}
      <section class="space-y-3">
        <div>
          <h2 class="text-lg font-semibold">{node.props.title}</h2>
          {#if node.props.description}
            <p class="text-sm text-muted-foreground">{node.props.description}</p>
          {/if}
        </div>

        <div class="space-y-6">
          <svelte:self nodes={node.props.children} {panelId} {onAction} />
        </div>
      </section>
    {/if}
  {/each}
</div>
