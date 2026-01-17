import type { APIRoute } from "astro";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "../../services/users";

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id) {
    const user = await getUser(id);
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "User not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ data: { user } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

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

export const POST: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as Record<string, any>;
  const created = await createUser(payload);
  return new Response(JSON.stringify({ ok: true, data: { user: created } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  const payload = (await request.json().catch(() => ({}))) as {
    id?: string;
    patch?: Record<string, any>;
  };
  const idFromQuery =
    request instanceof Request ? new URL(request.url).searchParams.get("id") : null;
  const resolvedId = payload.id ?? idFromQuery ?? undefined;
  const patch = payload.patch ?? payload;
  if (!resolvedId || !patch) {
    return new Response(JSON.stringify({ ok: false, error: "Missing id or patch" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const updated = await updateUser(resolvedId, patch);
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

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: "Missing id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const deleted = await deleteUser(id);
  if (!deleted) {
    return new Response(JSON.stringify({ ok: false, error: "User not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, user: deleted }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
