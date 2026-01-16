import type { ZodSchema } from "zod"

export type PanelCtx = {
  // Minimal for now. Expand later (auth, params, api client, etc.)
  request: Request
  url: URL
}

export type PanelActionVariant = "default" | "secondary" | "ghost" | "destructive"

export type PanelActionContext<TData = unknown> = {
  data: TData
  updateData: (updater: (current: TData) => TData) => void
  notify: (message: string, tone?: "success" | "error" | "info") => void
  row?: Record<string, any>
  values?: Record<string, any>
}

export type PanelAction<TData = unknown> = {
  id: string
  label: string
  variant?: PanelActionVariant
  run?: (ctx: PanelActionContext<TData>) => Promise<void> | void
}

export type PanelRenderContext<TData = unknown> = {
  mode?: "page" | "embed" | "modal"
  parentPanelId?: string
  close?: () => void
  params?: Record<string, string>
  url?: URL | string
  updateData?: (updater: (current: TData) => TData) => void
  notify?: (message: string, tone?: "success" | "error" | "info") => void
}

export type PanelModule<TData = unknown> = {
  id: string
  title: string
  subtitle?: string
  schema?: ZodSchema
  load?: (ctx: PanelCtx) => Promise<TData>
  actions?: Array<PanelAction<TData>>
  layout: (data: TData, ctx?: PanelRenderContext<TData>) => LayoutNode[]
}

export type CardNode = {
  type: "card"
  props: {
    title: string
    value: string | number
    description?: string
  }
}

export type CardGridNode = {
  type: "cardGrid"
  props: {
    cards: Array<CardNode["props"] & { actions?: Array<PanelAction>; href?: string }>
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
    rowActions?: Array<PanelAction>
    page?: number
    pageSize?: number
    total?: number
    loading?: boolean
    onQueryChange?: (query: {
      page: number
      pageSize: number
      search: string
      sortKey: string | null
      sortDir: "asc" | "desc"
    }) => Promise<void> | void
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

export type ErrorBoxNode = {
  type: "errorBox"
  props: {
    title: string
    message: string
    details?: string
    retryLabel?: string
    onRetry?: () => void | Promise<void>
  }
}

export type TimeSeriesNode = {
  type: "timeSeries"
  props: {
    title?: string
    description?: string
    data: Array<{ date: string; value: number }>
  }
}

export type FormNode = {
  type: "form"
  props: {
    id: string
    title?: string
    description?: string
    schema: ZodSchema
    submitLabel?: string
    fields: Array<{
      name: string
      label: string
      type: "text" | "textarea" | "email" | "password" | "relation" | "multiselect" | "lookup"
      placeholder?: string
      helperText?: string
      loadOptions?: (search: string) => Promise<Array<{ value: string; label: string }>>
      options?: Array<{ value: string; label: string }>
      lookup?: {
        title: string
        description?: string
        submitLabel?: string
        fields: Array<{ name: string; label: string; type?: "text" | "email" }>
        onLookup: (values: Record<string, any>) => Promise<Record<string, any>>
        applyResult: (result: Record<string, any>) => Record<string, any>
      }
    }>
    initialValues?: Record<string, any>
    onSubmit: (values: Record<string, any>) => Promise<void> | void
  }
}

export type TabPanelNode = {
  type: "tabs"
  props: {
    id: string
    queryParam?: string
    tabs: Array<{
      id: string
      label: string
      content: LayoutNode[]
    }>
  }
}

export type LayoutNode =
  | CardNode
  | CardGridNode
  | TableNode
  | SectionNode
  | ErrorBoxNode
  | TimeSeriesNode
  | FormNode
  | TabPanelNode

export type ColumnDef = {
  key: string
  label: string
  sortable?: boolean
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

export type ResourceEndpoints = {
  list: string
  get: string
  create: string
  update: string
  delete: string
}

export type ResourceLabels =
  | {
      label?: string
      labelPlural?: string
      labels?: never
    }
  | {
      label?: never
      labelPlural?: never
      labels: {
        label: string
        labelPlural: string
      }
    }

export type ResourceMenu = {
  group?: string
  order?: number
  icon?: string
}

export type ResourceListConfig = {
  columns?: ColumnDef[]
  defaultSort?: {
    key: string
    direction: "asc" | "desc"
  }
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
}

export type ResourceFormConfig = {
  fields?: FieldDef[]
}

export type ResourceInput = ResourceLabels & {
  identity: string
  endpoints: ResourceEndpoints
  menu?: ResourceMenu
  list?: ResourceListConfig
  form?: ResourceFormConfig
  requiredPermission?: string
  dataKey?: string
  singleDataKey?: string
}