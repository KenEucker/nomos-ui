import { Layouts } from "$lib/layouts"
import type { PanelModule, RowAction, FieldDef } from "$lib/types"
import { subjectsResource } from "./subjects.resource"

const title = "Subjects"
const subtitle = "Manage people and service identities."
const basePath = "/admin/subjects"

const resolveRowActions = (): RowAction[] => {
  const config = subjectsResource.list?.rowActions
  const actions: RowAction[] = []
  if (config?.view ?? true) {
    actions.push({ id: "view", label: "View", variant: "secondary", intent: "subjects.read" })
  }
  if (config?.edit ?? true) {
    actions.push({ id: "edit", label: "Edit", variant: "secondary", intent: "subjects.update" })
  }
  if (config?.delete ?? true) {
    actions.push({ id: "delete", label: "Delete", variant: "destructive", intent: "subjects.delete" })
  }
  return actions
}

const buildAssignmentFields = (subjects: Array<{ id: string; name: string }>, roles: Array<{ id: string; name: string }>): FieldDef[] => [
  {
    name: "subjectId",
    label: "Subject",
    type: "select",
    options: subjects.map((subject) => ({ value: subject.id, label: subject.name })),
    required: true,
  },
  {
    name: "roles",
    label: "Roles",
    type: "multiselect",
    options: roles.map((role) => ({ value: role.id, label: role.name })),
    helperText: "Assign one or more roles to the subject.",
  },
]

const subjectsPanel: PanelModule = {
  id: "subjects",
  title,
  subtitle,

  query: async (ctx) => {
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("pageSize", "250")

    const [subjectsResponse, rolesResponse] = await Promise.all([
      fetch(new URL(`/api/subjects?${params.toString()}`, ctx.url)).then((res) => res.json()),
      fetch(new URL(`/api/roles?${params.toString()}`, ctx.url)).then((res) => res.json()),
    ])

    return {
      subjects: subjectsResponse.data?.subjects ?? [],
      roles: rolesResponse.data?.roles ?? [],
      meta: {
        total: subjectsResponse.meta?.total ?? 0,
        page: 1,
        pageSize: 250,
      },
    }
  },

  commandBar: () => [
    { type: "link", label: "Create Subject", href: `${basePath}/create`, intent: "subjects.create" },
  ],

  layout: (data) => [
    Layouts.rows([
      Layouts.header({
        title,
        subtitle,
        requiredIntent: "subjects.read",
      }),
      Layouts.table({
        key: "subjects",
        title: "Subjects",
        description: "Showing subjects from the /api/subjects endpoint.",
        rowsKey: "subjects",
        paginationKey: "meta",
        enableEdit: false,
        columns: [
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true, hideOnMobile: true },
          { key: "level", label: "Level", sortable: true },
          { key: "roles", label: "Roles" },
        ],
        rowActions: resolveRowActions(),
        rowActionBasePath: basePath,
        rowActionDeleteEndpoint: subjectsResource.endpoints.delete,
        requiredIntent: "subjects.read",
      }),
      Layouts.form({
        id: "subject-roles",
        title: "Assign roles",
        description: "Attach roles to a subject for access control.",
        fields: buildAssignmentFields(data.subjects ?? [], data.roles ?? []),
        submitLabel: "Assign roles",
        submitEndpoint: "/api/subject-roles",
        submitMethod: "POST",
        after: "refresh",
        requiredIntent: "subjects.update",
      }),
    ]),
  ],
}

export default subjectsPanel
