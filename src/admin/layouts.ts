import type {
  CardNode,
  ColumnsNode,
  FieldsetNode,
  FormNode,
  RowsNode,
  LayoutNode,
  StatNode,
  TableNode,
  TabsNode,
  TextNode,
} from "./types"

export const Layouts = {
  rows: (nodes: LayoutNode[]): RowsNode => ({
    type: "rows",
    props: { nodes },
  }),

  columns: (columns: ColumnsNode["props"]["columns"]): ColumnsNode => ({
    type: "columns",
    props: { columns },
  }),

  tabs: (tabs: TabsNode["props"]["tabs"]): TabsNode => ({
    type: "tabs",
    props: { tabs },
  }),

  card: (props: CardNode["props"]): CardNode => ({
    type: "card",
    props,
  }),

  table: (props: TableNode["props"]): TableNode => ({
    type: "table",
    props,
  }),

  form: (props: FormNode["props"]): FormNode => ({
    type: "form",
    props,
  }),

  fieldset: (props: FieldsetNode["props"]): FieldsetNode => ({
    type: "fieldset",
    props,
  }),

  text: (props: TextNode["props"]): TextNode => ({
    type: "text",
    props,
  }),

  stat: (props: StatNode["props"]): StatNode => ({
    type: "stat",
    props,
  }),
}
