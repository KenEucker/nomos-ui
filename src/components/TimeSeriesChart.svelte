<script lang="ts">
  export let data: Array<{ date: string; value: number }> = []
  export let height = 160

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })

  $: values = data.map((point) => point.value)
  $: maxValue = Math.max(1, ...values)
  $: minValue = Math.min(0, ...values)

  const padding = { top: 16, right: 12, bottom: 24, left: 12 }

  $: width = 520
  $: viewWidth = width - padding.left - padding.right
  $: viewHeight = height - padding.top - padding.bottom

  const toX = (index: number) =>
    padding.left + (viewWidth / Math.max(1, data.length - 1)) * index
  const toY = (value: number) =>
    padding.top + (1 - (value - minValue) / Math.max(1, maxValue - minValue)) * viewHeight

  $: path =
    data.length === 0
      ? ""
      : data
          .map((point, index) => `${index === 0 ? "M" : "L"}${toX(index)},${toY(point.value)}`)
          .join(" ")
</script>

<div class="w-full">
  <svg viewBox={`0 0 ${width} ${height}`} class="w-full">
    <defs>
      <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="oklch(0.646 0.222 41.116)" stop-opacity="0.35" />
        <stop offset="100%" stop-color="oklch(0.646 0.222 41.116)" stop-opacity="0" />
      </linearGradient>
    </defs>

    <rect
      x="0"
      y="0"
      width={width}
      height={height}
      rx="12"
      class="fill-muted/10"
    />

    {#if data.length}
      <path d={path} fill="none" stroke="oklch(0.646 0.222 41.116)" stroke-width="2" />
      <path
        d={`${path} L ${toX(data.length - 1)},${height - padding.bottom} L ${toX(0)},${height - padding.bottom} Z`}
        fill="url(#line-fill)"
      />

      {#each data as point, index (point.date)}
        <circle cx={toX(index)} cy={toY(point.value)} r="3" fill="oklch(0.646 0.222 41.116)" />
      {/each}

      {#each data as point, index (point.date)}
        {#if index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 4) === 0}
          <text
            x={toX(index)}
            y={height - 6}
            text-anchor="middle"
            class="fill-muted-foreground text-[10px]"
          >
            {formatDate(point.date)}
          </text>
        {/if}
      {/each}
    {:else}
      <text x={width / 2} y={height / 2} text-anchor="middle" class="fill-muted-foreground text-sm">
        No data
      </text>
    {/if}
  </svg>
</div>
