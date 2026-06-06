"use client"

import { useState } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import EmptyState from "@/components/EmptyState"
import { mockVenues } from "@/lib/mock-data"
import { Venue } from "@/lib/types"

type Tab = "pending" | "approved" | "rejected"

const TABS: { label: string; value: Tab }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
]

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>(mockVenues)
  const [activeTab, setActiveTab] = useState<Tab>("pending")

  const filtered = venues.filter((v) => v.status === activeTab)

  function approve(id: string) {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: "approved" } : v)))
  }
  function reject(id: string) {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: "rejected" } : v)))
  }
  function toggleFeatured(id: string) {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, featured: !v.featured } : v)))
  }

  return (
    <AppShell showBottomNav={false} title="Admin - Venues">
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Venue Management</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/5 pb-0">
              {TABS.map((tab) => {
                const count = venues.filter((v) => v.status === tab.value).length
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
                icon="📍"
                title={`No ${activeTab} venues`}
                description={`There are currently no venues with ${activeTab} status.`}
              />
            ) : (
              <div className="space-y-2">
                {filtered.map((venue) => (
                  <div key={venue.id} className="bg-gray-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-white font-bold">{venue.name}</p>
                          {venue.featured && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold border border-yellow-400/20">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{venue.city}</p>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                          <span>Business: {venue.businessId ?? "—"}</span>
                          <span>Matches: {venue.matchIds.length}</span>
                          <span>Capacity: {venue.capacity}</span>
                          <span className="capitalize">{venue.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => approve(venue.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => reject(venue.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {activeTab === "approved" && (
                          <button
                            onClick={() => toggleFeatured(venue.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              venue.featured
                                ? "bg-yellow-400/15 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/25"
                                : "bg-gray-800 border-white/10 text-gray-300 hover:border-white/20"
                            }`}
                          >
                            {venue.featured ? "Unfeature" : "Feature"}
                          </button>
                        )}
                        {activeTab === "rejected" && (
                          <button
                            onClick={() => approve(venue.id)}
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
