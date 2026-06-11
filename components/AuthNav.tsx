"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/lib/hooks/useUserRole"

type AuthUser = { id: string; email: string } | null

// compact=true → used in the app Header (tight space)
// compact=false → used in the landing page header (more space, full labels)
export default function AuthNav({ compact = false }: { compact?: boolean }) {
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  // If Supabase is not configured we already know the user is "not logged in".
  const [authUser, setAuthUser] = useState<AuthUser>(null)
  const [checked, setChecked] = useState(!configured)
  const router = useRouter()
  const { role } = useUserRole()

  useEffect(() => {
    if (!configured) return

    // Keep a ref so the cleanup can cancel in-flight work.
    let unsubscribe: (() => void) | undefined

    async function setup() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        setAuthUser(user ? { id: user.id, email: user.email ?? "" } : null)
        setChecked(true)

        // Keep state in sync for the lifetime of the component.
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setAuthUser(
            session?.user
              ? { id: session.user.id, email: session.user.email ?? "" }
              : null
          )
        })

        unsubscribe = () => subscription.unsubscribe()
      } catch {
        setChecked(true)
      }
    }

    setup()

    return () => {
      unsubscribe?.()
    }
  }, [configured])

  async function handleLogout() {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Proceed with client-side cleanup even if the network call fails.
    }
    setAuthUser(null)
    router.push("/")
    router.refresh()
  }

  // Avoid layout shift while we wait for the async auth check.
  if (!checked) {
    return <div className={compact ? "w-16 h-8" : "w-36 h-9"} aria-hidden />
  }

  // ── Logged in ────────────────────────────────────────────────────────────
  if (authUser) {
    const initial = (authUser.email[0] ?? "?").toUpperCase()

    return (
      <div className="flex items-center gap-2">
        {/* Role-based dashboard shortcut — ensures elevated users are never stranded */}
        {role === "admin" && (
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold transition-all hidden sm:flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Admin
          </Link>
        )}
        {role === "business" && (
          <Link
            href="/business"
            className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold transition-all hidden sm:flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
            </svg>
            Business
          </Link>
        )}

        <Link
          href="/account"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Go to account"
        >
          {/* Avatar circle */}
          <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {initial}
          </span>
          {!compact && (
            <span className="text-white text-sm font-medium hidden sm:block">
              Account
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-400 text-sm font-medium transition-all"
          aria-label="Log out"
        >
          {compact ? (
            // Small exit icon for tight header space
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          ) : (
            "Log out"
          )}
        </button>
      </div>
    )
  }

  // ── Logged out ───────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-4 py-1.5 rounded-xl border border-white/20 hover:border-orange-500/50 text-white text-sm font-medium transition-all"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all active:scale-95"
      >
        {compact ? "Sign up" : "Create Account"}
      </Link>
    </div>
  )
}
