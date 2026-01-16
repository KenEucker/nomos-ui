import type { CardNode, LayoutNode, SectionNode, TableNode } from "./types"

export const Layouts = {
  card: (props: CardNode["props"]): CardNode => ({
    type: "card",
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
}
