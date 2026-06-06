"use client"

import { useState } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import EmptyState from "@/components/EmptyState"
import { mockEvents, mockVenues, mockMatches } from "@/lib/mock-data"
import { Event } from "@/lib/types"

type Tab = "pending" | "approved" | "rejected"

const TABS: { label: string; value: Tab }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
]

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [activeTab, setActiveTab] = useState<Tab>("pending")

  const filtered = events.filter((e) => e.status === activeTab)

  function approve(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)))
  }
  function reject(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)))
  }

  function getVenueName(venueId: string) {
    return mockVenues.find((v) => v.id === venueId)?.name ?? venueId
  }
  function getMatchLabel(matchId: string) {
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
            {filtered.length === 0 ? (
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
                        <p className="text-gray-400 text-sm mt-0.5">Venue: {getVenueName(event.venueId)}</p>
                        <p className="text-gray-500 text-xs mt-1">{getMatchLabel(event.matchId)}</p>
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
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => approve(event.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => reject(event.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {activeTab === "approved" && (
                          <button
                            onClick={() => reject(event.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                          >
                            ✗ Reject
                          </button>
                        )}
                        {activeTab === "rejected" && (
                          <button
                            onClick={() => approve(event.id)}
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
