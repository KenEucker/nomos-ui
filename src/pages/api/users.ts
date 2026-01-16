import type { APIRoute } from "astro";
import { listUsers } from "../../services/users";

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
