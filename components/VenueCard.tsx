"use client"

import { useState } from "react"
import { Venue } from "@/lib/types"
import { storage, STORAGE_KEYS } from "@/lib/storage"

interface VenueCardProps {
  venue: Venue
  onSave?: (venueId: string) => void
}

export default function VenueCard({ venue, onSave }: VenueCardProps) {
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    storage.get<string[]>(STORAGE_KEYS.SAVED_VENUES, []).includes(venue.id)
  )

  function handleSave() {
    const saved = storage.get<string[]>(STORAGE_KEYS.SAVED_VENUES, [])
    let updated: string[]
    if (isSaved) {
      updated = saved.filter((id) => id !== venue.id)
    } else {
      updated = [...saved, venue.id]
    }
    storage.set(STORAGE_KEYS.SAVED_VENUES, updated)
    setIsSaved(!isSaved)
    onSave?.(venue.id)
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden relative">
      {venue.featured && (
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />
      )}

      {venue.featured && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-bl-xl rounded-tr-xl z-10">
          ⭐ Featured
        </span>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mt-1">
          <div className="flex-1 pr-2">
            <h3 className="text-white font-bold text-lg leading-tight">{venue.name}</h3>
            <p className="text-gray-400 text-sm mt-0.5">{venue.city}</p>
            <p className="text-gray-500 text-xs mt-1">{venue.address}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                venue.price === "free"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-yellow-500/15 text-yellow-400"
              }`}
            >
              {venue.price === "free" ? "FREE" : "TICKETED"}
            </span>
            <span className="text-gray-500 text-xs">
              Cap. {venue.capacity.toLocaleString("en-US")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {venue.bigScreen && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 text-xs">
              📺 Big Screen
            </span>
          )}
          {venue.familyFriendly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 text-xs">
              👨‍👩‍👧 Family
            </span>
          )}
          {venue.foodAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 text-xs">
              🍔 Food
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              isSaved
                ? "border-orange-500/60 text-orange-400"
                : "border-white/20 hover:border-orange-500/50 text-gray-300 hover:text-orange-400"
            }`}
          >
            🔖 {isSaved ? "Saved" : "Save"}
          </button>
          {venue.bookingLink ? (
            <a
              href={venue.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
            >
              Book Now
            </a>
          ) : (
            <span className="text-gray-600 text-xs">Booking link coming soon</span>
          )}
        </div>
      </div>
    </div>
  )
}
