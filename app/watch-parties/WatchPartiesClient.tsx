"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import FilterChips from "@/components/FilterChips"
import VenueCard from "@/components/VenueCard"
import EmptyState from "@/components/EmptyState"
import SponsorBanner from "@/components/SponsorBanner"
import { mockCities, mockTeams, mockMatches, mockSponsorSlots } from "@/lib/mock-data"
import { Venue } from "@/lib/types"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRICE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Ticketed", value: "ticketed" },
]

interface Props {
  venues: Venue[]
  usingDemo: boolean
}

export default function WatchPartiesClient({ venues, usingDemo }: Props) {
  // Auth state — null = loading, string = authed uid, "" = logged out
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(configured)

  useEffect(() => {
    async function check() {
      if (!configured) {
        // No Supabase — treat as logged in so mock data is still useful in dev
        setUserId("dev")
        setAuthLoading(false)
        return
      }
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? "")
      setAuthLoading(false)
    }
    check()
  }, [])

  // ── Filters (only used when authenticated) ──────────────────────────
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState<string[]>(["all"])
  const [familyFriendly, setFamilyFriendly] = useState(false)
  const [bigScreen, setBigScreen] = useState(false)
  const [foodAvailable, setFoodAvailable] = useState(false)

  const cityOptions = mockCities.map((c) => ({ label: c.name, value: c.id }))
  const teamOptions = mockTeams.map((t) => ({
    label: `${t.flagEmoji} ${t.shortCode}`,
    value: t.id,
  }))

  function toggleCity(value: string) {
    setSelectedCities((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }
  function toggleTeam(value: string) {
    setSelectedTeams((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    )
  }
  function togglePrice(value: string) {
    if (value === "all") { setSelectedPrice(["all"]); return }
    setSelectedPrice((prev) => {
      const without = prev.filter((p) => p !== "all")
      if (without.includes(value)) {
        const next = without.filter((p) => p !== value)
        return next.length === 0 ? ["all"] : next
      }
      return [...without, value]
    })
  }

  const teamMatchIds = useMemo(() => {
    if (selectedTeams.length === 0) return null
    return new Set(
      mockMatches
        .filter(
          (m) =>
            selectedTeams.includes(m.homeTeam.id) ||
            selectedTeams.includes(m.awayTeam.id)
        )
        .map((m) => m.id)
    )
  }, [selectedTeams])

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (selectedCities.length > 0 && !selectedCities.includes(venue.cityId)) return false
      if (teamMatchIds !== null) {
        if (!venue.matchIds.some((mid) => teamMatchIds.has(mid))) return false
      }
      if (!selectedPrice.includes("all") && !selectedPrice.includes(venue.price)) return false
      if (familyFriendly && !venue.familyFriendly) return false
      if (bigScreen && !venue.bigScreen) return false
      if (foodAvailable && !venue.foodAvailable) return false
      return true
    })
  }, [venues, selectedCities, teamMatchIds, selectedPrice, familyFriendly, bigScreen, foodAvailable])

  const bannerSlot = mockSponsorSlots.find((s) => s.type === "banner" && s.active)

  const toggleFilters = [
    { label: "📺 Big Screen", state: bigScreen, toggle: setBigScreen },
    { label: "👨‍👩‍👧 Family", state: familyFriendly, toggle: setFamilyFriendly },
    { label: "🍔 Food", state: foodAvailable, toggle: setFoodAvailable },
  ] as const

  // Preview venues shown to logged-out users (first 2, blurred)
  const previewVenues = venues.slice(0, 2)

  // ── Shared page header ───────────────────────────────────────────────
  const pageHeader = (
    <div className="bg-gradient-to-b from-orange-950/30 to-transparent px-4 pt-6 pb-4">
      <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-1">
        📍 Watch Parties
      </p>
      <h1 className="text-white font-black text-2xl leading-tight">
        Find Your Match-Day Spot
      </h1>
      <p className="text-gray-400 text-sm mt-1">
        Bars, pubs and fan zones showing live football near you
      </p>
    </div>
  )

  // ── Loading state ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        {pageHeader}
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // ── Logged-out gate ──────────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto">
        {pageHeader}

        {/* Preview cards — blurred to signal locked content */}
        {previewVenues.length > 0 && (
          <div className="px-4 space-y-4 mt-2 relative">
            <div className="pointer-events-none select-none" aria-hidden="true">
              {previewVenues.map((venue) => (
                <div key={venue.id} className="mb-4 rounded-2xl overflow-hidden">
                  <div className="blur-sm opacity-50">
                    <VenueCard venue={venue} />
                  </div>
                </div>
              ))}
            </div>

            {/* Lock overlay centred over the preview cards */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-[#0a0a0f]/70 rounded-2xl px-6 py-4 text-center">
                <span className="text-3xl">🔒</span>
                <p className="text-white font-bold text-sm mt-2">
                  {venues.length} venues available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA card */}
        <div className="mx-4 mt-6 bg-gray-900 border border-white/10 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto">
            <span className="text-2xl">📍</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Log in to find watch parties near you</p>
            <p className="text-gray-400 text-sm mt-1">
              Join FanRush to discover bars, pubs and fan zones, save your favourites, and book your spot.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/login?next=/watch-parties"
              className="w-full min-h-[44px] flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="w-full min-h-[44px] flex items-center justify-center rounded-xl border border-white/15 hover:border-white/30 text-gray-300 hover:text-white font-semibold text-sm transition-all active:scale-95"
            >
              Create Account — it&apos;s free
            </Link>
          </div>
        </div>

        {/* Sponsor still shown to logged-out users */}
        <div className="px-4 pb-6 mt-6">
          <SponsorBanner slot={bannerSlot} />
        </div>
      </div>
    )
  }

  // ── Authenticated full view ──────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {pageHeader}

      {usingDemo && (
        <div className="mx-4 mb-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5">
          <p className="text-yellow-300 text-xs font-semibold">
            Showing sample venues — connect Supabase to see live approved listings.
          </p>
        </div>
      )}

      {/* Filter Section */}
      <div className="px-4 space-y-3 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Filter by City</p>
          <FilterChips options={cityOptions} selected={selectedCities} onToggle={toggleCity} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Filter by Team</p>
          <FilterChips options={teamOptions} selected={selectedTeams} onToggle={toggleTeam} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Price</p>
          <FilterChips options={PRICE_OPTIONS} selected={selectedPrice} onToggle={togglePrice} />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {toggleFilters.map(({ label, state, toggle }) => (
            <button
              key={label}
              onClick={() => toggle((v: boolean) => !v)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                state
                  ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
                  : "bg-gray-900 border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-400 text-sm px-4 mt-4">
        {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"} found
      </p>

      <div className="px-4 space-y-4 mt-4">
        {filteredVenues.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No venues found"
            description={
              venues.length === 0
                ? "No approved venues yet — check back soon"
                : "Try adjusting your filters"
            }
          />
        ) : (
          filteredVenues.map((venue) => <VenueCard key={venue.id} venue={venue} />)
        )}
      </div>

      <div className="px-4 pb-6 mt-6">
        <SponsorBanner slot={bannerSlot} />
      </div>
    </div>
  )
}
