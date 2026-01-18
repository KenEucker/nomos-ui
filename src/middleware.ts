import type { MiddlewareHandler } from "astro"
import { resolveSubject, SUBJECT_COOKIE } from "$lib/auth/subject"
import { computeCapabilities } from "$lib/authz/capabilities.server"

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname, searchParams } = context.url

  if (!pathname.startsWith("/admin")) {
    return next()
  }

  const asParam = searchParams.get("as")
  if (asParam) {
    const subject = resolveSubject(asParam)
    if (subject) {
      context.cookies.set(SUBJECT_COOKIE, subject.id, { path: "/", sameSite: "lax" })
      const redirectTarget = searchParams.get("redirect") ?? pathname
      const redirectUrl = new URL(redirectTarget, context.url)
      redirectUrl.searchParams.delete("as")
      redirectUrl.searchParams.delete("redirect")
      return context.redirect(redirectUrl.toString())
    }
  }

  if (pathname === "/admin/login") {
    return next()
  }

  const subject = resolveSubject(context.cookies.get(SUBJECT_COOKIE)?.value)
  if (!subject) {
    const redirectTarget = `${pathname}${context.url.search}`
    return context.redirect(`/admin/login?redirect=${encodeURIComponent(redirectTarget)}`)
  }

  const capabilities = computeCapabilities(subject)
  context.locals.auth = { subject, capabilities }

  if (!capabilities["admin.access"]) {
    const rewritten = await context.rewrite("/403")
    return new Response(rewritten.body, { status: 403, headers: rewritten.headers })
  }

  return next()
}
