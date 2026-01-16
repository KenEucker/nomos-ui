import { z } from "zod"
import { Layouts } from "../lib/layouts"
import type { PanelModule } from "../lib/types"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
})

type Data = {
  now: string
}

const indexPanel: PanelModule<Data> = {
  id: "index",
  title: "Welcome back",
  subtitle: "Sign in to continue to the admin console.",
  schema: loginSchema,

  load: async () => ({ now: new Date().toISOString() }),

  layout: (_data, ctx) => [
    Layouts.form({
      id: "login",
      title: "Login",
      description: "Enter your Nomos credentials.",
      schema: loginSchema,
      submitLabel: "Sign in",
      fields: [
        { name: "email", label: "Email", type: "email", placeholder: "you@nomos.io" },
        { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
      ],
      onSubmit: async () => ctx?.notify?.("Signed in", "success"),
    }),

    Layouts.cardGrid({
      cards: [
        { title: "Diagnostics", value: "Runtime" as const, description: "System health", href: "/diagnostics" },
        { title: "Users", value: "Directory" as const, description: "People & teams", href: "/users" },
        { title: "Settings", value: "Workspace" as const, description: "Policies", href: "/settings" },
      ],
    }),
  ],
}

export default indexPanel
