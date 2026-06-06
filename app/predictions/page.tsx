"use client"

import { useState } from "react"
import AppShell from "@/components/AppShell"
import PredictionCard from "@/components/PredictionCard"
import Leaderboard from "@/components/Leaderboard"
import SponsorBanner from "@/components/SponsorBanner"
import { mockMatches, mockUsers, mockLeagues, mockSponsorSlots, currentUser } from "@/lib/mock-data"
import { Prediction } from "@/lib/types"

type Tab = "predictions" | "leaderboard" | "minileagues"

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("predictions")
  const [predictions, setPredictions] = useState<Prediction[]>(currentUser.predictions)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [generatedCode] = useState(() => generateCode())
  const [joinCode, setJoinCode] = useState("")
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)

  const upcomingMatches = mockMatches.filter((m) => m.status === "upcoming")

  const handlePredict = (matchId: string, homeScore: number, awayScore: number) => {
    setPredictions((prev) => {
      const existing = prev.findIndex((p) => p.matchId === matchId)
      const newPred: Prediction = {
        id: `local-${matchId}`,
        userId: currentUser.id,
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
  }

  const sortedUsers = [...mockUsers].sort((a, b) => b.points - a.points).map((u, i) => ({
    name: u.name,
    points: u.points,
    avatar: u.avatar,
    rank: i + 1,
  }))

  const totalPredictions = mockUsers.reduce((acc, u) => acc + u.predictions.length, 0)
  const avgScore = mockUsers.length
    ? (mockUsers.reduce((acc, u) => acc + u.points, 0) / mockUsers.length).toFixed(1)
    : "0"

  const top3 = sortedUsers.slice(0, 3)
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
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Upcoming matches to predict
              </p>
              {upcomingMatches.length === 0 ? (
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
                      disabled={match.status === "finished"}
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
                {totalPredictions} total predictions · Avg {avgScore} pts
              </p>

              {/* Full leaderboard */}
              <Leaderboard users={sortedUsers} />
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
