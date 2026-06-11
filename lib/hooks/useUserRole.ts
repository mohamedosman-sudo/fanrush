"use client"

import { useEffect, useState } from "react"

export type UserRole = "fan" | "business" | "admin" | null

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Returns the current user's role from their Supabase profile.
 * Returns null while loading or when logged out.
 */
export function useUserRole(): { role: UserRole; loading: boolean } {
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) return

    let cancelled = false

    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) { setRole(null); setLoading(false) }
          return
        }

        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (!cancelled) {
          setRole((data?.role as UserRole) ?? "fan")
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setRole(null); setLoading(false) }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { role, loading }
}
