"use client"

import { useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import StatCard from "@/components/StatCard"
import { mockVenues, mockEvents, mockMatches, mockSponsorSlots } from "@/lib/mock-data"
import { Venue, Event } from "@/lib/types"
import MobileAdminNav from "@/components/MobileAdminNav"

const quickLinks = [
  {
    label: "Manage Venues",
    description: "Approve, reject and feature venue listings",
    href: "/admin/venues",
    icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Manage Events",
    description: "Review and publish event submissions",
    href: "/admin/events",
    icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Manage Matches",
    description: "Update scores and match statuses",
    href: "/admin/matches",
    icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 3c0 0 2 3 2 9s-2 9-2 9M3 12h18" />
      </svg>
    ),
  },
  {
    label: "Manage Sponsors",
    description: "Activate and configure sponsor slots",
    href: "/admin/sponsors",
    icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

export default function AdminDashboardPage() {
  const [venues, setVenues] = useState<Venue[]>(mockVenues)
  const [events, setEvents] = useState<Event[]>(mockEvents)

  const pendingVenues = venues.filter((v) => v.status === "pending")
  const pendingEvents = events.filter((e) => e.status === "pending")
  const activeSponsors = mockSponsorSlots.filter((s) => s.active).length

  function approveVenue(id: string) {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: "approved" } : v)))
  }
  function rejectVenue(id: string) {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status: "rejected" } : v)))
  }
  function approveEvent(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)))
  }
  function rejectEvent(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)))
  }

  return (
    <AppShell showBottomNav={false} title="Admin - Dashboard">
      <MobileAdminNav
        title="Admin"
        links={[
          { label: "Dashboard", href: "/admin" },
          { label: "Venues", href: "/admin/venues" },
          { label: "Events", href: "/admin/events" },
          { label: "Matches", href: "/admin/matches" },
          { label: "Sponsors", href: "/admin/sponsors" },
          { label: "Cities", href: "/admin/cities" },
        ]}
      />
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">FanRush Management Console</p>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
              <p className="text-yellow-300 text-sm font-semibold">
                Admin console — Supabase authentication and role-based access are active.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Pending Venues" value={pendingVenues.length} icon="📍" color="yellow" />
              <StatCard label="Pending Events" value={pendingEvents.length} icon="🎉" color="blue" />
              <StatCard label="Total Matches" value={mockMatches.length} icon="⚽" color="green" />
              <StatCard label="Active Sponsors" value={activeSponsors} icon="📣" color="red" />
            </div>

            {/* Pending Approvals */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Venues */}
              <section>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Pending Venues</p>
                {pendingVenues.length === 0 ? (
                  <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                    <p className="text-gray-400 text-sm">No pending venues.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingVenues.slice(0, 3).map((venue) => (
                      <div key={venue.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                        <p className="text-white font-bold text-sm">{venue.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{venue.city}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Business: {venue.businessId ?? "—"}</p>
                        <p className="text-gray-500 text-xs">Matches: {venue.matchIds.length}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => approveVenue(venue.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => rejectVenue(venue.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Pending Events */}
              <section>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Pending Events</p>
                {pendingEvents.length === 0 ? (
                  <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                    <p className="text-gray-400 text-sm">No pending events.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                        <p className="text-white font-bold text-sm">{event.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => approveEvent(event.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => rejectEvent(event.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Quick Links */}
            <section>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Quick Links</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-gray-900 border border-white/10 rounded-2xl p-4 hover:border-orange-500/30 transition-all cursor-pointer group"
                  >
                    <div className="mb-2">{link.icon}</div>
                    <p className="text-white font-bold text-sm">{link.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{link.description}</p>
                    <p className="text-orange-400 text-xs mt-2 font-semibold">→</p>
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </AppShell>
  )
}
