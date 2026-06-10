import Link from "next/link"
import { Match } from "@/lib/types"

interface MatchCardProps {
  match: Match
  compact?: boolean
}

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        LIVE
      </span>
    )
  }
  if (status === "finished") {
    return (
      <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-medium">
        Full Time
      </span>
    )
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-medium">
      Upcoming
    </span>
  )
}

export default function MatchCard({ match, compact }: MatchCardProps) {
  const kickoff = new Date(match.kickoffTime)
  const dateStr = kickoff.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
  const timeStr = kickoff.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })

  return (
    <Link href={`/matches/${match.id}`} className="block">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-3 hover:border-orange-500/30 hover:bg-[#1a1a26] transition-all duration-200 cursor-pointer h-full">
        {/* Header row: stage (truncated) + status badge */}
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="text-gray-500 text-[11px] font-medium truncate min-w-0 flex-1">
            {compact ? match.stage.replace("Group Stage", "Group").replace("Round of ", "R") : match.stage}
          </span>
          <div className="flex-shrink-0">
            <StatusBadge status={match.status} />
          </div>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-1">
          {/* Home team */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-3xl leading-none">{match.homeTeam.flagEmoji}</span>
            <span className="text-white font-bold text-xs text-center w-full truncate">
              {compact ? match.homeTeam.shortCode : match.homeTeam.name}
            </span>
          </div>

          {/* Score / time */}
          <div className="flex flex-col items-center flex-shrink-0 px-2 min-w-0">
            {match.status !== "upcoming" && match.homeScore !== undefined && match.awayScore !== undefined ? (
              <span className="text-white font-black text-2xl tracking-tight whitespace-nowrap">
                {match.homeScore}–{match.awayScore}
              </span>
            ) : (
              <>
                <span className="text-gray-500 text-[11px] whitespace-nowrap">{dateStr}</span>
                <span className="text-orange-400 font-bold text-xs mt-0.5 whitespace-nowrap">{timeStr}</span>
              </>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-3xl leading-none">{match.awayTeam.flagEmoji}</span>
            <span className="text-white font-bold text-xs text-center w-full truncate">
              {compact ? match.awayTeam.shortCode : match.awayTeam.name}
            </span>
          </div>
        </div>

        {!compact && (
          <>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-gray-400 text-xs">
              <span>🏟️</span>
              <span>{match.stadium}</span>
              <span className="mx-1 text-gray-600">·</span>
              <span>📍</span>
              <span>{match.city}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">
                🎯 Predict
              </span>
              <span className="text-gray-600 text-xs">·</span>
              <span className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">
                📍 Watch Party
              </span>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}
