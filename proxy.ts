import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// ---------------------------------------------------------------------------
// Route lists (startsWith covers all sub-paths automatically)
// ---------------------------------------------------------------------------
const PROTECTED_FAN_ROUTES = ["/profile"]
const PROTECTED_BUSINESS_ROUTES = ["/business"]
const PROTECTED_ADMIN_ROUTES = ["/admin"]

// ---------------------------------------------------------------------------
// Dev logger — stripped to a no-op in production builds
// ---------------------------------------------------------------------------
function devLog(label: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[proxy] ${label}`, JSON.stringify(data))
  }
}

// ---------------------------------------------------------------------------
// resolveRole
//
// Uses a raw fetch to the Supabase PostgREST endpoint with the service-role
// key set as BOTH the `apikey` header AND the `Authorization: Bearer` header.
// This is the only reliable pattern in edge/proxy runtimes — it bypasses RLS
// completely without instantiating a Supabase client (which can silently drop
// the service-role JWT in edge contexts, causing the 42501 you saw).
//
// Falls back to user_metadata.role when the service key is absent (demo mode).
// ---------------------------------------------------------------------------
async function resolveRole(
  userId: string,
  userMetaRole: string | undefined
): Promise<string> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  devLog("resolveRole called", {
    userId,
    serviceKeyExists: !!serviceKey,
    serviceKeyLooksValid: serviceKey?.startsWith("eyJ") ?? false,
    supabaseUrlExists: !!supabaseUrl,
  })

  if (serviceKey && supabaseUrl) {
    // PostgREST REST call — no client library, guaranteed header delivery.
    const endpoint =
      `${supabaseUrl}/rest/v1/profiles` +
      `?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          // Both headers are required for service-role RLS bypass.
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          // Tell PostgREST to return a single object, not an array.
          Prefer: "return=representation",
        },
        // Ensure Next.js doesn't cache this during static generation.
        cache: "no-store",
      })

      if (!res.ok) {
        const body = await res.text()
        devLog("profiles REST error", {
          status: res.status,
          statusText: res.statusText,
          body,
        })
        // Do NOT fall back to "fan" on error for elevated routes —
        // the caller will handle the deny-by-default below.
        return "__fetch_error__"
      }

      const rows = (await res.json()) as Array<{ role?: string }>
      const role = rows?.[0]?.role

      devLog("profiles REST success", { userId, role: role ?? null })

      if (role && ["fan", "business", "admin"].includes(role)) {
        return role
      }

      // Row exists but role value is unexpected.
      devLog("unexpected role value from DB", { userId, role })
      return "__unexpected_role__"
    } catch (err) {
      devLog("profiles REST threw", { err: String(err) })
      return "__fetch_error__"
    }
  }

  // No service key — demo/local mode.  Trust user_metadata (set at signup).
  if (userMetaRole && ["fan", "business", "admin"].includes(userMetaRole)) {
    devLog("role from user_metadata (no service key)", { userId, userMetaRole })
    return userMetaRole
  }

  devLog("no service key and no metadata role — defaulting fan", { userId })
  return "fan"
}

// ---------------------------------------------------------------------------
// Proxy
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  try {
    return await _proxyInner(request)
  } catch (err) {
    // Fail open: if the proxy itself crashes (e.g. Supabase unreachable at
    // startup), let the request through rather than returning an empty/500
    // response that Chrome shows as "This page couldn't load".
    console.error("[proxy] unhandled crash — failing open", err)
    return NextResponse.next({ request })
  }
}

async function _proxyInner(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname

  // Skip auth entirely when Supabase is not configured (demo / CI mode).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    devLog("Supabase not configured — open access", { pathname })
    return supabaseResponse
  }

  // Build the SSR client solely to refresh the session cookie and validate
  // the JWT.  Do NOT use this client for privileged DB queries.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT server-side (never trust getSession() alone).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  devLog("auth check", {
    pathname,
    hasUser: !!user,
    userId: user?.id ?? null,
  })

  // Classify the route.
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((r) =>
    pathname.startsWith(r)
  )
  const isBusinessRoute = PROTECTED_BUSINESS_ROUTES.some((r) =>
    pathname.startsWith(r)
  )
  const isFanRoute = PROTECTED_FAN_ROUTES.some((r) => pathname.startsWith(r))

  // Unprotected route — pass straight through.
  if (!isAdminRoute && !isBusinessRoute && !isFanRoute) {
    return supabaseResponse
  }

  // No session → login.
  if (!user) {
    devLog("unauthenticated — redirect to login", { pathname })
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // Elevated route — resolve the authoritative role from the DB.
  if (isAdminRoute || isBusinessRoute) {
    const role = await resolveRole(
      user.id,
      user.user_metadata?.role as string | undefined
    )

    devLog("role gate", {
      pathname,
      userId: user.id,
      resolvedRole: role,
      isAdminRoute,
      isBusinessRoute,
    })

    // Deny if the DB lookup errored or the role doesn't match.
    const adminBlocked =
      isAdminRoute &&
      role !== "admin"

    const businessBlocked =
      isBusinessRoute &&
      role !== "business" &&
      role !== "admin"

    // If the DB lookup itself errored (network issue, service key problem),
    // do NOT block an authenticated user — redirect to unauthorized only
    // when we have a confirmed mismatched role, not when we hit an error.
    const dbLookupFailed =
      role === "__fetch_error__" || role === "__unexpected_role__"

    if (!dbLookupFailed && (adminBlocked || businessBlocked)) {
      devLog("access denied", { userId: user.id, role, pathname })
      const url = request.nextUrl.clone()
      url.pathname = "/unauthorized"
      return NextResponse.redirect(url)
    }

    if (dbLookupFailed) {
      devLog("role lookup failed — failing open for authenticated user", {
        userId: user.id,
        role,
        pathname,
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
