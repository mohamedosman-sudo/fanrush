"use client"

import { useState, useEffect } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import EmptyState from "@/components/EmptyState"
import { mockEvents, mockVenues, mockMatches } from "@/lib/mock-data"
import { useToast } from "@/components/Toast"

type Tab = "pending" | "approved" | "rejected"

const TABS: { label: string; value: Tab }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
]

type EventRow = {
  id: string
  name: string
  venueId: string
  venueName: string
  matchId: string
  date: string
  status: "pending" | "approved" | "rejected"
}

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function mockFallbackEvents(): EventRow[] {
  return mockEvents.map((e) => ({
    id: e.id,
    name: e.name,
    venueId: e.venueId,
    venueName: mockVenues.find((v) => v.id === e.venueId)?.name ?? e.venueId,
    matchId: e.matchId,
    date: e.date,
    status: e.status,
  }))
}

function getMatchLabel(matchId: string): string {
  const m = mockMatches.find((m) => m.id === matchId)
  if (!m) return matchId
  const date = new Date(m.kickoffTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  return `${m.homeTeam.flagEmoji} ${m.homeTeam.shortCode} vs ${m.awayTeam.shortCode} ${m.awayTeam.flagEmoji} · ${date}`
}

export default function AdminEventsPage() {
  const { showToast } = useToast()
  const [events, setEvents] = useState<EventRow[]>(() =>
    configured ? [] : mockFallbackEvents()
  )
  const [loading, setLoading] = useState(configured)
  const [activeTab, setActiveTab] = useState<Tab>("pending")

  useEffect(() => {
    if (!configured) return

    async function loadEvents() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data, error } = await supabase
          .from("events")
          .select("id, title, venue_id, venues(name), match_id, event_date, status")
          .order("created_at", { ascending: false })

        if (error || !data) {
          console.warn("[admin/events] load error", error)
          setEvents(mockFallbackEvents())
          setLoading(false)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEvents((data as any[]).map((e) => ({
          id: e.id,
          name: e.title ?? "Untitled event",
          venueId: e.venue_id ?? "",
          venueName: e.venues?.name ?? e.venue_id ?? "—",
          matchId: e.match_id ?? "",
          date: e.event_date ?? "",
          status: (e.status ?? "pending") as Tab,
        })))
      } catch (err) {
        console.error("[admin/events] unexpected error", err)
        setEvents(mockFallbackEvents())
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))

    if (!configured) return

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase.from("events").update({ status }).eq("id", id)
      if (error) {
        console.error("[admin/events] status update error", error)
        showToast(`Failed to ${status === "approved" ? "approve" : "reject"} event.`, "error")
        setEvents((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: status === "approved" ? "rejected" : "pending" } : e
          )
        )
        return
      }
      showToast(
        status === "approved" ? "Event approved and now live." : "Event rejected.",
        status === "approved" ? "success" : "info"
      )
    } catch (err) {
      console.error("[admin/events] unexpected update error", err)
      showToast("Something went wrong. Please try again.", "error")
    }
  }

  const filtered = events.filter((e) => e.status === activeTab)

  return (
    <AppShell showBottomNav={false} title="Admin - Events">
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Event Management</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/5 pb-0">
              {TABS.map((tab) => {
                const count = events.filter((e) => e.status === tab.value).length
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                      activeTab === tab.value ? "text-orange-400" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                    <span className="bg-gray-800 rounded-full px-2 py-0.5 text-xs text-gray-400">
                      {count}
                    </span>
                    {activeTab === tab.value && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="🎉"
                title={`No ${activeTab} events`}
                description={`There are currently no events with ${activeTab} status.`}
              />
            ) : (
              <div className="space-y-2">
                {filtered.map((event) => (
                  <div key={event.id} className="bg-gray-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold">{event.name}</p>
                        <p className="text-gray-400 text-sm mt-0.5">Venue: {event.venueName}</p>
                        {event.matchId && (
                          <p className="text-gray-500 text-xs mt-1">{getMatchLabel(event.matchId)}</p>
                        )}
                        {event.date && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(event.date).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                              timeZoneName: "short",
                            })}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(event.id, "approved")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => updateStatus(event.id, "rejected")}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {activeTab === "approved" && (
                          <button
                            onClick={() => updateStatus(event.id, "rejected")}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                          >
                            ✗ Reject
                          </button>
                        )}
                        {activeTab === "rejected" && (
                          <button
                            onClick={() => updateStatus(event.id, "approved")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all"
                          >
                            Re-approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </AppShell>
  )
}
