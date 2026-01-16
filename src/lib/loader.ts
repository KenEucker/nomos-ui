// src/lib/loader.ts
import type { PanelModule } from "./types"

/**
 * Client/SSR-compatible panel loader.
 * Panels live under src/pages/*.panel.ts in your current setup.
 */
const panelImports = import.meta.glob("../pages/**/*.panel.ts")

export const loadPanelById = async (id: string): Promise<PanelModule<any>> => {
  // naive scan (fine for now). Later we can build an index.
  for (const [, loader] of Object.entries(panelImports)) {
    const mod = (await (loader as any)()) as { default?: PanelModule<any> }
    const panel = mod.default
    if (panel?.id === id) return panel
  }

  throw new Error(`Unknown panelId "${id}"`)
}
