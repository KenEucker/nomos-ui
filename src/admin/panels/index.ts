import dashboardPanel from "./dashboard.panel"
import resourceListPanel from "./resource-list.panel"
import type { PanelModule } from "../types"

export const panelRegistry: Record<string, PanelModule> = {
  dashboard: dashboardPanel,
  resources: resourceListPanel,
}

export const loadPanelById = (panelId: string): PanelModule => {
  const panel = panelRegistry[panelId]
  if (!panel) {
    throw new Error(`Unknown panelId: ${panelId}`)
  }
  return panel
}
