import { Layouts } from "../lib/layouts"
import type { PanelModule } from "../lib/types"

type Data = {
  now: string
  message: string
}

const helloPanel: PanelModule<Data> = {
  id: "hello",
  title: "Hello",
  subtitle: "The smallest possible Panel.",

  query: async () => {
    return {
      now: new Date().toISOString(),
      message: "This page is defined by: query() + layout().",
    }
  },

  layout: (data) => [
    Layouts.card({ title: "Now", value: data.now }),
    Layouts.card({ title: "Message", value: data.message }),
  ],
}

export default helloPanel
