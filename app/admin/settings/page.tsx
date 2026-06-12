"use client"

import { useState, useEffect } from "react"
import AdminShell from "@/components/AdminShell"
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

export default function AdminSettingsPage() {
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
          role: profile?.role ?? user.user_metadata?.role ?? "admin",
        })
      } catch {
        // non-blocking — page still renders without profile data
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AdminShell title="Admin Settings">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">

        <div>
          <h1 className="text-white font-black text-2xl">Admin Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your admin account and platform preferences.</p>
        </div>

        {/* Admin profile */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Admin Profile</p>
          </div>
          {loading ? (
            <div className="px-5 py-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-5 bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <SettingRow label="Email" value={account?.email ?? "—"} />
              <SettingRow label="Display name" value={account?.displayName ?? "Not set"} />
              <SettingRow label="Role" value={account?.role ?? "admin"} badge />
            </div>
          )}
        </section>

        {/* Platform preferences */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Platform Preferences</p>
          </div>
          <div className="px-5 py-5 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Theme &amp; display preferences</p>
            <button
              onClick={() => showComingSoon("Platform preferences")}
              className="text-xs font-bold text-gray-500 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-colors touch-manipulation"
            >
              Coming soon
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Notification Preferences</p>
          </div>
          <div className="px-5 py-5 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Admin alerts &amp; moderation notifications</p>
            <button
              onClick={() => showComingSoon("Admin notifications")}
              className="text-xs font-bold text-gray-500 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-colors touch-manipulation"
            >
              Coming soon
            </button>
          </div>
        </section>

        {/* Security */}
        <section className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Security &amp; Account</p>
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
              <p className="text-gray-400 text-sm">Two-factor authentication</p>
              <button
                onClick={() => showComingSoon("Two-factor authentication")}
                className="text-xs font-bold text-gray-500 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-colors touch-manipulation"
              >
                Coming soon
              </button>
            </div>
          </div>
        </section>

      </div>
    </AdminShell>
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
