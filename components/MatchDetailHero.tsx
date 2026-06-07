"use client"

import { useEffect, useState } from "react"
import { Match } from "@/lib/types"

interface MatchDetailHeroProps {
  match: Match
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft("Kicked off")
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        LIVE
      </span>
    )
  }
  if (status === "finished") {
    return (
      <span className="px-4 py-1.5 rounded-full bg-gray-800 text-gray-300 text-sm font-medium border border-white/10">
        Full Time
      </span>
    )
  }
  return (
    <span className="px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium">
      Upcoming
    </span>
  )
}

export default function MatchDetailHero({ match }: MatchDetailHeroProps) {
  const countdown = useCountdown(match.kickoffTime)
  const kickoff = new Date(match.kickoffTime)
  const dateStr = kickoff.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  const timeStr = kickoff.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })

  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-b from-orange-950/50 via-gray-900 to-transparent px-4 pt-5 pb-4">
        <div className="flex items-center justify-center mb-4">
          <StatusBadge status={match.status} />
        </div>

        <div className="flex items-center justify-between mb-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 px-1">
            <span className="text-5xl md:text-7xl leading-none">{match.homeTeam.flagEmoji}</span>
            <span className="text-white font-black text-sm text-center tracking-tight w-full truncate px-1">
              {match.homeTeam.name}
            </span>
            <span className="text-gray-500 text-xs font-medium">{match.homeTeam.shortCode}</span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center px-2 flex-shrink-0">
            {match.status !== "upcoming" && match.homeScore !== undefined && match.awayScore !== undefined ? (
              <span className="text-white font-black text-3xl tracking-tight">
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <>
                <span
                  className="text-white font-black text-xl"
                  style={{ textShadow: "0 0 16px rgba(249,115,22,0.6)" }}
                >
                  VS
                </span>
                {match.status === "upcoming" && (
                  <span className="text-orange-400 font-mono text-xs mt-1">{timeStr}</span>
                )}
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 px-1">
            <span className="text-5xl md:text-7xl leading-none">{match.awayTeam.flagEmoji}</span>
            <span className="text-white font-black text-sm text-center tracking-tight w-full truncate px-1">
              {match.awayTeam.name}
            </span>
            <span className="text-gray-500 text-xs font-medium">{match.awayTeam.shortCode}</span>
          </div>
        </div>

        {match.status === "upcoming" && (
          <div className="bg-black/30 rounded-xl px-4 py-3 text-center mb-2 border border-white/5">
            <p className="text-gray-500 text-xs mb-1">Kicks off in</p>
            <p className="text-orange-400 font-mono font-bold text-lg">{countdown}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-2xl px-4 py-3 grid grid-cols-2 gap-3 mt-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base flex-shrink-0 mt-0.5">🏟️</span>
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Stadium</p>
            <p className="text-white text-xs font-semibold leading-snug truncate">{match.stadium}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base flex-shrink-0 mt-0.5">📍</span>
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">City</p>
            <p className="text-white text-xs font-semibold leading-snug truncate">{match.city}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base flex-shrink-0 mt-0.5">📅</span>
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Date</p>
            <p className="text-white text-xs font-semibold leading-snug">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base flex-shrink-0 mt-0.5">🏆</span>
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Stage</p>
            <p className="text-white text-xs font-semibold leading-snug truncate">{match.stage}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
