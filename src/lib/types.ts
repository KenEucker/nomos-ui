export type PanelCtx = {
  // Minimal for now. Expand later (auth, params, api client, etc.)
  request: Request
  url: URL
}

export type PanelModule<TData = unknown> = {
  id: string
  title: string
  subtitle?: string

  query: (ctx: PanelCtx) => Promise<TData>
  layout: (data: TData, ctx: PanelCtx) => LayoutNode[]
}

export type CardNode = {
  type: "card"
  props: {
    title: string
    value: string | number
    description?: string
  }
}

export type TableNode = {
  type: "table"
  props: {
    id?: string
    title: string
    description?: string
    columns: Array<{ key: string; label: string }>
    rows: Array<Record<string, string | number | boolean | null | undefined>>
    emptyMessage?: string
    dataKey?: string
    rowIdKey?: string
  }
}

export type SectionNode = {
  type: "section"
  props: {
    title: string
    description?: string
    children: LayoutNode[]
  }
}

export type LayoutNode = CardNode | TableNode | SectionNode
