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
    const updated = isSaved
      ? saved.filter((id) => id !== venue.id)
      : [...saved, venue.id]
    storage.set(STORAGE_KEYS.SAVED_VENUES, updated)
    setIsSaved(!isSaved)
    onSave?.(venue.id)
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
      {/* Orange accent line for featured venues */}
      {venue.featured && (
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />
      )}

      <div className="p-4 space-y-3">
        {/* Row 1: name / city + price / capacity */}
        <div className="flex items-start gap-3">
          {/* Left: name + address */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-snug">{venue.name}</h3>
            <p className="text-gray-400 text-sm mt-0.5 truncate">{venue.city}</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{venue.address}</p>
          </div>

          {/* Right: price badge + capacity — stacked, never overlaps */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                venue.price === "free"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-yellow-500/15 text-yellow-400"
              }`}
            >
              {venue.price === "free" ? "FREE" : "TICKETED"}
            </span>
            <span className="text-gray-500 text-xs whitespace-nowrap">
              Cap. {venue.capacity.toLocaleString("en-US")}
            </span>
          </div>
        </div>

        {/* Row 2: amenity + Featured badges */}
        <div className="flex flex-wrap gap-2">
          {venue.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold">
              ⭐ Featured
            </span>
          )}
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

        {/* Row 3: Save / Book actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all min-h-[40px] ${
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
              className="flex-1 text-center px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95 min-h-[40px] flex items-center justify-center"
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
