"use client"

import { useState, useEffect } from "react"
import AppShell from "@/components/AppShell"
import { useComingSoon } from "@/components/useComingSoon"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

type AccountInfo = {
  email: string
  displayName: string | null
  role: string
}

export default function SettingsPage() {
  const showComingSoon = useComingSoon()
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }
    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", user.id)
          .single()

        setAccount({
          email: user.email ?? "",
          displayName: profile?.display_name ?? null,
          role: profile?.role ?? user.user_metadata?.role ?? "fan",
        })
      } catch {
        // non-blocking — page still renders
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AppShell title="Account Settings" showBack>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">

        <div>
          <h1 className="text-white font-black text-2xl">Account Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your FanRush account.</p>
        </div>

        {/* Profile details */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Profile</p>
          </div>
          {loading ? (
            <div className="px-5 py-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-5 bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <SettingRow label="Email" value={account?.email ?? "—"} />
              <SettingRow label="Display name" value={account?.displayName ?? "Not set"} />
              <SettingRow label="Role" value={account?.role ?? "fan"} badge />
            </div>
          )}
        </section>

        {/* Favourite teams */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Favourite Teams</p>
          </div>
          <div className="px-5 py-5 text-center">
            <p className="text-gray-500 text-sm">Manage your teams in your profile.</p>
            <button
              onClick={() => showComingSoon("Favourite teams settings")}
              className="mt-3 text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors touch-manipulation"
            >
              Edit teams →
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Notification Preferences</p>
          </div>
          <div className="px-5 py-5 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Push &amp; email notifications</p>
            <button
              onClick={() => showComingSoon("Notification preferences")}
              className="text-xs font-bold text-gray-500 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-colors touch-manipulation"
            >
              Coming soon
            </button>
          </div>
        </section>

        {/* Account actions */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Account Actions</p>
          </div>
          <div className="divide-y divide-white/5">
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">Change password</p>
              <button
                onClick={() => showComingSoon("Change password")}
                className="text-xs font-bold text-gray-500 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-colors touch-manipulation"
              >
                Coming soon
              </button>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-red-400/70 text-sm">Delete account</p>
              <button
                onClick={() => showComingSoon("Account deletion")}
                className="text-xs font-bold text-red-400/60 border border-red-500/20 hover:border-red-500/40 rounded-xl px-3 py-1.5 transition-colors touch-manipulation"
              >
                Coming soon
              </button>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  )
}

function SettingRow({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-3">
      <p className="text-gray-400 text-sm flex-shrink-0">{label}</p>
      {badge ? (
        <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/20">
          {value}
        </span>
      ) : (
        <p className="text-white text-sm font-medium truncate">{value}</p>
      )}
    </div>
  )
}
