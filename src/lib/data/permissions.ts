export type PermissionSeed = {
  id: string
  name: string
  description: string
}

export const PERMISSIONS: PermissionSeed[] = [
  { id: "users.read", name: "Users: Read", description: "View user records." },
  { id: "users.write", name: "Users: Write", description: "Create and update users." },
  { id: "roles.read", name: "Roles: Read", description: "View role assignments." },
  { id: "roles.write", name: "Roles: Write", description: "Create and update roles." },
  {
    id: "permissions.read",
    name: "Permissions: Read",
    description: "View permission policies.",
  },
  {
    id: "permissions.write",
    name: "Permissions: Write",
    description: "Create and update permissions.",
  },
  {
    id: "projects.read",
    name: "Projects: Read",
    description: "Access project information.",
  },
  {
    id: "projects.write",
    name: "Projects: Write",
    description: "Create and update projects.",
  },
]
