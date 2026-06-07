"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import PredictionCard from "@/components/PredictionCard"
import Leaderboard from "@/components/Leaderboard"
import SponsorBanner from "@/components/SponsorBanner"
import { mockMatches, mockUsers, mockLeagues, mockSponsorSlots } from "@/lib/mock-data"
import { Prediction } from "@/lib/types"
import { useToast } from "@/components/Toast"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

type Tab = "predictions" | "leaderboard" | "minileagues"
type LeaderboardEntry = { name: string; points: number; avatar?: string; rank: number }

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const mockLeaderboard: LeaderboardEntry[] = [...mockUsers]
  .sort((a, b) => b.points - a.points)
  .map((u, i) => ({ name: u.name, points: u.points, avatar: u.avatar, rank: i + 1 }))

export default function PredictionsPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>("predictions")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(configured)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardEntry[]>(mockLeaderboard)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [generatedCode] = useState(() => generateCode())
  const [joinCode, setJoinCode] = useState("")
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)

  // Auth check + load user's predictions from Supabase
  useEffect(() => {
    if (!configured) return

    async function init() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      if (user) {
        const { data } = await supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        if (data) {
          setPredictions(
            data.map((row) => ({
              id: row.id as string,
              userId: row.user_id as string,
              matchId: row.match_id as string,
              homeScore: row.home_score as number,
              awayScore: row.away_score as number,
              points: row.points != null ? (row.points as number) : undefined,
            }))
          )
        }
      }
      setAuthLoading(false)
    }

    init()
  }, [])

  // Load leaderboard from Supabase profiles
  useEffect(() => {
    if (!configured) return

    async function loadLeaderboard() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, points")
        .order("points", { ascending: false })
        .limit(20)
      if (data && data.length > 0) {
        setLeaderboardUsers(
          data.map((row, i) => ({
            name: (row.display_name as string | null) ?? "Fan",
            points: (row.points as number | null) ?? 0,
            rank: i + 1,
          }))
        )
      }
    }

    loadLeaderboard()
  }, [])

  const upcomingMatches = mockMatches.filter((m) => m.status === "upcoming")

  async function handlePredict(matchId: string, homeScore: number, awayScore: number) {
    // Optimistic local update
    setPredictions((prev) => {
      const existing = prev.findIndex((p) => p.matchId === matchId)
      const newPred: Prediction = {
        id: `local-${matchId}`,
        userId: userId ?? "local",
        matchId,
        homeScore,
        awayScore,
      }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newPred
        return updated
      }
      return [...prev, newPred]
    })

    // Persist to Supabase when authenticated
    if (configured && userId) {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase.from("predictions").upsert(
        { user_id: userId, match_id: matchId, home_score: homeScore, away_score: awayScore },
        { onConflict: "user_id,match_id" }
      )
      if (error) {
        showToast("Failed to save prediction — please try again.", "error")
      }
    }
  }

  const totalLeaderboardPoints = leaderboardUsers.reduce((acc, u) => acc + u.points, 0)
  const avgScore = leaderboardUsers.length
    ? (totalLeaderboardPoints / leaderboardUsers.length).toFixed(1)
    : "0"

  const top3 = leaderboardUsers.slice(0, 3)
  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumMedals = ["🥈", "🥇", "🥉"]
  const podiumHeights = ["h-24", "h-28", "h-20"]

  const tabs: { key: Tab; label: string }[] = [
    { key: "predictions", label: "My Predictions" },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "minileagues", label: "Mini Leagues" },
  ]

  return (
    <AppShell title="Predictions">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-1">
            🎯 Predictions
          </p>
          <h1 className="text-white font-black text-3xl leading-tight">
            Predict. Score. Win.
          </h1>
          {/* Points guide */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-yellow-500/10 text-yellow-400 rounded-full px-3 py-1.5 text-xs font-bold">
              ⚡ Exact Score = 5 pts
            </span>
            <span className="bg-orange-500/10 text-orange-400 rounded-full px-3 py-1.5 text-xs font-bold">
              ✓ Correct Result = 2 pts
            </span>
            <span className="bg-gray-800 text-gray-400 rounded-full px-3 py-1.5 text-xs font-bold">
              ✗ Wrong = 0 pts
            </span>
          </div>
          <div className="mt-4">
            <SponsorBanner slot={mockSponsorSlots[0]} />
          </div>
        </div>

        {/* Tab Bar */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 py-5 space-y-4">
          {/* My Predictions Tab */}
          {activeTab === "predictions" && (
            <div className="space-y-4">
              {/* Auth notice for unauthenticated users */}
              {!authLoading && !userId && configured && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
                  <p className="text-orange-400 font-semibold text-sm mb-1">
                    Log in to save your predictions
                  </p>
                  <p className="text-gray-400 text-xs mb-3">
                    Your score predictions are tracked locally. Sign in to compete on the leaderboard!
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-5 py-2 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              )}

              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Upcoming matches to predict
              </p>

              {authLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : upcomingMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🎉</span>
                  <p className="text-white font-bold text-lg">All caught up!</p>
                  <p className="text-gray-400 text-sm mt-1">New matches coming soon</p>
                </div>
              ) : (
                upcomingMatches.map((match) => {
                  const prediction = predictions.find((p) => p.matchId === match.id)
                  return (
                    <PredictionCard
                      key={match.id}
                      match={match}
                      prediction={prediction}
                      onPredict={(h, a) => handlePredict(match.id, h, a)}
                      disabled={match.status !== "upcoming"}
                    />
                  )
                })
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="space-y-5">
              {/* Podium */}
              {podiumOrder.length >= 2 && (
                <div className="flex items-end justify-center gap-2 pt-2">
                  {podiumOrder.map((user, i) => (
                    <div
                      key={user?.name ?? i}
                      className={`flex-1 bg-gray-900 border border-white/10 rounded-2xl p-3 text-center flex flex-col items-center justify-end ${podiumHeights[i]}`}
                    >
                      <span className="text-xl mb-1">{podiumMedals[i]}</span>
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm mb-1">
                        {user?.name?.charAt(0) ?? "?"}
                      </div>
                      <p className="text-white font-semibold text-xs truncate w-full text-center">
                        {user?.name ?? "—"}
                      </p>
                      <p className="text-yellow-400 font-black text-sm">{user?.points ?? 0}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <p className="text-gray-400 text-xs text-center">
                {leaderboardUsers.length} fan{leaderboardUsers.length !== 1 ? "s" : ""} competing · Avg {avgScore} pts
              </p>

              {/* Full leaderboard */}
              <Leaderboard users={leaderboardUsers} />
            </div>
          )}

          {/* Mini Leagues Tab */}
          {activeTab === "minileagues" && (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Your Leagues
              </p>

              {mockLeagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-gray-900 border border-white/10 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-bold">{league.name}</h3>
                    {league.sponsored && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                        Sponsored
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mb-2">
                    Code:{" "}
                    <span className="font-mono bg-gray-800 px-2 py-1 rounded text-orange-400 text-sm">
                      {league.code}
                    </span>
                  </p>
                  <p className="text-gray-400 text-xs">{league.memberIds.length} members</p>
                </div>
              ))}

              <SponsorBanner slot={{ id: "league-sponsor", name: "Join a Sponsored League", type: "league", active: true }} />

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 py-2.5 rounded-xl border border-orange-500/50 text-orange-400 hover:border-orange-500 font-bold text-sm transition-all active:scale-95"
                >
                  Create League
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl py-2.5 text-sm transition-all active:scale-95"
                >
                  Join League
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white font-bold text-lg mb-4">Create a League</h2>
            {createSuccess ? (
              <div className="text-center py-4">
                <p className="text-orange-400 font-bold text-xl mb-2">League Created!</p>
                <p className="text-gray-400 text-sm mb-3">Share this code with friends:</p>
                <p className="text-white font-mono font-black text-2xl bg-gray-800 rounded-xl px-4 py-3">
                  {generatedCode}
                </p>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateSuccess(false); setNewLeagueName("") }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <label className="block text-gray-400 text-xs mb-1">League Name</label>
                <input
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  placeholder="e.g. Office World Cup"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCreateModal(false); setNewLeagueName("") }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { if (newLeagueName.trim()) setCreateSuccess(true) }}
                    disabled={!newLeagueName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95"
                  >
                    Create
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Join League Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white font-bold text-lg mb-4">Join a League</h2>
            {joinSuccess ? (
              <div className="text-center py-4">
                <p className="text-orange-400 font-bold text-xl mb-2">Joined!</p>
                <p className="text-gray-400 text-sm">You have joined the league.</p>
                <button
                  onClick={() => { setShowJoinModal(false); setJoinSuccess(false); setJoinCode("") }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <label className="block text-gray-400 text-xs mb-1">League Code</label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. OWC2026"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-orange-500/50 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowJoinModal(false); setJoinCode("") }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { if (joinCode.trim()) setJoinSuccess(true) }}
                    disabled={!joinCode.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95"
                  >
                    Join
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
