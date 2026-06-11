"use client"

import Link from "next/link"
import { useSession } from "@/lib/context/SessionContext"
import AccountMenu from "./AccountMenu"

const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL

// compact=true → app Header (tight space)
// compact=false → landing page header (full labels)
export default function AuthNav({ compact = false }: { compact?: boolean }) {
  const { user, isLoading } = useSession()

  // Show a size-matched placeholder while the single root-level auth check
  // resolves. This only happens once on first app load — never on route changes.
  if (configured && isLoading) {
    return <div className={compact ? "w-10 h-8" : "w-36 h-9"} aria-hidden />
  }

  // ── Logged in — role-aware account menu ──────────────────────────────────
  if (user) {
    return <AccountMenu email={user.email} />
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
