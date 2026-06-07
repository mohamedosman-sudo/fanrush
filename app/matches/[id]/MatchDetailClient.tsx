"use client"

import { useState, useEffect } from "react"
import { Match, Venue, Event, Prediction } from "@/lib/types"
import MatchDetailHero from "@/components/MatchDetailHero"
import VenueCard from "@/components/VenueCard"
import PredictionCard from "@/components/PredictionCard"
import EmptyState from "@/components/EmptyState"
import { formatKickoffTime } from "@/lib/utils"
import { useComingSoon } from "@/components/useComingSoon"

type Tab = "info" | "watch-parties" | "predict" | "share"

interface MatchDetailClientProps {
  match: Match
  relatedVenues: Venue[]
  relatedEvents: Event[]
  existingPrediction?: Prediction
}

const TABS: { id: Tab; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "watch-parties", label: "Watch Parties" },
  { id: "predict", label: "Predict" },
  { id: "share", label: "Share" },
]

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function MatchDetailClient({
  match,
  relatedVenues,
  relatedEvents,
  existingPrediction,
}: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info")
  const [prediction, setPrediction] = useState<Prediction | undefined>(existingPrediction)
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const showComingSoon = useComingSoon()

  useEffect(() => {
    if (!configured) return
    async function getUser() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    getUser()
  }, [])

  const shareText = `Watch ${match.homeTeam.name} ${match.homeTeam.flagEmoji} vs ${match.awayTeam.flagEmoji} ${match.awayTeam.name} — ${formatKickoffTime(match.kickoffTime)} at ${match.stadium}, ${match.city}. Find watch parties near you on FanRush!`
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://fanrush.app/matches/${match.id}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function handlePredict(homeScore: number, awayScore: number) {
    const newPrediction: Prediction = {
      id: `p-${match.id}-local`,
      userId: userId ?? "local",
      matchId: match.id,
      homeScore,
      awayScore,
    }
    setPrediction(newPrediction)

    if (configured && userId) {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.from("predictions").upsert(
        { user_id: userId, match_id: match.id, home_score: homeScore, away_score: awayScore },
        { onConflict: "user_id,match_id" }
      )
    }
  }

  return (
    <div>
      {/* 1. HERO */}
      <MatchDetailHero match={match} />

      {/* 2. TAB BAR */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-2xl mx-auto flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-orange-400 border-orange-500"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">

        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Stadium", value: match.stadium },
              { label: "City", value: match.city },
              { label: "Stage", value: match.stage },
              { label: "Kickoff", value: formatKickoffTime(match.kickoffTime) },
              {
                label: "Status",
                value:
                  match.status === "live"
                    ? "LIVE NOW"
                    : match.status === "finished"
                    ? "Full Time"
                    : "Upcoming",
              },
              { label: "Match ID", value: match.id.toUpperCase() },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-900 border border-white/10 rounded-xl p-3"
              >
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  {item.label}
                </p>
                <p className="text-white font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* WATCH PARTIES TAB */}
        {activeTab === "watch-parties" && (
          <div className="space-y-6">
            {/* Venues */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">📍 Venues</p>
              {relatedVenues.length === 0 ? (
                <EmptyState
                  icon="📍"
                  title="No watch parties yet"
                  description="Be the first to list one"
                  action={{ label: "List a venue", href: "/business/add-venue" }}
                />
              ) : (
                relatedVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))
              )}
            </div>

            {/* Events */}
            {relatedEvents.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">🎉 Events</p>
                {relatedEvents.map((event) => (
                  <div key={event.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                    <p className="text-white font-bold">{event.name}</p>
                    {event.description && (
                      <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                    )}
                    {event.date && (
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(event.date).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                          timeZoneName: "short",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREDICT TAB */}
        {activeTab === "predict" && (
          <div className="space-y-4">
            {/* Points guide */}
            <div className="flex items-center justify-center gap-3">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-bold">
                ✅ Exact score = 5pts
              </span>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-3 py-1 text-xs font-bold">
                ✓ Correct result = 2pts
              </span>
              <span className="bg-gray-800 text-gray-500 rounded-full px-3 py-1 text-xs font-bold">
                ✗ Wrong = 0pts
              </span>
            </div>
            <PredictionCard
              match={match}
              prediction={prediction}
              onPredict={handlePredict}
              disabled={match.status !== "upcoming"}
            />
          </div>
        )}

        {/* SHARE TAB */}
        {activeTab === "share" && (
          <div className="space-y-4">
            {/* Share text box */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
              <p className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {shareText}
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors"
            >
              {copied ? "✅ Copied!" : "📋 Copy Text & Link"}
            </button>

            {/* Social share buttons */}
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-colors"
              >
                <span className="font-bold">𝕏</span>
                <span>Twitter</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-colors"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-colors"
              >
                <span>📘</span>
                <span>Facebook</span>
              </a>
            </div>

            {/* Add reminder */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold text-sm">Set a reminder</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Get notified 1 hour before kick-off
                </p>
              </div>
              <button
                onClick={() => showComingSoon("Match reminders")}
                className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                + Remind me
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
