"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import BusinessSidebar from "@/components/BusinessSidebar"
import StatCard from "@/components/StatCard"
import { mockVenues, mockEvents } from "@/lib/mock-data"
import MobileAdminNav from "@/components/MobileAdminNav"
import { useComingSoon } from "@/components/useComingSoon"

type DisplayVenue = {
  id: string
  name: string
  city: string
  address: string
  status: "pending" | "approved" | "rejected"
  featured: boolean
  views: number
  clicks: number
  saves: number
  bookings: number
}

type DisplayEvent = {
  id: string
  name: string
  description: string
  date: string
  status: "pending" | "approved" | "rejected"
}

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function mockFallback(): { venues: DisplayVenue[]; events: DisplayEvent[] } {
  const BIZ_ID = "biz01"
  const venues = mockVenues
    .filter((v) => v.businessId === BIZ_ID)
    .slice(0, 3)
    .map((v) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      address: v.address,
      status: v.status,
      featured: v.featured,
      views: v.views,
      clicks: v.clicks,
      saves: v.saves,
      bookings: v.bookings,
    }))
  const venueIds = new Set(venues.map((v) => v.id))
  const events = mockEvents
    .filter((e) => venueIds.has(e.venueId))
    .map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      date: e.date,
      status: e.status,
    }))
  return { venues, events }
}

export default function BusinessPage() {
  const showComingSoon = useComingSoon()

  const [venues, setVenues] = useState<DisplayVenue[]>(() =>
    configured ? [] : mockFallback().venues
  )
  const [events, setEvents] = useState<DisplayEvent[]>(() =>
    configured ? [] : mockFallback().events
  )
  const [loading, setLoading] = useState(configured)
  const [usingDemo, setUsingDemo] = useState(!configured)

  useEffect(() => {
    if (!configured) return

    async function loadData() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          const { venues: v, events: ev } = mockFallback()
          setVenues(v); setEvents(ev); setUsingDemo(true)
          setLoading(false)
          return
        }

        // Load owned venues.
        const { data: venueData, error: venueErr } = await supabase
          .from("venues")
          .select("id, name, city_id, cities(name), address, status, featured, views, clicks, saves, bookings")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })

        if (venueErr || !venueData) {
          console.warn("[business/page] venues error", venueErr)
          const { venues: v, events: ev } = mockFallback()
          setVenues(v); setEvents(ev); setUsingDemo(true)
          setLoading(false)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedVenues: DisplayVenue[] = (venueData as any[]).map((v) => ({
          id: v.id,
          name: v.name,
          city: v.cities?.name ?? v.city_id ?? "—",
          address: v.address ?? "—",
          status: v.status ?? "pending",
          featured: v.featured ?? false,
          views: v.views ?? 0,
          clicks: v.clicks ?? 0,
          saves: v.saves ?? 0,
          bookings: v.bookings ?? 0,
        }))

        setVenues(mappedVenues)

        // Load events for owned venues.
        if (mappedVenues.length > 0) {
          const venueIds = mappedVenues.map((v) => v.id)
          const { data: eventData, error: eventErr } = await supabase
            .from("events")
            .select("id, title, description, event_date, status")
            .in("venue_id", venueIds)
            .order("event_date", { ascending: true })

          if (!eventErr && eventData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setEvents((eventData as any[]).map((e) => ({
              id: e.id,
              name: e.title,
              description: e.description ?? "",
              date: e.event_date ?? "",
              status: e.status ?? "pending",
            })))
          }
        }
      } catch (err) {
        console.error("[business/page] unexpected error", err)
        const { venues: v, events: ev } = mockFallback()
        setVenues(v); setEvents(ev); setUsingDemo(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const primary = venues[0]

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
                  Welcome back{primary ? `, ${primary.name}` : ""}
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

            {usingDemo && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                <p className="text-yellow-300 text-sm font-semibold">
                  Demo data — connect Supabase and log in as a business user to see your live venues and events.
                </p>
              </div>
            )}

            {/* Analytics Strip */}
            {!loading && primary && (
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

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-4 animate-pulse h-28" />
                  ))}
                </div>
              ) : venues.length === 0 ? (
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
                  {venues.map((venue) => (
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
                        <Link
                          href={`/business/venues/${venue.id}/edit`}
                          className="border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all"
                        >
                          Edit
                        </Link>
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

              {loading ? (
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 animate-pulse h-20" />
              ) : events.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-gray-400 text-sm">No events yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
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
                          {event.date && (
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
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/business/events/${event.id}/edit`}
                          className="border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all"
                        >
                          Edit
                        </Link>
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
