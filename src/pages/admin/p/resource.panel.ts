import type { PanelModule } from "../../../admin/types"
import type { ResourcePanelConfig } from "../../../admin/runtime/resource-panel"
import { createResourcePanel } from "../../../admin/runtime/resource-panel"

const getConfig = (): ResourcePanelConfig | null => {
  if (typeof window === "undefined") {
    return null
  }

  return (window as unknown as { __RESOURCE_PANEL_CONFIG__?: ResourcePanelConfig })
    .__RESOURCE_PANEL_CONFIG__ ?? null
}

const fallbackPanel: PanelModule = {
  id: "resource",
  title: "Resource",
  query: async () => ({}),
  layout: () => [],
  commandBar: () => [],
}

const panel: PanelModule = (() => {
  const config = getConfig()
  if (!config) return fallbackPanel
  return createResourcePanel(config)
})()

export default panel
