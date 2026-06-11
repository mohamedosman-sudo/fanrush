"use client"

/**
 * SessionContext — single source of truth for auth + role across the app.
 *
 * WHY THIS EXISTS
 * ───────────────
 * AppShell is rendered inside each page component (not a shared Next.js
 * layout), so it re-mounts on every client-side route change. Without this
 * provider, every mount triggers independent supabase.auth.getUser() +
 * profiles queries in useIsLoggedIn, useUserRole, and AuthNav — causing a
 * loading gap that hides the BottomNav and flashes the header on every tab
 * switch.
 *
 * This provider lives in app/layout.tsx (via Providers.tsx) so it NEVER
 * re-mounts. All nav components read from context — zero async work on route
 * transitions after the first load.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type UserRole = "fan" | "business" | "admin" | null

export type SessionUser = {
  id: string
  email: string
}

type SessionState = {
  /** Resolved user, or null when logged out / still loading. */
  user: SessionUser | null
  /** Profile role. null until resolved. */
  role: UserRole
  /** True only during the very first auth check on app load. */
  isLoading: boolean
  /** Convenience: !!user */
  isLoggedIn: boolean
  /** Re-fetch user + role (call after sign-in). */
  refreshAuth: () => Promise<void>
  /** Sign out and clear session state. */
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionState>({
  user: null,
  role: null,
  isLoading: true,
  isLoggedIn: false,
  refreshAuth: async () => {},
  signOut: async () => {},
})

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  // Only true while the very first getUser() call is in-flight.
  // False immediately in demo mode (Supabase not configured).
  const [isLoading, setIsLoading] = useState(configured)

  // Prevent a second role fetch if one is already running.
  const roleFetchRef = useRef<string | null>(null)

  const fetchRole = useCallback(async (userId: string): Promise<void> => {
    if (roleFetchRef.current === userId) return
    roleFetchRef.current = userId
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()
      setRole((data?.role as UserRole) ?? "fan")
    } catch {
      setRole("fan")
    }
  }, [])

  const refreshAuth = useCallback(async (): Promise<void> => {
    if (!configured) return
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email ?? "" })
        await fetchRole(authUser.id)
      } else {
        setUser(null)
        setRole(null)
        roleFetchRef.current = null
      }
    } catch {
      setUser(null)
      setRole(null)
      roleFetchRef.current = null
    }
  }, [fetchRole])

  const signOut = useCallback(async (): Promise<void> => {
    if (configured) {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        // Clear local state regardless.
      }
    }
    setUser(null)
    setRole(null)
    roleFetchRef.current = null
  }, [])

  useEffect(() => {
    if (!configured) return // demo mode — nothing to fetch

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        // Single getUser() call for the whole app lifetime.
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!cancelled) {
          if (authUser) {
            setUser({ id: authUser.id, email: authUser.email ?? "" })
            // Kick off role fetch; don't await — unblock the loading state first.
            fetchRole(authUser.id)
          }
          setIsLoading(false)
        }

        // Stay in sync with sign-in / sign-out without polling.
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (cancelled) return
          if (session?.user) {
            const u = session.user
            setUser({ id: u.id, email: u.email ?? "" })
            fetchRole(u.id)
          } else {
            setUser(null)
            setRole(null)
            roleFetchRef.current = null
          }
        })

        unsubscribe = () => subscription.unsubscribe()
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [fetchRole])

  return (
    <SessionContext.Provider
      value={{
        user,
        role,
        isLoading,
        isLoggedIn: !!user,
        refreshAuth,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

/** Read the shared session state. Never triggers a network call. */
export function useSession(): SessionState {
  return useContext(SessionContext)
}
