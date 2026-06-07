"use client"

import { useState, useEffect } from "react"
import AppShell from "@/components/AppShell"
import FanPassportCard from "@/components/FanPassportCard"
import MatchCard from "@/components/MatchCard"
import VenueCard from "@/components/VenueCard"
import Badge from "@/components/Badge"
import EmptyState from "@/components/EmptyState"
import { currentUser, mockMatches, mockVenues, mockTeams } from "@/lib/mock-data"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import { Prediction, User } from "@/lib/types"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

type ProfileTab = "overview" | "predictions" | "saved" | "badges"
type SavedSubTab = "matches" | "venues"

const ALL_BADGES = [
  { name: "First Prediction", icon: "🎯", description: "Make your first prediction" },
  { name: "Matchday Regular", icon: "📅", description: "Make 5+ predictions" },
  { name: "Venue Explorer", icon: "📍", description: "Save a venue" },
  { name: "Correct Score", icon: "⚡", description: "Get an exact score right" },
  { name: "Super Fan", icon: "🏆", description: "Reach 20+ points" },
]

/** Build a User object merging real Supabase data with localStorage and mock defaults. */
function buildUser(opts: {
  id: string
  name: string
  email: string
  points: number
  predictions: Prediction[]
}): User {
  const savedVenues = storage.get<string[]>(STORAGE_KEYS.SAVED_VENUES, currentUser.savedVenues)
  const savedMatches = storage.get<string[]>(STORAGE_KEYS.SAVED_MATCHES, currentUser.savedMatches)
  return {
    ...currentUser,
    id: opts.id,
    name: opts.name,
    email: opts.email,
    points: opts.points,
    predictions: opts.predictions,
    savedVenues,
    savedMatches,
  }
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview")
  const [savedSubTab, setSavedSubTab] = useState<SavedSubTab>("matches")
  const [user, setUser] = useState<User>(() => {
    // Start with the mock user; override with real data once loaded
    const savedVenues = storage.get<string[]>(STORAGE_KEYS.SAVED_VENUES, currentUser.savedVenues)
    const savedMatches = storage.get<string[]>(STORAGE_KEYS.SAVED_MATCHES, currentUser.savedMatches)
    const storedPreds = storage.get<Record<string, { homeScore: number; awayScore: number; points?: number }>>(
      STORAGE_KEYS.PREDICTIONS, {}
    )
    const localPredictions: Prediction[] = Object.entries(storedPreds).map(([matchId, v]) => ({
      id: `local-${matchId}`,
      userId: "local",
      matchId,
      homeScore: v.homeScore,
      awayScore: v.awayScore,
      points: v.points,
    }))
    return {
      ...currentUser,
      savedVenues,
      savedMatches,
      predictions: localPredictions.length > 0 ? localPredictions : currentUser.predictions,
    }
  })
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) return

    async function loadProfile() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setLoading(false)
        return
      }

      // Load profile + predictions in parallel
      const [profileRes, predsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, points")
          .eq("id", authUser.id)
          .single(),
        supabase
          .from("predictions")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false }),
      ])

      const profile = profileRes.data as { display_name: string | null; points: number | null } | null
      const predsData = predsRes.data ?? []

      const realPredictions: Prediction[] = predsData.map((row) => ({
        id: row.id as string,
        userId: row.user_id as string,
        matchId: row.match_id as string,
        homeScore: row.home_score as number,
        awayScore: row.away_score as number,
        points: row.points != null ? (row.points as number) : undefined,
      }))

      setUser(
        buildUser({
          id: authUser.id,
          name: profile?.display_name ?? authUser.email?.split("@")[0] ?? currentUser.name,
          email: authUser.email ?? currentUser.email,
          points: profile?.points ?? 0,
          predictions: realPredictions,
        })
      )
      setLoading(false)
    }

    loadProfile()
  }, [])

  const savedMatches = mockMatches.filter((m) => user.savedMatches.includes(m.id))
  const savedVenues = mockVenues.filter((v) => user.savedVenues.includes(v.id))
  const correctScores = user.predictions.filter((p) => p.points === 5).length
  const favouriteTeams = mockTeams.filter((t) => user.favouriteTeams.includes(t.id))

  const userCity = (() => {
    const cityMap: Record<string, string> = {
      nyc: "New York / New Jersey",
      lax: "Los Angeles",
      dal: "Dallas",
      mia: "Miami",
      atl: "Atlanta",
      sea: "Seattle",
      tor: "Toronto",
      gdl: "Guadalajara",
    }
    return cityMap[user.cityId] ?? user.cityId
  })()

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "predictions", label: "Predictions" },
    { key: "saved", label: "Saved" },
    { key: "badges", label: "Badges" },
  ]

  const statsStrip = [
    { value: user.points, label: "Points" },
    { value: user.predictions.length, label: "Predictions" },
    { value: correctScores, label: "Correct Scores" },
    { value: user.savedVenues.length, label: "Venues Saved" },
  ]

  return (
    <AppShell title="Fan Passport">
      <div className="max-w-2xl mx-auto">
        {/* Profile Hero */}
        <div className="px-4 pt-5 pb-0">
          {loading ? (
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <FanPassportCard user={user} />
          )}

          {/* Stats strip */}
          <div className="flex border-t border-white/5 pt-4 mt-4">
            {statsStrip.map((stat, i) => (
              <div key={stat.label} className={`flex-1 text-center ${i > 0 ? "border-l border-white/5" : ""}`}>
                <p className="text-white font-black text-xl">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 mt-4">
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Favourite Teams */}
              {favouriteTeams.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Favourite Teams
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {favouriteTeams.map((team) => (
                      <span
                        key={team.id}
                        className="bg-gray-900 border border-white/10 rounded-full px-4 py-2 text-white text-sm flex items-center gap-2"
                      >
                        <span>{team.flagEmoji}</span>
                        <span>{team.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* My City */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  My City
                </p>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-3">
                  <p className="text-white font-semibold text-sm">📍 {userCity}</p>
                </div>
              </div>
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === "predictions" && (
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user.predictions.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="No predictions yet"
                  description="Head to the Predictions tab and make your first score prediction!"
                  action={{ label: "Make a Prediction", href: "/predictions" }}
                />
              ) : (
                user.predictions.map((pred) => {
                  const match = mockMatches.find((m) => m.id === pred.matchId)
                  if (!match) return null
                  return (
                    <div key={pred.id} className="bg-gray-900 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{match.homeTeam.flagEmoji}</span>
                          <span className="text-white text-sm font-semibold">{match.homeTeam.name}</span>
                          <span className="text-gray-500 text-xs">vs</span>
                          <span className="text-white text-sm font-semibold">{match.awayTeam.name}</span>
                          <span className="text-lg">{match.awayTeam.flagEmoji}</span>
                        </div>
                        {pred.points !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              pred.points === 5
                                ? "bg-yellow-500/20 text-yellow-400"
                                : pred.points === 2
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            +{pred.points} pts
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs">Your prediction:</span>
                        <span className="text-white font-black text-2xl">
                          {pred.homeScore} – {pred.awayScore}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">{match.stadium} · {match.city}</p>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="flex border-b border-white/5">
                {(["matches", "venues"] as SavedSubTab[]).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSavedSubTab(sub)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 capitalize ${
                      savedSubTab === sub
                        ? "border-orange-500 text-orange-400"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {savedSubTab === "matches" && (
                <div className="space-y-3">
                  {savedMatches.length === 0 ? (
                    <EmptyState
                      icon="⚽"
                      title="No saved matches"
                      description="Browse matches and save the ones you want to attend or watch."
                      action={{ label: "Browse Matches", href: "/matches" }}
                    />
                  ) : (
                    savedMatches.map((m) => <MatchCard key={m.id} match={m} />)
                  )}
                </div>
              )}

              {savedSubTab === "venues" && (
                <div className="space-y-3">
                  {savedVenues.length === 0 ? (
                    <EmptyState
                      icon="🍺"
                      title="No saved venues"
                      description="Find watch party venues and save your favourites."
                      action={{ label: "Find Venues", href: "/watch-parties" }}
                    />
                  ) : (
                    savedVenues.map((v) => <VenueCard key={v.id} venue={v} />)
                  )}
                </div>
              )}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <div className="grid grid-cols-2 gap-3">
              {ALL_BADGES.map((badge) => {
                const earned = user.badges.includes(badge.name)
                return (
                  <div
                    key={badge.name}
                    className={`bg-gray-900 border rounded-2xl p-4 text-center ${
                      earned ? "border-orange-500/30" : "border-white/10"
                    }`}
                  >
                    <span className={`text-3xl block mb-2 ${earned ? "" : "opacity-30 grayscale"}`}>
                      {badge.icon}
                    </span>
                    <p className="text-white font-bold text-sm">{badge.name}</p>
                    <div className="my-1.5">
                      <Badge name={badge.name} earned={earned} />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{badge.description}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
