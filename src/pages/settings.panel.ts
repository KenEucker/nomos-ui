import { z } from "zod"
import { Layouts } from "../lib/layouts"
import type { PanelModule } from "../lib/types"

const generalSchema = z.object({
  workspace: z.string().min(2, "Workspace name required"),
  region: z.string().min(1, "Region required"),
})

const securitySchema = z.object({
  mfa: z.string().min(1, "Select MFA policy"),
  session: z.string().min(1, "Session length required"),
})

const notificationsSchema = z.object({
  digest: z.string().min(1, "Choose a digest schedule"),
})

type Data = {
  workspace: string
}

const settingsPanel: PanelModule<Data> = {
  id: "settings",
  title: "Settings",
  subtitle: "Configure workspace defaults.",

  load: async () => ({ workspace: "Nomos Labs" }),

  layout: (data, ctx) => [
    Layouts.tabs({
      id: "settings-tabs",
      queryParam: "tab",
      tabs: [
        {
          id: "general",
          label: "General",
          content: [
            Layouts.form({
              id: "general-settings",
              title: "Workspace",
              description: "Core workspace metadata.",
              schema: generalSchema,
              submitLabel: "Save workspace",
              initialValues: { workspace: data.workspace, region: "us-east-1" },
              fields: [
                { name: "workspace", label: "Workspace name", type: "text" },
                { name: "region", label: "Region", type: "text" },
              ],
              onSubmit: async () => ctx?.notify?.("Workspace saved", "success"),
            }),
          ],
        },
        {
          id: "security",
          label: "Security",
          content: [
            Layouts.form({
              id: "security-settings",
              title: "Authentication",
              description: "Policies for access control.",
              schema: securitySchema,
              submitLabel: "Save security",
              initialValues: { mfa: "Required", session: "12h" },
              fields: [
                { name: "mfa", label: "MFA policy", type: "text" },
                { name: "session", label: "Session length", type: "text" },
              ],
              onSubmit: async () => ctx?.notify?.("Security updated", "success"),
            }),
            Layouts.errorBox({
              title: "Policy conflict",
              message: "New policy overlaps with SSO enforcement.",
              details: "Check policy group: sso-default (priority 1).",
            }),
          ],
        },
        {
          id: "notifications",
          label: "Notifications",
          content: [
            Layouts.form({
              id: "notification-settings",
              title: "Email digest",
              description: "Keep stakeholders informed.",
              schema: notificationsSchema,
              submitLabel: "Save notification",
              initialValues: { digest: "Weekly" },
              fields: [{ name: "digest", label: "Digest schedule", type: "text" }],
              onSubmit: async () => ctx?.notify?.("Notifications updated", "success"),
            }),
          ],
        },
      ],
    }),
  ],
}

export default settingsPanel
