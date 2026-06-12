"use client"

import { useState, useEffect } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import MobileAdminNav from "@/components/MobileAdminNav"
import EmptyState from "@/components/EmptyState"
import { mockVenues } from "@/lib/mock-data"
import { useToast } from "@/components/Toast"

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Venues", href: "/admin/venues" },
  { label: "Events", href: "/admin/events" },
  { label: "Matches", href: "/admin/matches" },
  { label: "Sponsors", href: "/admin/sponsors" },
  { label: "Launch", href: "/admin/launch" },
]

type Tab = "pending" | "approved" | "rejected"

const TABS: { label: string; value: Tab }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
]

type VenueRow = {
  id: string
  name: string
  city: string
  ownerId: string
  capacity: number | null
  price: "free" | "ticketed"
  status: "pending" | "approved" | "rejected"
  featured: boolean
}

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function toVenueRow(v: (typeof mockVenues)[number]): VenueRow {
  return {
    id: v.id,
    name: v.name,
    city: v.city,
    ownerId: v.businessId ?? "—",
    capacity: v.capacity,
    price: v.price,
    status: v.status,
    featured: v.featured,
  }
}

export default function AdminVenuesPage() {
  const { showToast } = useToast()
  const [venues, setVenues] = useState<VenueRow[]>(() =>
    configured ? [] : mockVenues.map(toVenueRow)
  )
  const [loading, setLoading] = useState(configured)
  const [activeTab, setActiveTab] = useState<Tab>("pending")

  useEffect(() => {
    if (!configured) return

    async function loadVenues() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data, error } = await supabase
          .from("venues")
          .select("id, name, city_id, cities(name), owner_id, capacity, price_type, status, featured")
          .order("created_at", { ascending: false })

        if (error || !data) {
          console.warn("[admin/venues] load error", error)
          setVenues(mockVenues.map(toVenueRow))
          setLoading(false)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setVenues((data as any[]).map((v) => ({
          id: v.id,
          name: v.name,
          city: v.cities?.name ?? v.city_id ?? "—",
          ownerId: v.owner_id ? `${(v.owner_id as string).slice(0, 8)}…` : "—",
          capacity: v.capacity ?? null,
          price: (v.price_type ?? "free") as "free" | "ticketed",
          status: (v.status ?? "pending") as Tab,
          featured: v.featured ?? false,
        })))
      } catch (err) {
        console.error("[admin/venues] unexpected error", err)
        setVenues(mockVenues.map(toVenueRow))
      } finally {
        setLoading(false)
      }
    }

    loadVenues()
  }, [])

  async function updateStatus(id: string, status: "approved" | "rejected") {
    // Optimistic update.
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)))

    if (!configured) return

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase.from("venues").update({ status }).eq("id", id)
      if (error) {
        console.error("[admin/venues] status update error", error)
        showToast(`Failed to ${status === "approved" ? "approve" : "reject"} venue.`, "error")
        // Revert optimistic update.
        setVenues((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, status: status === "approved" ? "rejected" : "pending" } : v
          )
        )
        return
      }
      showToast(
        status === "approved" ? "Venue approved and now live." : "Venue rejected.",
        status === "approved" ? "success" : "info"
      )
    } catch (err) {
      console.error("[admin/venues] unexpected update error", err)
      showToast("Something went wrong. Please try again.", "error")
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    const featured = !currentFeatured
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, featured } : v)))

    if (!configured) return

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase.from("venues").update({ featured }).eq("id", id)
      if (error) {
        console.error("[admin/venues] feature toggle error", error)
        showToast("Failed to update featured status.", "error")
        setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, featured: currentFeatured } : v)))
        return
      }
      showToast(featured ? "Venue is now featured." : "Venue removed from featured.", "success")
    } catch (err) {
      console.error("[admin/venues] unexpected feature error", err)
      showToast("Something went wrong.", "error")
    }
  }

  const filtered = venues.filter((v) => v.status === activeTab)

  return (
    <AppShell showBottomNav={false} title="Admin - Venues">
      <MobileAdminNav title="Admin" links={ADMIN_LINKS} />
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">

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
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
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
                          <span>Owner: {venue.ownerId}</span>
                          {venue.capacity != null && <span>Cap: {venue.capacity}</span>}
                          <span className="capitalize">{venue.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(venue.id, "approved")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => updateStatus(venue.id, "rejected")}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {activeTab === "approved" && (
                          <button
                            onClick={() => toggleFeatured(venue.id, venue.featured)}
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
                            onClick={() => updateStatus(venue.id, "approved")}
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
