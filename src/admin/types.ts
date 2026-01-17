export type QueryState = {
  page: number
  pageSize: number
  search?: string
  sort?: { key: string; dir: "asc" | "desc" }
}

export type PanelCtx = {
  url: string
  params: Record<string, string>
  query: Record<string, string | string[]>
  state: QueryState
}

export type LinkAction = {
  type: "link"
  label: string
  href: string
  icon?: string
}

export type MethodAction = {
  type: "method"
  label: string
  endpoint: string
  method?: "POST" | "PUT" | "PATCH" | "DELETE"
  payload?: (ctx: PanelCtx, data: Record<string, any>) => Record<string, any>
  confirm?: { title: string; body?: string }
  after?: "refresh" | "navigate"
  toast?: { success?: string; error?: string }
}

export type ActionDescriptor = LinkAction | MethodAction

export type ColumnDef = {
  key: string
  label: string
  sortable?: boolean
}

export type FieldDef = {
  name: string
  label: string
  type: "text" | "email" | "number" | "textarea"
  placeholder?: string
}

export type RowsNode = {
  type: "rows"
  props: {
    nodes: LayoutNode[]
  }
}

export type ColumnsNode = {
  type: "columns"
  props: {
    columns: Array<{ span?: number; nodes: LayoutNode[] }>
  }
}

export type TabsNode = {
  type: "tabs"
  props: {
    tabs: Array<{ key: string; label: string; nodes: LayoutNode[] }>
  }
}

export type CardNode = {
  type: "card"
  props: {
    title?: string
    description?: string
    nodes: LayoutNode[]
  }
}

export type TableNode = {
  type: "table"
  props: {
    key: string
    rowsKey: string
    columns: ColumnDef[]
    paginationKey?: string
  }
}

export type FormNode = {
  type: "form"
  props: {
    key: string
    fields: FieldDef[]
    submit: MethodAction
  }
}

export type FieldsetNode = {
  type: "fieldset"
  props: {
    title?: string
    nodes: LayoutNode[]
  }
}

export type TextNode = {
  type: "text"
  props: {
    value?: string
    valueKey?: string
  }
}

export type StatNode = {
  type: "stat"
  props: {
    label: string
    valueKey: string
  }
}

export type LayoutNode =
  | RowsNode
  | ColumnsNode
  | TabsNode
  | CardNode
  | TableNode
  | FormNode
  | FieldsetNode
  | TextNode
  | StatNode

export type PanelModule = {
  id: string
  title: string
  subtitle?: string
  query: (ctx: PanelCtx) => Promise<Record<string, any>> | Record<string, any>
  layout: (data: Record<string, any>, ctx: PanelCtx) => LayoutNode[]
  commandBar: (ctx: PanelCtx, data: Record<string, any>) => ActionDescriptor[]
}
