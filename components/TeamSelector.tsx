"use client"

import { Team } from "@/lib/types"

interface TeamSelectorProps {
  teams: Team[]
  selected: string[]
  onToggle: (teamId: string) => void
}

export default function TeamSelector({ teams, selected, onToggle }: TeamSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {teams.map((team) => {
        const isSelected = selected.includes(team.id)
        return (
          <button
            key={team.id}
            onClick={() => onToggle(team.id)}
            className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-center ${
              isSelected
                ? "border-orange-500 bg-orange-500/10"
                : "border-white/10 bg-gray-900 hover:border-white/30"
            }`}
          >
            {isSelected && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">
                ✓
              </span>
            )}
            <span className="text-3xl">{team.flagEmoji}</span>
            <span className="text-white font-bold text-sm leading-tight">{team.shortCode}</span>
            <span className="text-gray-400 text-xs leading-tight">{team.name}</span>
          </button>
        )
      })}
    </div>
  )
}
