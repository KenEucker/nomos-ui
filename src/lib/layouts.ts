import type {
  CardGridNode,
  CardNode,
  ErrorBoxNode,
  FormNode,
  LayoutNode,
  SectionNode,
  TabPanelNode,
  TableNode,
  TimeSeriesNode,
} from "./types"

export const Layouts = {
  card: (props: CardNode["props"]): CardNode => ({
    type: "card",
    props,
  }),

  cardGrid: (props: CardGridNode["props"]): CardGridNode => ({
    type: "cardGrid",
    props,
  }),

  table: (props: TableNode["props"]): TableNode => ({
    type: "table",
    props,
  }),

  section: (props: Omit<SectionNode["props"], "children">, children: LayoutNode[]): SectionNode => ({
    type: "section",
    props: { ...props, children },
  }),

  errorBox: (props: ErrorBoxNode["props"]): ErrorBoxNode => ({
    type: "errorBox",
    props,
  }),

  timeSeries: (props: TimeSeriesNode["props"]): TimeSeriesNode => ({
    type: "timeSeries",
    props,
  }),

  form: (props: FormNode["props"]): FormNode => ({
    type: "form",
    props,
  }),

  tabs: (props: TabPanelNode["props"]): TabPanelNode => ({
    type: "tabs",
    props,
  }),
}
