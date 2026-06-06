"use client"

import { useState } from "react"
import { Match, Prediction } from "@/lib/types"
import { storage, STORAGE_KEYS } from "@/lib/storage"

interface PredictionCardProps {
  match: Match
  prediction?: Prediction
  onPredict: (homeScore: number, awayScore: number) => void
  disabled?: boolean
}

function PointsBadge({ points }: { points: number }) {
  if (points >= 5) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
        +{points} pts
      </span>
    )
  }
  if (points >= 2) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
        +{points} pts
      </span>
    )
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-500 text-xs font-bold">
      +{points} pts
    </span>
  )
}

export default function PredictionCard({ match, prediction: predictionProp, onPredict, disabled }: PredictionCardProps) {
  const [prediction, setPrediction] = useState<Prediction | undefined>(() => {
    if (predictionProp) return predictionProp
    const saved = storage.get<Record<string, { homeScore: number; awayScore: number; points?: number }>>(
      STORAGE_KEYS.PREDICTIONS, {}
    )
    const entry = saved[match.id]
    if (!entry) return undefined
    return { id: `p-${match.id}-local`, userId: "local", matchId: match.id, homeScore: entry.homeScore, awayScore: entry.awayScore, points: entry.points }
  })
  const [home, setHome] = useState<string>(() => {
    if (predictionProp) return String(predictionProp.homeScore)
    const saved = storage.get<Record<string, { homeScore: number; awayScore: number }>>(STORAGE_KEYS.PREDICTIONS, {})
    return saved[match.id] ? String(saved[match.id].homeScore) : ""
  })
  const [away, setAway] = useState<string>(() => {
    if (predictionProp) return String(predictionProp.awayScore)
    const saved = storage.get<Record<string, { homeScore: number; awayScore: number }>>(STORAGE_KEYS.PREDICTIONS, {})
    return saved[match.id] ? String(saved[match.id].awayScore) : ""
  })

  const handleSubmit = () => {
    const h = parseInt(home)
    const a = parseInt(away)
    if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) {
      // Persist to localStorage
      const saved = storage.get<Record<string, { homeScore: number; awayScore: number; points?: number }>>(
        STORAGE_KEYS.PREDICTIONS,
        {}
      )
      saved[match.id] = { homeScore: h, awayScore: a }
      storage.set(STORAGE_KEYS.PREDICTIONS, saved)

      const newPrediction: Prediction = {
        id: `p-${match.id}-local`,
        userId: "local",
        matchId: match.id,
        homeScore: h,
        awayScore: a,
      }
      setPrediction(newPrediction)
      onPredict(h, a)
    }
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-xs font-medium">{match.stage}</span>
        {prediction?.points !== undefined && (
          <PointsBadge points={prediction.points} />
        )}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-3xl">{match.homeTeam.flagEmoji}</span>
          <span className="text-white text-sm font-bold">{match.homeTeam.shortCode}</span>
        </div>
        <span className="text-gray-600 font-black px-4 text-lg">VS</span>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-3xl">{match.awayTeam.flagEmoji}</span>
          <span className="text-white text-sm font-bold">{match.awayTeam.shortCode}</span>
        </div>
      </div>

      {prediction !== undefined ? (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-3 bg-gray-800 border border-white/10 rounded-2xl px-6 py-3">
            <span className="text-white font-black text-2xl">{prediction.homeScore}</span>
            <span className="text-gray-600 font-bold text-lg">–</span>
            <span className="text-white font-black text-2xl">{prediction.awayScore}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-emerald-400 text-lg">✓</span>
            <span className="text-gray-400 text-xs">Your prediction</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-gray-500 text-xs font-medium">{match.homeTeam.shortCode}</span>
              <input
                type="number"
                min="0"
                max="20"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                disabled={disabled}
                placeholder="0"
                className="w-16 h-16 text-center bg-gray-800 border border-white/10 rounded-xl text-white text-2xl font-black focus:outline-none focus:border-orange-500/50 disabled:opacity-50 transition-colors"
              />
            </div>
            <span className="text-gray-600 font-bold text-xl mt-6">–</span>
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-gray-500 text-xs font-medium">{match.awayTeam.shortCode}</span>
              <input
                type="number"
                min="0"
                max="20"
                value={away}
                onChange={(e) => setAway(e.target.value)}
                disabled={disabled}
                placeholder="0"
                className="w-16 h-16 text-center bg-gray-800 border border-white/10 rounded-xl text-white text-2xl font-black focus:outline-none focus:border-orange-500/50 disabled:opacity-50 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={disabled || home === "" || away === ""}
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95"
          >
            Submit Prediction 🎯
          </button>
        </div>
      )}
    </div>
  )
}
