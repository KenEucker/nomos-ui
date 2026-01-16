import type { APIRoute } from "astro";
import { listUsers } from "../../services/users";

export const GET: APIRoute = async ({ url }) => {
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";
  const sort = url.searchParams.get("sort") ?? "";

  // TODO: fetch from DB, file, etc.
  const items = await listUsers({
    page,
    pageSize,
    search,
    sortKey: sort ? (sort.replace(/^-/, "") as any) : null,
    sortDir: sort?.startsWith("-") ? "desc" : "asc",
  }).then((result) => result.items);
  const total = items.length;

  return new Response(
    JSON.stringify({ data: { users: items }, meta: { total } }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};
