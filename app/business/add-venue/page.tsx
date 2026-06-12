"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import MobileAdminNav from "@/components/MobileAdminNav"
import CitySelector from "@/components/CitySelector"
import { useToast } from "@/components/Toast"
import { mockMatches, mockCities } from "@/lib/mock-data"
import { formatKickoffTime } from "@/lib/utils"

const BUSINESS_LINKS = [
  { label: "Overview", href: "/business" },
  { label: "Add Venue", href: "/business/add-venue" },
  { label: "Add Event", href: "/business/add-event" },
]

interface FormErrors {
  name?: string
  cityId?: string
  address?: string
  matchIds?: string
  capacity?: string
  ticketPrice?: string
  bookingLink?: string
  imageUrl?: string
}

const inputCls =
  "w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export default function AddVenuePage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [name, setName] = useState("")
  const [cityId, setCityId] = useState("")
  const [address, setAddress] = useState("")
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([])
  const [price, setPrice] = useState<"free" | "ticketed">("free")
  const [ticketPrice, setTicketPrice] = useState("")
  const [bookingLink, setBookingLink] = useState("")
  const [capacity, setCapacity] = useState("")
  const [bigScreen, setBigScreen] = useState(false)
  const [familyFriendly, setFamilyFriendly] = useState(false)
  const [foodAvailable, setFoodAvailable] = useState(false)
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleMatch = (matchId: string) => {
    setSelectedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    )
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = "Venue name is required"
    if (!cityId) newErrors.cityId = "Please select a city"
    if (!address.trim()) newErrors.address = "Address is required"
    if (selectedMatchIds.length === 0) newErrors.matchIds = "Select at least one match"
    if (!capacity || Number(capacity) < 1) newErrors.capacity = "Enter a valid capacity"
    if (price === "ticketed" && (!ticketPrice || Number(ticketPrice) < 0)) {
      newErrors.ticketPrice = "Enter a valid ticket price"
    }
    if (bookingLink && !isHttpUrl(bookingLink)) {
      newErrors.bookingLink = "Booking URL must start with http:// or https://"
    }
    if (imageUrl && !isHttpUrl(imageUrl)) {
      newErrors.imageUrl = "Image URL must start with http:// or https://"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // ── Demo mode ─────────────────────────────────────────────────────────
    if (!configured) {
      setSubmitted(true)
      return
    }

    // ── Supabase path ───��──────────────────────────────────────────────────
    setSubmitting(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        showToast("You must be logged in to add a venue.", "error")
        setSubmitting(false)
        return
      }

      // Insert the venue row.
      const { data: venue, error: venueError } = await supabase
        .from("venues")
        .insert({
          owner_id: user.id,
          name: name.trim(),
          city_id: cityId || null,
          address: address.trim(),
          capacity: Number(capacity),
          price_type: price,
          ticket_price: price === "ticketed" ? Number(ticketPrice) : null,
          booking_url: bookingLink.trim() || null,
          big_screen: bigScreen,
          family_friendly: familyFriendly,
          food_available: foodAvailable,
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          status: "pending",
          featured: false,
        })
        .select("id")
        .single()

      if (venueError || !venue) {
        console.error("[add-venue] insert error", venueError)
        showToast(
          venueError?.message ?? "Failed to submit venue. Please try again.",
          "error"
        )
        setSubmitting(false)
        return
      }

      // Insert venue_matches rows (non-fatal if this fails).
      if (selectedMatchIds.length > 0) {
        const { error: vmError } = await supabase
          .from("venue_matches")
          .insert(
            selectedMatchIds.map((mid) => ({
              venue_id: venue.id,
              match_id: mid,
            }))
          )
        if (vmError) {
          console.warn("[add-venue] venue_matches insert warning", vmError)
        }
      }

      showToast("Venue submitted for approval!", "success")
      router.push("/business")
    } catch (err) {
      console.error("[add-venue] unexpected error", err)
      showToast("Something went wrong. Please try again.", "error")
      setSubmitting(false)
    }
  }

  // ── Success state (demo mode only; Supabase path redirects) ─────────────
  if (submitted) {
    return (
      <AppShell title="Add Venue" showBottomNav={false} showBack>
        <MobileAdminNav title="Business" links={BUSINESS_LINKS} />
        <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white font-black text-2xl mb-2">Submitted for Approval!</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Your venue has been submitted. Our team will review it and it will go live within 24 hours.
            </p>
            <p className="text-yellow-400/70 text-xs mt-3">
              Preview mode — connect Supabase to persist submissions.
            </p>
            <div className="flex gap-2 mt-6 justify-center flex-wrap">
              <button
                onClick={() => {
                  setSubmitted(false)
                  setName(""); setCityId(""); setAddress(""); setSelectedMatchIds([])
                  setPrice("free"); setTicketPrice(""); setBookingLink(""); setCapacity("")
                  setBigScreen(false); setFamilyFriendly(false); setFoodAvailable(false)
                  setDescription(""); setImageUrl("")
                }}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
              >
                Add Another
              </button>
              <Link
                href="/business"
                className="border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
              >
                Back to Portal
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Add Venue" showBottomNav={false} showBack>
      <MobileAdminNav title="Business" links={BUSINESS_LINKS} />
      <div className="bg-[#0a0a0f] min-h-screen">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-8">

          {/* Venue Details */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Venue Details</p>
            <div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Venue name *"
                className={`${inputCls} ${errors.name ? "border-red-500/60" : ""}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <CitySelector cities={mockCities} selected={cityId} onSelect={setCityId} />
              {errors.cityId && <p className="text-red-400 text-xs mt-1">{errors.cityId}</p>}
            </div>
            <div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address *"
                className={`${inputCls} ${errors.address ? "border-red-500/60" : ""}`}
              />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
            </div>
            <div>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Venue capacity *"
                className={`${inputCls} ${errors.capacity ? "border-red-500/60" : ""}`}
              />
              {errors.capacity && <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>}
            </div>
          </div>

          {/* Matches Shown */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Matches Shown</p>
            <div className="space-y-2">
              {mockMatches.map((match) => {
                const checked = selectedMatchIds.includes(match.id)
                return (
                  <label
                    key={match.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "border-orange-500/40 bg-orange-500/10"
                        : "border-white/10 bg-gray-900 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMatch(match.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                        checked ? "bg-orange-500 border-orange-500" : "border-white/20"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-lg">{match.homeTeam.flagEmoji}</span>
                    <span className="text-white text-sm font-medium flex-1">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </span>
                    <span className="text-lg">{match.awayTeam.flagEmoji}</span>
                    <span className="text-gray-500 text-xs shrink-0">
                      {formatKickoffTime(match.kickoffTime)}
                    </span>
                  </label>
                )
              })}
            </div>
            {errors.matchIds && <p className="text-red-400 text-xs mt-1">{errors.matchIds}</p>}
          </div>

          {/* Entry & Pricing */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Entry &amp; Pricing</p>
            <div className="flex gap-2">
              {(["free", "ticketed"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPrice(option)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    price === option
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-800 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  {option === "free" ? "FREE" : "TICKETED"}
                </button>
              ))}
            </div>
            {price === "ticketed" && (
              <div className="space-y-3 pl-4 border-l-2 border-orange-500/30">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="Ticket price ($)"
                  className={`${inputCls} ${errors.ticketPrice ? "border-red-500/60" : ""}`}
                />
                {errors.ticketPrice && (
                  <p className="text-red-400 text-xs mt-1">{errors.ticketPrice}</p>
                )}
                <input
                  type="url"
                  value={bookingLink}
                  onChange={(e) => setBookingLink(e.target.value)}
                  placeholder="Booking URL (https://...)"
                  className={`${inputCls} ${errors.bookingLink ? "border-red-500/60" : ""}`}
                />
                {errors.bookingLink && (
                  <p className="text-red-400 text-xs mt-1">{errors.bookingLink}</p>
                )}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Amenities</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "bigScreen", label: "Big Screen", value: bigScreen, set: setBigScreen },
                { key: "familyFriendly", label: "Family Friendly", value: familyFriendly, set: setFamilyFriendly },
                { key: "foodAvailable", label: "Food &amp; Drinks", value: foodAvailable, set: setFoodAvailable },
              ].map((feature) => (
                <button
                  key={feature.key}
                  type="button"
                  onClick={() => feature.set(!feature.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    feature.value
                      ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      : "bg-gray-800 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                  dangerouslySetInnerHTML={{ __html: feature.label }}
                />
              ))}
            </div>
          </div>

          {/* About the Venue */}
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">About the Venue</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell fans what makes your venue special..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (https://example.com/photo.jpg)"
              className={`${inputCls} ${errors.imageUrl ? "border-red-500/60" : ""}`}
            />
            {errors.imageUrl && <p className="text-red-400 text-xs mt-1">{errors.imageUrl}</p>}
            <p className="text-gray-600 text-xs">Paste a hosted image URL — direct upload will be added soon.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl px-5 py-3.5 transition-all text-base"
          >
            {submitting ? "Submitting…" : "Submit Venue for Approval"}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
