"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import BusinessSidebar from "@/components/BusinessSidebar"
import StatCard from "@/components/StatCard"
import { mockVenues, mockEvents } from "@/lib/mock-data"
import MobileAdminNav from "@/components/MobileAdminNav"
import { useComingSoon } from "@/components/useComingSoon"
import { BUSINESS_NAV_LINKS } from "@/lib/business-nav-links"

type LoadMode = "loading" | "live" | "empty" | "preview" | "error"

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
  rejection_reason?: string | null
}

type DisplayEvent = {
  id: string
  name: string
  description: string
  date: string
  status: "pending" | "approved" | "rejected"
  rejection_reason?: string | null
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

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles =
    status === "approved"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      : status === "pending"
      ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/20"
      : "bg-red-500/15 text-red-400 border-red-500/20"
  const icons = { approved: "✓", pending: "⏳", rejected: "✕" }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${styles}`}>
      <span>{icons[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function RejectionNote({ reason }: { reason?: string | null }) {
  if (!reason) return null
  return (
    <div className="mt-3 p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
      <p className="text-red-400 text-xs font-semibold mb-0.5">Rejection reason</p>
      <p className="text-red-300 text-xs leading-relaxed">{reason}</p>
    </div>
  )
}

function NextActionHint({ status, editHref }: { status: "pending" | "approved" | "rejected"; editHref: string }) {
  if (status === "pending") {
    return (
      <p className="text-yellow-400/70 text-xs mt-2">
        Under review — no action needed. We&apos;ll notify you once approved.
      </p>
    )
  }
  if (status === "rejected") {
    return (
      <Link
        href={editHref}
        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition-all touch-manipulation"
      >
        Edit &amp; resubmit →
      </Link>
    )
  }
  return null
}

export default function BusinessPage() {
  const showComingSoon = useComingSoon()

  const [venues, setVenues] = useState<DisplayVenue[]>([])
  const [events, setEvents] = useState<DisplayEvent[]>([])
  const [loadMode, setLoadMode] = useState<LoadMode>(configured ? "loading" : "preview")

  useEffect(() => {
    if (!configured) return

    async function loadData() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) {
          setLoadMode("preview")
          const { venues: v, events: ev } = mockFallback()
          setVenues(v); setEvents(ev)
          return
        }

        // First try with city join; fall back to plain city_id if relation missing.
        let venueData: unknown[] | null = null
        let venueErr: { message: string } | null = null

        const withJoin = await supabase
          .from("venues")
          .select("id, name, city_id, cities(name), address, status, featured, views, clicks, saves, bookings, rejection_reason")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })

        if (withJoin.error) {
          // Retry without the city join in case the FK alias differs.
          const plain = await supabase
            .from("venues")
            .select("id, name, city_id, address, status, featured, views, clicks, saves, bookings, rejection_reason")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false })
          venueData = plain.data ?? null
          venueErr = plain.error
        } else {
          venueData = withJoin.data ?? null
          venueErr = withJoin.error
        }

        if (venueErr) {
          console.warn("[business/page] venues error:", venueErr.message)
          setLoadMode("error")
          return
        }
        // venueData is null only if both queries returned null without an error — treat as empty.
        if (!venueData) {
          setLoadMode("empty")
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedVenues: DisplayVenue[] = (venueData as any[]).map((v) => ({
          id: v.id,
          name: v.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          city: (v.cities as any)?.name ?? v.city_id ?? "—",
          address: v.address ?? "—",
          status: v.status ?? "pending",
          featured: v.featured ?? false,
          views: v.views ?? 0,
          clicks: v.clicks ?? 0,
          saves: v.saves ?? 0,
          bookings: v.bookings ?? 0,
          rejection_reason: v.rejection_reason ?? null,
        }))

        setVenues(mappedVenues)

        if (mappedVenues.length > 0) {
          const venueIds = mappedVenues.map((v) => v.id)
          const { data: eventData, error: eventErr } = await supabase
            .from("events")
            .select("id, title, description, event_date, status, rejection_reason")
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
              rejection_reason: e.rejection_reason ?? null,
            })))
          }
        }

        setLoadMode(mappedVenues.length === 0 ? "empty" : "live")
      } catch (err) {
        console.error("[business/page] unexpected error", err)
        setLoadMode("error")
      }
    }

    loadData()
  }, [])

  const loading = loadMode === "loading"
  const usingPreview = loadMode === "preview"
  const hasError = loadMode === "error"

  // When in preview mode, use mock data for display only
  const displayVenues = usingPreview ? mockFallback().venues : venues
  const displayEvents = usingPreview ? mockFallback().events : events

  const primary = displayVenues[0]

  // Status breakdown
  const venueCounts = {
    approved: displayVenues.filter((v) => v.status === "approved").length,
    pending: displayVenues.filter((v) => v.status === "pending").length,
    rejected: displayVenues.filter((v) => v.status === "rejected").length,
  }
  const eventCounts = {
    approved: displayEvents.filter((e) => e.status === "approved").length,
    pending: displayEvents.filter((e) => e.status === "pending").length,
    rejected: displayEvents.filter((e) => e.status === "rejected").length,
  }
  const hasRejected = venueCounts.rejected > 0 || eventCounts.rejected > 0
  const hasPending = venueCounts.pending > 0 || eventCounts.pending > 0

  return (
    <AppShell title="Business Portal" showBottomNav={false}>
      <MobileAdminNav title="Business" links={BUSINESS_NAV_LINKS} />
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <div className="hidden md:block flex-shrink-0">
          <BusinessSidebar />
        </div>

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-8">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-white font-black text-2xl">Business Portal</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {primary ? `Managing ${venues.length} venue${venues.length !== 1 ? "s" : ""}` : "Manage your venues and events"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/business/add-venue"
                  className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm touch-manipulation"
                >
                  + Add Venue
                </Link>
                <Link
                  href="/business/add-event"
                  className="bg-transparent border border-white/10 hover:border-orange-500/40 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm touch-manipulation"
                >
                  + Add Event
                </Link>
              </div>
            </div>

            {usingPreview && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                <p className="text-yellow-300 text-sm font-semibold">
                  Preview mode — example data shown. Connect Supabase and log in as a business user to manage live listings.
                </p>
              </div>
            )}

            {hasError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                <p className="text-red-300 text-sm font-semibold">
                  Unable to load your listings. Check your connection and try refreshing.
                </p>
              </div>
            )}

            {/* Action alerts */}
            {!loading && hasRejected && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-4 flex items-start gap-3">
                <span className="text-red-400 text-xl flex-shrink-0">⚠</span>
                <div>
                  <p className="text-red-300 font-bold text-sm">Action required</p>
                  <p className="text-red-400/80 text-xs mt-0.5">
                    Some listings were rejected. Review the reason below and edit &amp; resubmit.
                  </p>
                </div>
              </div>
            )}
            {!loading && !hasRejected && hasPending && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-3">
                <span className="text-yellow-400">⏳</span>
                <p className="text-yellow-300 text-sm">
                  Some listings are under review — we&apos;ll notify you once they&apos;re approved.
                </p>
              </div>
            )}

            {/* Status summary */}
            {!loading && displayVenues.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-white font-black text-2xl">{displayVenues.length}</p>
                  <p className="text-gray-400 text-xs mt-1">Total Venues</p>
                  <div className="flex justify-center gap-2 mt-2 flex-wrap">
                    {venueCounts.approved > 0 && <span className="text-emerald-400 text-xs font-semibold">{venueCounts.approved} live</span>}
                    {venueCounts.pending > 0 && <span className="text-yellow-400 text-xs font-semibold">{venueCounts.pending} pending</span>}
                    {venueCounts.rejected > 0 && <span className="text-red-400 text-xs font-semibold">{venueCounts.rejected} rejected</span>}
                  </div>
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-white font-black text-2xl">{displayEvents.length}</p>
                  <p className="text-gray-400 text-xs mt-1">Total Events</p>
                  <div className="flex justify-center gap-2 mt-2 flex-wrap">
                    {eventCounts.approved > 0 && <span className="text-emerald-400 text-xs font-semibold">{eventCounts.approved} live</span>}
                    {eventCounts.pending > 0 && <span className="text-yellow-400 text-xs font-semibold">{eventCounts.pending} pending</span>}
                    {eventCounts.rejected > 0 && <span className="text-red-400 text-xs font-semibold">{eventCounts.rejected} rejected</span>}
                  </div>
                </div>
                {primary && (
                  <div className="bg-gray-900 border border-white/10 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                    <p className="text-white font-black text-2xl">{primary.views + primary.clicks + primary.saves}</p>
                    <p className="text-gray-400 text-xs mt-1">Total Engagement</p>
                    <p className="text-gray-500 text-xs mt-1">{primary.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Strip */}
            {!loading && primary && primary.status === "approved" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                    {primary.name} — Analytics
                  </p>
                  {usingPreview && (
                    <span className="text-xs text-yellow-400 font-semibold bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                      Example data
                    </span>
                  )}
                  {!usingPreview && (primary.views + primary.clicks + primary.saves + primary.bookings === 0) && (
                    <span className="text-xs text-gray-500 font-medium">
                      Activity will appear once fans engage with your venue
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Views" value={primary.views.toLocaleString("en-US")} icon="👁️" color="blue" />
                  <StatCard label="Clicks" value={primary.clicks.toLocaleString("en-US")} icon="🖱️" color="green" />
                  <StatCard label="Saves" value={primary.saves.toLocaleString("en-US")} icon="🔖" color="yellow" />
                  <StatCard label="Bookings" value={primary.bookings.toLocaleString("en-US")} icon="🎟️" color="red" />
                </div>
              </div>
            )}

            {/* Your Venues */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Your Venues</p>
                <Link href="/business/add-venue" className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors touch-manipulation">
                  + Add Venue
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-4 animate-pulse h-28" />
                  ))}
                </div>
              ) : !usingPreview && !hasError && displayVenues.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/20 rounded-2xl p-10 text-center">
                  <p className="text-3xl mb-3">🏟️</p>
                  <p className="text-white font-bold mb-1">No venues yet</p>
                  <p className="text-gray-400 text-sm mb-4">
                    List your first venue to appear in FanRush watch parties.
                  </p>
                  <Link
                    href="/business/add-venue"
                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-6 py-2.5 transition-all text-sm inline-block touch-manipulation"
                  >
                    Add Your First Venue →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className={`bg-gray-900 border rounded-2xl p-4 ${
                        venue.status === "rejected"
                          ? "border-red-500/30"
                          : venue.status === "pending"
                          ? "border-yellow-400/20"
                          : "border-white/10"
                      }`}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-bold">{venue.name}</h3>
                          {venue.featured && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold border border-yellow-400/20">
                              Featured
                            </span>
                          )}
                          <StatusBadge status={venue.status} />
                          {usingPreview && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-500 text-xs border border-yellow-400/20">
                              Preview only
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-3">{venue.city} · {venue.address}</p>

                      {/* Mini analytics — only meaningful when approved and live */}
                      {venue.status === "approved" && !usingPreview && (
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
                      )}

                      {/* Rejection reason + resubmit CTA — only for live data */}
                      {!usingPreview && (
                        <>
                          <RejectionNote reason={venue.rejection_reason} />
                          <NextActionHint status={venue.status} editHref={`/business/venues/${venue.id}/edit`} />
                        </>
                      )}

                      {/* Actions — Edit only available for live owned resources */}
                      {!usingPreview && (
                        <div className="flex gap-2 mt-3">
                          <Link
                            href={`/business/venues/${venue.id}/edit`}
                            className="border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all touch-manipulation"
                          >
                            Edit
                          </Link>
                          {venue.status === "approved" && (
                            <button
                              onClick={() => showComingSoon("Listing boost")}
                              className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all touch-manipulation"
                            >
                              Boost
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Your Events */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Your Events</p>
                <Link href="/business/add-event" className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors touch-manipulation">
                  + Add Event
                </Link>
              </div>

              {loading ? (
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 animate-pulse h-20" />
              ) : !usingPreview && !hasError && displayEvents.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/20 rounded-2xl p-10 text-center">
                  <p className="text-3xl mb-3">📅</p>
                  <p className="text-white font-bold mb-1">No events yet</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Create your first event for matchday fans.
                  </p>
                  <Link
                    href="/business/add-event"
                    className="border border-white/20 hover:border-orange-500/40 text-white font-bold rounded-xl px-6 py-2.5 transition-all text-sm inline-block touch-manipulation"
                  >
                    Add Your First Event →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`bg-gray-900 border rounded-2xl p-4 ${
                        event.status === "rejected"
                          ? "border-red-500/30"
                          : event.status === "pending"
                          ? "border-yellow-400/20"
                          : "border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-white font-bold">{event.name}</h3>
                            <StatusBadge status={event.status} />
                            {usingPreview && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-500 text-xs border border-yellow-400/20">
                                Preview only
                              </span>
                            )}
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

                      {!usingPreview && (
                        <>
                          <RejectionNote reason={event.rejection_reason} />
                          <NextActionHint status={event.status} editHref={`/business/events/${event.id}/edit`} />
                          <div className="flex gap-2 mt-3">
                            <Link
                              href={`/business/events/${event.id}/edit`}
                              className="border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-4 py-2 text-xs transition-all touch-manipulation"
                            >
                              Edit
                            </Link>
                          </div>
                        </>
                      )}
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
                href="/business/pricing"
                className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm touch-manipulation"
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
