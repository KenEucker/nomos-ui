import { PERMISSIONS } from "./permissions"

export type RoleSeed = {
  id: string
  name: string
  description: string
  permissions: string[]
}

const allPermissions = PERMISSIONS.map((permission) => permission.id)

export const ROLES: RoleSeed[] = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access to every resource.",
    permissions: allPermissions,
  },
  {
    id: "role-editor",
    name: "Editor",
    description: "Create and edit core resources.",
    permissions: ["users.read", "users.write", "roles.read", "permissions.read", "projects.read", "projects.write"],
  },
  {
    id: "role-viewer",
    name: "Viewer",
    description: "Read-only access for audits and reviews.",
    permissions: ["users.read", "roles.read", "permissions.read", "projects.read"],
  },
  {
    id: "role-support",
    name: "Support",
    description: "Helpdesk access to users and projects.",
    permissions: ["users.read", "users.write", "projects.read"],
  },
]
