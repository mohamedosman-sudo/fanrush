"use client"

import { City } from "@/lib/types"

interface CitySelectorProps {
  cities: City[]
  selected: string
  onSelect: (cityId: string) => void
}

export default function CitySelector({ cities, selected, onSelect }: CitySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cities.map((city) => {
        const isSelected = selected === city.id
        return (
          <button
            key={city.id}
            onClick={() => onSelect(city.id)}
            className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all text-left ${
              isSelected
                ? "border-orange-500 bg-orange-500/10"
                : "border-white/10 bg-gray-900 hover:border-white/30"
            }`}
          >
            <span className="text-white font-bold text-sm">{city.name}</span>
            <span className="text-gray-400 text-sm">{city.country}</span>
            <span className="text-orange-400 text-xs font-medium mt-0.5">{city.venueCount} venues</span>
          </button>
        )
      })}
    </div>
  )
}
