"use client"

import { useState } from "react"
import AdminShell from "@/components/AdminShell"
import FilterChips from "@/components/FilterChips"
import { mockMatches } from "@/lib/mock-data"
import { Match } from "@/lib/types"

type MatchStatus = "upcoming" | "live" | "finished"

interface MatchEdit {
  homeScore: number
  awayScore: number
  status: MatchStatus
}

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Live", value: "live" },
  { label: "Finished", value: "finished" },
]

const statusBadge: Record<MatchStatus, string> = {
  upcoming: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  finished: "bg-gray-700/50 text-gray-400 border-gray-600/50",
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>(mockMatches)
  const [filter, setFilter] = useState<string>("all")
  const [editing, setEditing] = useState<Record<string, MatchEdit>>({})
  const [openEdit, setOpenEdit] = useState<string | null>(null)

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter)

  const counts = {
    upcoming: matches.filter((m) => m.status === "upcoming").length,
    live: matches.filter((m) => m.status === "live").length,
    finished: matches.filter((m) => m.status === "finished").length,
  }

  function startEdit(match: Match) {
    if (!editing[match.id]) {
      setEditing((prev) => ({
        ...prev,
        [match.id]: {
          homeScore: match.homeScore ?? 0,
          awayScore: match.awayScore ?? 0,
          status: match.status,
        },
      }))
    }
    setOpenEdit(openEdit === match.id ? null : match.id)
  }

  function updateEdit(id: string, field: keyof MatchEdit, value: string | number) {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  function saveEdit(id: string) {
    const edit = editing[id]
    if (!edit) return
    setMatches((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, homeScore: edit.homeScore, awayScore: edit.awayScore, status: edit.status }
          : m
      )
    )
    setOpenEdit(null)
  }

  const chipOptions = STATUS_OPTIONS.map((o) => {
    if (o.value === "all") return o
    return { ...o, label: `${o.label} (${counts[o.value as MatchStatus]})` }
  })

  return (
    <AdminShell title="Admin - Matches">
          <div className="max-w-4xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Match Management</h1>
              <p className="text-gray-400 text-sm mt-1">{matches.length} total matches</p>
            </div>

            {/* Filter Chips */}
            <FilterChips
              options={chipOptions}
              selected={[filter]}
              onToggle={(v) => setFilter(v)}
            />

            {/* Match List */}
            <div className="space-y-2">
              {filtered.map((match) => {
                const isOpen = openEdit === match.id
                const edit = editing[match.id] ?? {
                  homeScore: match.homeScore ?? 0,
                  awayScore: match.awayScore ?? 0,
                  status: match.status,
                }

                return (
                  <div key={match.id} className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Teams */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-white font-bold">
                              {match.homeTeam.flagEmoji} {match.homeTeam.shortCode}
                            </span>
                            {match.homeScore !== undefined && match.awayScore !== undefined ? (
                              <span className="text-orange-400 font-black text-lg mx-1">
                                {match.homeScore} – {match.awayScore}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm mx-1">vs</span>
                            )}
                            <span className="text-white font-bold">
                              {match.awayTeam.shortCode} {match.awayTeam.flagEmoji}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusBadge[match.status]}`}
                            >
                              {match.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">{match.stadium} · {match.city} · {match.stage}</p>
                          {match.status === "upcoming" && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {new Date(match.kickoffTime).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "UTC",
                                timeZoneName: "short",
                              })}
                            </p>
                          )}
                        </div>

                        {/* Update Score button */}
                        <button
                          onClick={() => startEdit(match)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isOpen
                              ? "text-gray-400 border-white/10 hover:text-white"
                              : "text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                          }`}
                        >
                          {isOpen ? "Cancel" : "Update Score"}
                        </button>
                      </div>
                    </div>

                    {/* Inline editor */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-3 border-t border-white/5 bg-gray-800/40">
                        <div className="flex flex-wrap gap-3 items-end">
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                              {match.homeTeam.shortCode}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={edit.homeScore}
                              onChange={(e) => updateEdit(match.id, "homeScore", parseInt(e.target.value) || 0)}
                              className="w-20 bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                              {match.awayTeam.shortCode}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={edit.awayScore}
                              onChange={(e) => updateEdit(match.id, "awayScore", parseInt(e.target.value) || 0)}
                              className="w-20 bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                              Status
                            </label>
                            <select
                              value={edit.status}
                              onChange={(e) => updateEdit(match.id, "status", e.target.value)}
                              className="bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="finished">Finished</option>
                            </select>
                          </div>
                          <button
                            onClick={() => saveEdit(match.id)}
                            className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-4 py-2 text-sm transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setOpenEdit(null)}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
    </AdminShell>
  )
}
