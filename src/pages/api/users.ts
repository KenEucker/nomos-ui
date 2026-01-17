import type { APIRoute } from "astro";
import { listUsers, updateUser } from "../../services/users";

export const GET: APIRoute = async ({ url }) => {
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";
  const sort = url.searchParams.get("sort") ?? "";

  // TODO: fetch from DB, file, etc.
  const [sortKey, sortDir] = sort.includes(":") ? sort.split(":") : [sort, ""];
  const resolvedSortKey = sortKey ? sortKey.replace(/^-/, "") : null;
  const resolvedSortDir = sortKey.startsWith("-") ? "desc" : sortDir || "asc";
  const result = await listUsers({
    page,
    pageSize,
    search,
    sortKey: resolvedSortKey as any,
    sortDir: resolvedSortDir === "desc" ? "desc" : "asc",
  });
  const { items, total } = result;

  return new Response(
    JSON.stringify({ data: { users: items }, meta: { total } }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as {
    id?: string;
    patch?: Record<string, any>;
  };
  if (!payload.id || !payload.patch) {
    return new Response(JSON.stringify({ ok: false, error: "Missing id or patch" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const updated = await updateUser(payload.id, payload.patch);
  if (!updated) {
    return new Response(JSON.stringify({ ok: false, error: "User not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, user: updated }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
