import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  const buildId = process.env.BUILD_ID ?? "local"
  const serverTime = new Date().toISOString()

  return new Response(JSON.stringify({ buildId, serverTime }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
