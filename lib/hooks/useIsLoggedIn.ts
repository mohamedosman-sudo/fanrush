"use client"

import { useSession } from "@/lib/context/SessionContext"

type Status = "loading" | "yes" | "no"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Thin context reader — no network calls.
 *
 * Returns:
 *   "loading" — only during the very first app load (single check, never again)
 *   "yes"     — authenticated (or demo mode)
 *   "no"      — confirmed logged out
 *
 * Demo mode (Supabase not configured) always returns "yes" so the full app
 * UI is accessible for testing / development without credentials.
 */
export function useIsLoggedIn(): Status {
  const { isLoggedIn, isLoading } = useSession()

  // Demo mode: always "logged in" for nav/shell purposes.
  if (!configured) return "yes"

  if (isLoading) return "loading"
  return isLoggedIn ? "yes" : "no"
}
