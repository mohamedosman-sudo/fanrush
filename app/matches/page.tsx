"use client"

import { useState, useMemo } from "react"
import AppShell from "@/components/AppShell"
import FilterChips from "@/components/FilterChips"
import MatchCard from "@/components/MatchCard"
import EmptyState from "@/components/EmptyState"
import { mockMatches, mockCities } from "@/lib/mock-data"

const STAGES = ["All", "Group Stage", "Round of 16", "Quarter-Final", "Semi-Final", "Final"]

function groupMatchesByDate(matches: typeof mockMatches) {
  const groups: Record<string, typeof mockMatches> = {}
  for (const match of matches) {
    const dateKey = new Date(match.kickoffTime).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(match)
  }
  return groups
}

export default function MatchesPage() {
  const [selectedStages, setSelectedStages] = useState<string[]>(["All"])
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  const stageOptions = STAGES.map((s) => ({ label: s, value: s }))
  const cityOptions = mockCities.map((c) => ({ label: c.name, value: c.id }))

  function toggleStage(value: string) {
    if (value === "All") {
      setSelectedStages(["All"])
      return
    }
    setSelectedStages((prev) => {
      const without = prev.filter((s) => s !== "All")
      if (without.includes(value)) {
        const next = without.filter((s) => s !== value)
        return next.length === 0 ? ["All"] : next
      }
      return [...without, value]
    })
  }

  function toggleCity(value: string) {
    setSelectedCities((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }

  const filteredMatches = useMemo(() => {
    return mockMatches.filter((match) => {
      const stageOk = selectedStages.includes("All") || selectedStages.includes(match.stage)
      const cityOk = selectedCities.length === 0 || selectedCities.includes(match.cityId)
      return stageOk && cityOk
    })
  }, [selectedStages, selectedCities])

  const grouped = useMemo(() => groupMatchesByDate(filteredMatches), [filteredMatches])
  const dateGroups = Object.entries(grouped)

  return (
    <AppShell title="Matches">
      {/* 1. FILTER BAR */}
      <div className="sticky top-14 z-20 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 py-3 px-4 space-y-2">
        <FilterChips
          options={stageOptions}
          selected={selectedStages}
          onToggle={toggleStage}
        />
        <FilterChips
          options={cityOptions}
          selected={selectedCities}
          onToggle={toggleCity}
        />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* 2. MATCH COUNT */}
        <p className="text-gray-400 text-sm px-4 mt-4">
          {filteredMatches.length} {filteredMatches.length === 1 ? "match" : "matches"}
        </p>

        {/* 3. MATCH LIST */}
        <div className="px-4 pb-6">
          {dateGroups.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon="🔍"
                title="No matches found"
                description="Try adjusting your stage or city filters to see more matches."
              />
            </div>
          ) : (
            dateGroups.map(([dateLabel, matches]) => (
              <section key={dateLabel}>
                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-3 mt-6">
                  {dateLabel}
                </p>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
