"use client"

import { useState, useEffect } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import MobileAdminNav from "@/components/MobileAdminNav"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const MOBILE_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Venues", href: "/admin/venues" },
  { label: "Events", href: "/admin/events" },
  { label: "Matches", href: "/admin/matches" },
  { label: "Sponsors", href: "/admin/sponsors" },
  { label: "Launch", href: "/admin/launch" },
]

type CheckStatus = "ok" | "warn" | "error" | "loading"

interface CheckResult {
  label: string
  detail: string
  status: CheckStatus
}

interface LaunchData {
  venues: { approved: number; pending: number; rejected: number }
  events: { total: number; upcoming: number }
  sponsors: { active: number; missingUrl: number }
  predictions: { matchCount: number }
}

function StatusDot({ status }: { status: CheckStatus }) {
  const colours: Record<CheckStatus, string> = {
    ok: "bg-green-500",
    warn: "bg-yellow-500",
    error: "bg-red-500",
    loading: "bg-gray-600 animate-pulse",
  }
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colours[status]}`} />
}

function CheckRow({ check }: { check: CheckResult }) {
  const label: Record<CheckStatus, string> = {
    ok: "OK",
    warn: "Warning",
    error: "Action needed",
    loading: "Checking…",
  }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <StatusDot status={check.status} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">{check.label}</p>
        <p className="text-gray-400 text-xs mt-0.5">{check.detail}</p>
      </div>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
          check.status === "ok"
            ? "bg-green-500/10 text-green-400"
            : check.status === "warn"
            ? "bg-yellow-500/10 text-yellow-400"
            : check.status === "error"
            ? "bg-red-500/10 text-red-400"
            : "bg-gray-800 text-gray-500"
        }`}
      >
        {label[check.status]}
      </span>
    </div>
  )
}

function buildChecks(data: LaunchData | null, loading: boolean): CheckResult[] {
  if (loading || !data) {
    return [
      { label: "Approved venues", detail: "Fetching…", status: "loading" },
      { label: "Active sponsors", detail: "Fetching…", status: "loading" },
      { label: "Sponsor target URLs", detail: "Fetching…", status: "loading" },
      { label: "Prediction matches", detail: "Fetching…", status: "loading" },
      { label: "Upcoming events", detail: "Fetching…", status: "loading" },
    ]
  }

  return [
    {
      label: "Approved venues",
      detail:
        data.venues.approved > 0
          ? `${data.venues.approved} venue${data.venues.approved !== 1 ? "s" : ""} approved and live`
          : `No approved venues yet — ${data.venues.pending} pending review`,
      status: data.venues.approved > 0 ? "ok" : data.venues.pending > 0 ? "warn" : "error",
    },
    {
      label: "Active sponsors",
      detail:
        data.sponsors.active > 0
          ? `${data.sponsors.active} active sponsor slot${data.sponsors.active !== 1 ? "s" : ""}`
          : "No active sponsors — banner placements will be empty",
      status: data.sponsors.active > 0 ? "ok" : "warn",
    },
    {
      label: "Sponsor target URLs",
      detail:
        data.sponsors.missingUrl === 0
          ? "All active sponsors have click-through URLs"
          : `${data.sponsors.missingUrl} active sponsor${data.sponsors.missingUrl !== 1 ? "s" : ""} missing a target URL`,
      status: data.sponsors.missingUrl === 0 ? "ok" : "error",
    },
    {
      label: "Prediction matches",
      detail:
        data.predictions.matchCount > 0
          ? `${data.predictions.matchCount} match${data.predictions.matchCount !== 1 ? "es" : ""} available for predictions`
          : "No matches loaded — fans cannot make predictions",
      status: data.predictions.matchCount > 0 ? "ok" : "error",
    },
    {
      label: "Upcoming events",
      detail:
        data.events.upcoming > 0
          ? `${data.events.upcoming} upcoming event${data.events.upcoming !== 1 ? "s" : ""} scheduled`
          : "No upcoming events — business operators should add events",
      status: data.events.upcoming > 0 ? "ok" : "warn",
    },
  ]
}

function overallStatus(checks: CheckResult[]): { label: string; colour: string } {
  if (checks.some((c) => c.status === "loading")) return { label: "Checking…", colour: "text-gray-400" }
  if (checks.some((c) => c.status === "error")) return { label: "Needs attention", colour: "text-red-400" }
  if (checks.some((c) => c.status === "warn")) return { label: "Almost ready", colour: "text-yellow-400" }
  return { label: "Ready to launch", colour: "text-green-400" }
}

export default function AdminLaunchPage() {
  const emptyData: LaunchData = {
    venues: { approved: 0, pending: 0, rejected: 0 },
    events: { total: 0, upcoming: 0 },
    sponsors: { active: 0, missingUrl: 0 },
    predictions: { matchCount: 0 },
  }

  const [data, setData] = useState<LaunchData | null>(configured ? null : emptyData)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) return

    async function fetchData() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const [venueRes, eventRes, sponsorRes, matchRes] = await Promise.all([
          supabase.from("venues").select("status"),
          supabase.from("events").select("date"),
          supabase.from("sponsor_slots").select("active, target_url"),
          supabase.from("matches").select("id", { count: "exact", head: true }),
        ])

        const venues = venueRes.data ?? []
        const events = eventRes.data ?? []
        const sponsors = sponsorRes.data ?? []
        const matchCount = matchRes.count ?? 0

        const now = new Date().toISOString()
        const activeSponsors = sponsors.filter((s) => s.active)

        setData({
          venues: {
            approved: venues.filter((v) => v.status === "approved").length,
            pending: venues.filter((v) => v.status === "pending").length,
            rejected: venues.filter((v) => v.status === "rejected").length,
          },
          events: {
            total: events.length,
            upcoming: events.filter((e) => e.date && e.date >= now).length,
          },
          sponsors: {
            active: activeSponsors.length,
            missingUrl: activeSponsors.filter((s) => !s.target_url).length,
          },
          predictions: { matchCount },
        })
      } catch {
        // show empty state
        setData({
          venues: { approved: 0, pending: 0, rejected: 0 },
          events: { total: 0, upcoming: 0 },
          sponsors: { active: 0, missingUrl: 0 },
          predictions: { matchCount: 0 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const checks = buildChecks(data, loading)
  const overall = overallStatus(checks)

  return (
    <AppShell showBottomNav={false} title="Admin - Launch Readiness">
      <MobileAdminNav title="Admin" links={MOBILE_LINKS} />
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Launch Readiness</h1>
              <p className="text-gray-400 text-sm mt-1">
                Overall status:{" "}
                <span className={`font-semibold ${overall.colour}`}>{overall.label}</span>
              </p>
            </div>

            {/* Stat cards */}
            {data && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-green-400">{data.venues.approved}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Approved Venues</div>
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-yellow-400">{data.venues.pending}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Pending Venues</div>
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-orange-400">{data.sponsors.active}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Active Sponsors</div>
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-blue-400">{data.predictions.matchCount}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Matches Loaded</div>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold text-base mb-1">Pre-launch Checklist</h2>
              <p className="text-gray-500 text-xs mb-4">Issues flagged here will affect the fan experience at launch.</p>
              <div>
                {checks.map((check) => (
                  <CheckRow key={check.label} check={check} />
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold text-base mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Review pending venues", href: "/admin/venues" },
                  { label: "Manage sponsors", href: "/admin/sponsors" },
                  { label: "Check events", href: "/admin/events" },
                  { label: "Load matches", href: "/admin/matches" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                    <span className="text-gray-600">→</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </AppShell>
  )
}
