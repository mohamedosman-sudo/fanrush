"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import BusinessShell from "@/components/BusinessShell"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

type AnalyticsRow = {
  venueId: string
  venueName: string
  views: number
  clicks: number
  saves: number
  bookings: number
}

type LoadMode = "loading" | "live" | "empty" | "preview" | "error"

function StatBlock({
  label,
  value,
  icon,
  isExample,
}: {
  label: string
  value: number
  icon: string
  isExample?: boolean
}) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`font-black text-2xl ${isExample ? "text-gray-400" : "text-white"}`}>
        {value.toLocaleString("en-US")}
      </p>
      <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

export default function BusinessAnalyticsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([])
  const [loadMode, setLoadMode] = useState<LoadMode>(configured ? "loading" : "preview")

  useEffect(() => {
    if (!configured) return

    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) {
          setLoadMode("preview")
          return
        }

        const { data, error } = await supabase
          .from("venues")
          .select("id, name, views, clicks, saves, bookings")
          .eq("owner_id", user.id)
          .eq("status", "approved")
          .order("views", { ascending: false })

        if (error) {
          console.warn("[business/analytics] query error:", error.message)
          setLoadMode("error")
          return
        }

        if (!data || data.length === 0) {
          setLoadMode("empty")
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRows((data as any[]).map((v) => ({
          venueId: v.id,
          venueName: v.name,
          views: v.views ?? 0,
          clicks: v.clicks ?? 0,
          saves: v.saves ?? 0,
          bookings: v.bookings ?? 0,
        })))
        setLoadMode("live")
      } catch (err) {
        console.error("[business/analytics] unexpected error", err)
        setLoadMode("error")
      }
    }

    load()
  }, [])

  const totalViews = rows.reduce((s, r) => s + r.views, 0)
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0)
  const totalSaves = rows.reduce((s, r) => s + r.saves, 0)
  const totalBookings = rows.reduce((s, r) => s + r.bookings, 0)

  return (
    <BusinessShell title="Analytics">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-8">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Business Analytics</h1>
              <p className="text-gray-400 text-sm mt-1">
                Track how fans engage with your venues and events.
              </p>
            </div>

            {/* Loading skeleton */}
            {loadMode === "loading" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-4 animate-pulse h-24" />
                ))}
              </div>
            )}

            {/* Error */}
            {loadMode === "error" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                <p className="text-red-300 text-sm font-semibold">
                  Unable to load analytics. Check your connection and try refreshing.
                </p>
              </div>
            )}

            {/* Preview mode — no live data, show clearly labelled example */}
            {loadMode === "preview" && (
              <>
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-3">
                  <span className="text-yellow-400 flex-shrink-0">📊</span>
                  <p className="text-yellow-300 text-sm font-semibold">
                    Analytics preview — live metrics will appear after launch activity.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBlock label="Views" value={1240} icon="👁️" isExample />
                  <StatBlock label="Clicks" value={310} icon="🖱️" isExample />
                  <StatBlock label="Saves" value={87} icon="🔖" isExample />
                  <StatBlock label="Bookings" value={54} icon="🎟️" isExample />
                </div>
                <p className="text-center text-gray-600 text-xs">Example data — not your real metrics</p>
              </>
            )}

            {/* Empty — approved venues exist but no activity yet */}
            {loadMode === "empty" && (
              <div className="bg-gray-900 border border-dashed border-white/20 rounded-2xl p-10 text-center">
                <p className="text-3xl mb-3">📊</p>
                <p className="text-white font-bold mb-1">No analytics yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Analytics will appear once fans view, save, or book your venue.
                </p>
                <Link
                  href="/business"
                  className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors touch-manipulation"
                >
                  ← Back to Overview
                </Link>
              </div>
            )}

            {/* Live data */}
            {loadMode === "live" && (
              <>
                {/* Total summary */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">All Venues — Total</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBlock label="Views" value={totalViews} icon="👁️" />
                    <StatBlock label="Clicks" value={totalClicks} icon="🖱️" />
                    <StatBlock label="Saves" value={totalSaves} icon="🔖" />
                    <StatBlock label="Bookings" value={totalBookings} icon="🎟️" />
                  </div>
                </div>

                {/* Per-venue breakdown */}
                {rows.length > 1 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Per Venue</p>
                    <div className="space-y-3">
                      {rows.map((row) => (
                        <div key={row.venueId} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                          <p className="text-white font-bold text-sm mb-3">{row.venueName}</p>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: "Views", value: row.views },
                              { label: "Clicks", value: row.clicks },
                              { label: "Saves", value: row.saves },
                              { label: "Bookings", value: row.bookings },
                            ].map((stat) => (
                              <div key={stat.label} className="bg-gray-800/60 rounded-xl p-2.5 text-center">
                                <p className="text-white font-bold text-sm">{stat.value.toLocaleString("en-US")}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zero-activity nudge */}
                {totalViews + totalClicks + totalSaves + totalBookings === 0 && (
                  <div className="rounded-xl border border-white/10 bg-gray-900 px-4 py-4 text-center">
                    <p className="text-gray-400 text-sm">
                      No fan activity yet. Analytics will update as fans discover your venue.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Upgrade nudge */}
            <div className="bg-gradient-to-r from-orange-950/50 via-gray-900 to-gray-900 border border-orange-500/20 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-white font-black text-base">⚡ Get deeper insights</h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  Premium listings get featured placement and real-time analytics.
                </p>
              </div>
              <Link
                href="/business/pricing"
                className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-4 py-2.5 transition-all text-sm touch-manipulation"
              >
                See Pricing →
              </Link>
            </div>

      </div>
    </BusinessShell>
  )
}
