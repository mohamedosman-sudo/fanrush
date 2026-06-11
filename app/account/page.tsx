"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"
import Link from "next/link"

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

interface Profile {
  email: string
  displayName: string
  role: "fan" | "business" | "admin"
}

const roleBadgeStyles: Record<string, string> = {
  fan: "bg-gray-700 text-gray-300",
  business: "bg-orange-500/20 text-orange-400",
  admin: "bg-red-500/20 text-red-400",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function AccountPage() {
  const router = useRouter()
  const configured = isSupabaseConfigured()

  const [profile, setProfile] = useState<Profile>({
    email: "demo@fanrush.com",
    displayName: "Demo User",
    role: "fan",
  })
  const [teams] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("fanrush_teams") ?? "[]") } catch { return [] }
  })
  const [city] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("fanrush_city") ?? ""
  })

  useEffect(() => {
    if (!configured) return

    async function loadProfile() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: p } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", user.id)
          .single()

        setProfile({
          email: user.email ?? "",
          displayName: p?.display_name ?? user.email ?? "User",
          role: p?.role ?? "fan",
        })
      } catch {}
    }

    loadProfile()
  }, [configured])

  async function handleSignOut() {
    if (!configured) return
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch {}
  }

  return (
    <AppShell title="My Account" showBottomNav={false} showBack>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile section */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {getInitials(profile.displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold truncate">{profile.displayName}</p>
              <p className="text-gray-400 text-sm truncate">{profile.email}</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${roleBadgeStyles[profile.role]}`}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
          </div>
          <button
            disabled
            className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-gray-400 text-sm font-medium cursor-not-allowed opacity-60"
          >
            Edit Profile
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-bold text-base">Preferences</h2>

          <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Favourite Teams</p>
            {teams.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <span key={team} className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1 text-white text-sm">
                    {team}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No teams selected yet</p>
            )}
          </div>

          <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Your City</p>
            <p className="text-white text-sm">{city || <span className="text-gray-600">Not set</span>}</p>
          </div>

          <Link
            href="/onboarding"
            className="inline-block border border-orange-500/40 text-orange-400 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-orange-500/10 transition-colors"
          >
            Re-run Onboarding →
          </Link>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-bold text-base mb-4">Account Actions</h2>
          {configured ? (
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <p className="text-gray-600 text-sm">Preview mode — connect Supabase to enable sign out</p>
          )}
        </div>

        {/* Security */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-base">Security</h2>

          <div className="flex items-center justify-between">
            <button
              disabled
              className="border border-white/10 rounded-xl px-4 py-2 text-gray-500 text-sm font-medium cursor-not-allowed"
            >
              Change Password
            </button>
            <span className="text-xs bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-gray-500">Coming soon</span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <span className="text-gray-400 text-sm">Connected Accounts</span>
            <span className="text-gray-600 text-sm">None</span>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
