"use client"

import { useSession } from "@/lib/context/SessionContext"
export type { UserRole } from "@/lib/context/SessionContext"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Thin context reader — no network calls.
 *
 * Returns the current user's role from the shared SessionContext.
 * In demo mode (Supabase not configured), role is null and loading is false.
 */
export function useUserRole(): { role: import("@/lib/context/SessionContext").UserRole; loading: boolean } {
  const { role, isLoading } = useSession()

  if (!configured) return { role: null, loading: false }

  return { role, loading: isLoading }
}
