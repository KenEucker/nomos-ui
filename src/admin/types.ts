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
  hideOnMobile?: boolean
}

export type FieldDef = {
  name: string
  label: string
  type:
    | "text"
    | "textarea"
    | "email"
    | "password"
    | "number"
    | "checkbox"
    | "select"
    | "multiselect"
    | "date"
  placeholder?: string
  helperText?: string
  options?: Array<{ value: string; label: string }>
  required?: boolean
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
    title?: string
    description?: string
    rowsKey: string
    columns: ColumnDef[]
    paginationKey?: string
    serverSide?: boolean
    rowIdKey?: string
    enableEdit?: boolean
    saveEndpoint?: string
    saveMethod?: "POST" | "PUT" | "PATCH"
    searchable?: boolean
    searchPlaceholder?: string
  }
}

export type FieldsetNode = {
  type: "fieldset"
  props: {
    title?: string
    nodes: LayoutNode[]
  }
}

export type FormNode = {
  type: "form"
  props: {
    id: string
    title?: string
    description?: string
    schema?: unknown
    fields: FieldDef[]
    submitLabel?: string
    submitEndpoint: string
    submitMethod?: "POST" | "PUT" | "PATCH"
    initialValuesKey?: string
    after?: "refresh" | "navigate"
    redirectTo?: string
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

export type HeaderNode = {
  type: "header"
  props: {
    title: string
    subtitle?: string
  }
}

export type LayoutNode =
  | RowsNode
  | ColumnsNode
  | CardNode
  | TableNode
  | FieldsetNode
  | TextNode
  | StatNode
  | HeaderNode
  | FormNode

export type PanelModule = {
  id: string
  title: string
  subtitle?: string
  query: (ctx: PanelCtx) => Promise<Record<string, any>> | Record<string, any>
  layout: (data: Record<string, any>, ctx: PanelCtx) => LayoutNode[]
  commandBar: (ctx: PanelCtx, data: Record<string, any>) => ActionDescriptor[]
}
