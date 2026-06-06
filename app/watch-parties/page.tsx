"use client"

import { useState, useMemo } from "react"
import AppShell from "@/components/AppShell"
import FilterChips from "@/components/FilterChips"
import VenueCard from "@/components/VenueCard"
import EmptyState from "@/components/EmptyState"
import SponsorBanner from "@/components/SponsorBanner"
import { mockVenues, mockCities, mockTeams, mockMatches, mockSponsorSlots } from "@/lib/mock-data"

const approvedVenues = mockVenues.filter((v) => v.status === "approved")

const PRICE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Ticketed", value: "ticketed" },
]

export default function WatchPartiesPage() {
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
    if (value === "all") {
      setSelectedPrice(["all"])
      return
    }
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
    return approvedVenues.filter((venue) => {
      if (selectedCities.length > 0 && !selectedCities.includes(venue.cityId)) return false
      if (teamMatchIds !== null) {
        const hasTeamMatch = venue.matchIds.some((mid) => teamMatchIds.has(mid))
        if (!hasTeamMatch) return false
      }
      if (!selectedPrice.includes("all") && !selectedPrice.includes(venue.price)) return false
      if (familyFriendly && !venue.familyFriendly) return false
      if (bigScreen && !venue.bigScreen) return false
      if (foodAvailable && !venue.foodAvailable) return false
      return true
    })
  }, [selectedCities, teamMatchIds, selectedPrice, familyFriendly, bigScreen, foodAvailable])

  const bannerSlot = mockSponsorSlots.find((s) => s.type === "banner" && s.active)

  const toggleFilters = [
    { label: "📺 Big Screen", state: bigScreen, toggle: setBigScreen },
    { label: "👨‍👩‍👧 Family", state: familyFriendly, toggle: setFamilyFriendly },
    { label: "🍔 Food", state: foodAvailable, toggle: setFoodAvailable },
  ] as const

  return (
    <AppShell title="Watch Parties">
      <div className="max-w-2xl mx-auto">
        {/* Hero Header */}
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

        {/* Filter Section */}
        <div className="px-4 space-y-3 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
              Filter by City
            </p>
            <FilterChips options={cityOptions} selected={selectedCities} onToggle={toggleCity} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
              Filter by Team
            </p>
            <FilterChips options={teamOptions} selected={selectedTeams} onToggle={toggleTeam} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
              Price
            </p>
            <FilterChips options={PRICE_OPTIONS} selected={selectedPrice} onToggle={togglePrice} />
          </div>

          {/* Toggle filters */}
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

        {/* Results count */}
        <p className="text-gray-400 text-sm px-4 mt-4">
          {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"} found
        </p>

        {/* Venue list */}
        <div className="px-4 space-y-4 mt-4">
          {filteredVenues.length === 0 ? (
            <EmptyState
              icon="📍"
              title="No venues found"
              description="Try adjusting your filters or check back soon"
            />
          ) : (
            filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))
          )}
        </div>

        {/* Sponsor Banner */}
        <div className="px-4 pb-6 mt-6">
          <SponsorBanner slot={bannerSlot} />
        </div>
      </div>
    </AppShell>
  )
}
