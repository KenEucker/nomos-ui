# Users Resource Default CRUD Report

## Endpoints per page

- **List (`/admin/users`)**: `GET /api/users` with `page=1` and a high `pageSize` to enable local search/sort/page size in the table.
- **Create (`/admin/users/create`)**: `POST /api/users`.
- **Edit (`/admin/users/edit?id=...`)**:
  - `GET /api/users?id={id}` to load the record.
  - `PATCH /api/users?id={id}` to save updates.
- **View (`/admin/users/view?id=...`)**: `GET /api/users?id={id}`.
- **Delete (command bar in edit)**: `DELETE /api/users?id={id}`.

## `dataKey` / `singleDataKey`

- `dataKey = "users"` is used to unwrap list responses (`data.users`).
- `singleDataKey = "user"` is used to unwrap single-record responses (`data.user`).

## List query params

The list view sends the following query params to `/api/users`:

- `page` (fixed to 1 for local table controls)
- `pageSize` (large value to include all rows for local search/sort/page size)
