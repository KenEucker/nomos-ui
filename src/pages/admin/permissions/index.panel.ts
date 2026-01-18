import { Layouts } from "$lib/layouts"
import type { FieldDef, PanelModule, RowAction } from "$lib/types"
import { permissionsResource } from "./permissions.resource"

const title = "Permissions"
const subtitle = "Define the actions available across the platform."
const basePath = "/admin/permissions"

const resolveRowActions = (): RowAction[] => {
  const config = permissionsResource.list?.rowActions
  const actions: RowAction[] = []
  if (config?.view ?? true) {
    actions.push({ id: "view", label: "View", variant: "secondary", intent: "permissions.read" })
  }
  if (config?.edit ?? true) {
    actions.push({ id: "edit", label: "Edit", variant: "secondary", intent: "permissions.update" })
  }
  if (config?.delete ?? true) {
    actions.push({ id: "delete", label: "Delete", variant: "destructive", intent: "permissions.update" })
  }
  return actions
}

const buildAssignmentFields = (
  permissions: Array<{ id: string; name: string }>,
  roles: Array<{ id: string; name: string }>
): FieldDef[] => [
  {
    name: "roleId",
    label: "Role",
    type: "select",
    options: roles.map((role) => ({ value: role.id, label: role.name })),
    required: true,
  },
  {
    name: "permissionId",
    label: "Permission",
    type: "select",
    options: permissions.map((permission) => ({ value: permission.id, label: permission.name })),
    required: true,
  },
]

const permissionsPanel: PanelModule = {
  id: "permissions",
  title,
  subtitle,

  query: async (ctx) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", "250")

    const [permissionsResponse, rolesResponse] = await Promise.all([
      fetch(new URL(`/api/permissions?${params.toString()}`, ctx.url)).then((res) => res.json()),
      fetch(new URL(`/api/roles?${params.toString()}`, ctx.url)).then((res) => res.json()),
    ])

    return {
      permissions: permissionsResponse.data?.permissions ?? [],
      roles: rolesResponse.data?.roles ?? [],
      meta: {
        total: permissionsResponse.meta?.total ?? 0,
        page: 1,
        pageSize: 250,
      },
    }
  },

  commandBar: () => [
    {
      type: "link",
      label: "Create Permission",
      href: `${basePath}/create`,
      intent: "permissions.update",
    },
  ],

  layout: (data) => [
    Layouts.rows([
      Layouts.header({
        title,
        subtitle,
        requiredIntent: "permissions.read",
      }),
      Layouts.table({
        key: "permissions",
        title: "Permissions",
        description: "Showing permissions from the /api/permissions endpoint.",
        rowsKey: "permissions",
        paginationKey: "meta",
        enableEdit: false,
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "description", label: "Description", sortable: true, hideOnMobile: true },
        ],
        rowActions: resolveRowActions(),
        rowActionBasePath: basePath,
        rowActionDeleteEndpoint: permissionsResource.endpoints.delete,
        requiredIntent: "permissions.read",
      }),
      Layouts.form({
        id: "permission-assignment",
        title: "Assign permission to role",
        description: "Attach a permission to a role for access control.",
        fields: buildAssignmentFields(data.permissions ?? [], data.roles ?? []),
        submitLabel: "Assign permission",
        submitEndpoint: "/api/role-permissions",
        submitMethod: "POST",
        after: "refresh",
        requiredIntent: "permissions.update",
      }),
    ]),
  ],
}

export default permissionsPanel
