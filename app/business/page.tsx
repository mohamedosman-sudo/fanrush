"use client"

import Link from "next/link"
import AppShell from "@/components/AppShell"
import BusinessSidebar from "@/components/BusinessSidebar"
import StatCard from "@/components/StatCard"
import { mockVenues, mockEvents } from "@/lib/mock-data"
import MobileAdminNav from "@/components/MobileAdminNav"
import { useComingSoon } from "@/components/useComingSoon"

const BIZ_ID = "biz01"

export default function BusinessPage() {
  const showComingSoon = useComingSoon()
  const myVenues = mockVenues.filter((v) => v.businessId === BIZ_ID).slice(0, 2)
  const myVenueIds = myVenues.map((v) => v.id)
  const myEvents = mockEvents.filter((e) => myVenueIds.includes(e.venueId))
  const primary = myVenues[0]

  return (
    <AppShell title="Business Portal" showBottomNav={false}>
      <MobileAdminNav
        title="Business"
        links={[
          { label: "Overview", href: "/business" },
          { label: "Add Venue", href: "/business/add-venue" },
          { label: "Add Event", href: "/business/add-event" },
        ]}
      />
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <div className="hidden md:block flex-shrink-0">
          <BusinessSidebar />
        </div>

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-white font-black text-2xl">Business Portal</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Welcome back, {primary?.name ?? "your business"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/business/add-venue"
                  className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
                >
                  + Add Venue
                </Link>
                <Link
                  href="/business/add-event"
                  className="bg-transparent border border-white/10 hover:border-orange-500/40 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
                >
                  + Add Event
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
              <p className="text-yellow-300 text-sm font-semibold">
                Business portal: Supabase authentication and role-based access are enabled. Venue and event writes may still use demo data until the business data layer is fully connected.
              </p>
            </div>

            {/* Analytics Strip */}
            {primary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Views" value={primary.views.toLocaleString("en-US")} icon="👁️" color="blue" />
                <StatCard label="Clicks" value={primary.clicks.toLocaleString("en-US")} icon="🖱️" color="green" />
                <StatCard label="Saves" value={primary.saves.toLocaleString("en-US")} icon="🔖" color="yellow" />
                <StatCard label="Bookings" value={primary.bookings.toLocaleString("en-US")} icon="🎟️" color="red" />
              </div>
            )}

            {/* Your Listings */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Your Listings</p>
                <Link href="/business/add-venue" className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">
                  + Add Venue
                </Link>
              </div>

              {myVenues.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-gray-400 text-sm mb-3">No venues yet.</p>
                  <Link
                    href="/business/add-venue"
                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm inline-block"
                  >
                    Add Your First Venue
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myVenues.map((venue) => (
                    <div key={venue.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-bold">{venue.name}</h3>
                          {venue.featured && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold border border-yellow-400/20">
                              Featured
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                              venue.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                : venue.status === "pending"
                                ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/20"
                                : "bg-red-500/15 text-red-400 border-red-500/20"
                            }`}
                          >
                            {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-3">{venue.city} · {venue.address}</p>

                      {/* Mini analytics */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { label: "Views", value: venue.views },
                          { label: "Clicks", value: venue.clicks },
                          { label: "Saves", value: venue.saves },
                          { label: "Bookings", value: venue.bookings },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-gray-800/60 rounded-xl p-2.5 text-center">
                            <p className="text-white font-bold text-sm">{stat.value}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => showComingSoon("Venue editing")}
                          className="border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => showComingSoon("Listing boost")}
                          className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all"
                        >
                          Boost
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Your Events */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Your Events</p>
                <Link href="/business/add-event" className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">
                  + Add Event
                </Link>
              </div>

              {myEvents.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-gray-400 text-sm">No events yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myEvents.map((event) => (
                    <div key={event.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-white font-bold">{event.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                event.status === "approved"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                  : event.status === "pending"
                                  ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/20"
                                  : "bg-red-500/15 text-red-400 border-red-500/20"
                              }`}
                            >
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{event.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Upgrade Banner */}
            <div className="bg-gradient-to-r from-orange-950/50 via-gray-900 to-gray-900 border border-orange-500/20 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-white font-black text-lg">⚡ Boost Your Listing Visibility</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Get featured placement, priority support, and real-time analytics.
                </p>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
              >
                See Pricing →
              </Link>
            </div>

          </div>
        </main>
      </div>
    </AppShell>
  )
}
