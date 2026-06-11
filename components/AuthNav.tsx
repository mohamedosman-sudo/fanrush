"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AccountMenu from "./AccountMenu"

type AuthUser = { id: string; email: string } | null

const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL

// compact=true → used in the app Header (tight space, avatar only)
// compact=false → used in the landing page header (full labels)
export default function AuthNav({ compact = false }: { compact?: boolean }) {
  const [authUser, setAuthUser] = useState<AuthUser>(null)
  const [checked, setChecked] = useState(!configured)

  useEffect(() => {
    if (!configured) return

    let unsubscribe: (() => void) | undefined

    async function setup() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        setAuthUser(user ? { id: user.id, email: user.email ?? "" } : null)
        setChecked(true)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setAuthUser(
            session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null
          )
        })

        unsubscribe = () => subscription.unsubscribe()
      } catch {
        setChecked(true)
      }
    }

    setup()
    return () => { unsubscribe?.() }
  }, [])

  // Placeholder while auth resolves (prevents layout shift)
  if (!checked) {
    return <div className={compact ? "w-10 h-8" : "w-36 h-9"} aria-hidden />
  }

  // ── Logged in — role-aware account menu ──────────────────────────────────
  if (authUser) {
    return <AccountMenu email={authUser.email} />
  }

  // ── Logged out — login / create account ──────────────────────────────────
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-4 py-1.5 rounded-xl border border-white/20 hover:border-orange-500/50 text-white text-sm font-medium transition-all touch-manipulation"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all active:scale-95 touch-manipulation"
      >
        {compact ? "Sign up" : "Create Account"}
      </Link>
    </div>
  )
}
