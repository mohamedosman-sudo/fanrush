"use client"

import { useEffect, useState } from "react"

type Status = "loading" | "yes" | "no"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Lightweight hook that answers "is the current user logged in?"
 *
 * Returns:
 *   "loading" — auth check in progress (hide auth-dependent UI to avoid flash)
 *   "yes"     — authenticated
 *   "no"      — confirmed logged out
 *
 * When Supabase is not configured (demo mode), always returns "yes" so the
 * full app UI is accessible for testing / demo purposes.
 */
export function useIsLoggedIn(): Status {
  const [status, setStatus] = useState<Status>(configured ? "loading" : "yes")

  useEffect(() => {
    if (!configured) return
    let cancelled = false

    async function check() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!cancelled) setStatus(user ? "yes" : "no")
      } catch {
        if (!cancelled) setStatus("no")
      }
    }

    check()
    return () => { cancelled = true }
  }, [])

  return status
}
