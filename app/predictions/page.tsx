"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import PredictionCard from "@/components/PredictionCard"
import Leaderboard from "@/components/Leaderboard"
import SponsorBanner from "@/components/SponsorBanner"
import { mockMatches, mockUsers, mockSponsorSlots } from "@/lib/mock-data"
import MiniLeagues from "@/components/MiniLeagues"
import TournamentPicksSection from "@/components/TournamentPicksSection"
import { Prediction } from "@/lib/types"
import { useToast } from "@/components/Toast"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

type Tab = "predictions" | "leaderboard" | "leagues"
type LeaderboardEntry = { name: string; points: number; avatar?: string; rank: number }


const mockLeaderboard: LeaderboardEntry[] = [...mockUsers]
  .sort((a, b) => b.points - a.points)
  .map((u, i) => ({ name: u.name, points: u.points, avatar: u.avatar, rank: i + 1 }))

export default function PredictionsPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>("predictions")
  const [initialJoinCode, setInitialJoinCode] = useState("")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(configured)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardEntry[]>(mockLeaderboard)


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

  // Read ?join= invite code from URL on mount and switch to Leagues tab
  useEffect(() => {
    async function readJoin() {
      const params = new URLSearchParams(window.location.search)
      const join = params.get("join")
      if (join) {
        setActiveTab("leagues")
        setInitialJoinCode(join.toUpperCase())
      }
    }
    readJoin()
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

  async function handlePredict(matchId: string, homeScore: number, awayScore: number): Promise<void> {
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
    { key: "leagues", label: "Leagues" },
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
                    href="/login?next=/predictions"
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
                      isAuthenticated={!!userId}
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

          {/* Leagues Tab */}
          {activeTab === "leagues" && (
            <div className="space-y-8">
              <MiniLeagues userId={userId} initialJoinCode={initialJoinCode} />
              <SponsorBanner slot={{ id: "league-sponsor", name: "Join a Sponsored League", type: "league", active: true }} />
              <TournamentPicksSection userId={userId} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
