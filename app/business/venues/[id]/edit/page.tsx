"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import BusinessShell from "@/components/BusinessShell"
import CitySelector from "@/components/CitySelector"
import { useToast } from "@/components/Toast"
import { mockCities, mockMatches } from "@/lib/mock-data"
import { formatKickoffTime } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

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

type LoadState = "loading" | "ready" | "not-found" | "error"

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()

  // ── Load state ──────────────────────────────────────────────────────────────
  const [loadState, setLoadState] = useState<LoadState>(() =>
    configured ? "loading" : "ready"
  )

  // ── Form state ──────────────────────────────────────────────────────────────
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

  // ── Load existing venue from Supabase ───────────────────────────────────────
  useEffect(() => {
    if (!configured) return  // already "ready" via lazy initializer

    async function loadVenue() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) {
          setLoadState("not-found")
          return
        }

        // Select the venue — RLS restricts this to owner_id = auth.uid() or admin.
        const { data, error } = await supabase
          .from("venues")
          .select(
            "id, name, city_id, address, capacity, price_type, ticket_price, booking_url, big_screen, family_friendly, food_available, description, image_url, owner_id"
          )
          .eq("id", id)
          .eq("owner_id", user.id)   // belt-and-suspenders on top of RLS
          .single()

        if (error || !data) {
          setLoadState("not-found")
          return
        }

        // Load existing match associations.
        const { data: vmData } = await supabase
          .from("venue_matches")
          .select("match_id")
          .eq("venue_id", id)

        // Populate form.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const v = data as any
        setName(v.name ?? "")
        setCityId(v.city_id ?? "")
        setAddress(v.address ?? "")
        setCapacity(v.capacity != null ? String(v.capacity) : "")
        setPrice(v.price_type === "ticketed" ? "ticketed" : "free")
        setTicketPrice(v.ticket_price != null ? String(v.ticket_price) : "")
        setBookingLink(v.booking_url ?? "")
        setBigScreen(v.big_screen ?? false)
        setFamilyFriendly(v.family_friendly ?? false)
        setFoodAvailable(v.food_available ?? false)
        setDescription(v.description ?? "")
        setImageUrl(v.image_url ?? "")
        setSelectedMatchIds(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (vmData ?? []).map((row: any) => row.match_id as string)
        )
        setLoadState("ready")
      } catch (err) {
        console.error("[edit-venue] load error", err)
        setLoadState("error")
      }
    }

    loadVenue()
  }, [id])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const toggleMatch = (matchId: string) => {
    setSelectedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((m) => m !== matchId) : [...prev, matchId]
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

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Demo mode — just show a toast.
    if (!configured) {
      showToast("Connect Supabase to persist venue edits.", "info")
      return
    }

    setSubmitting(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        showToast("You must be logged in to edit a venue.", "error")
        setSubmitting(false)
        return
      }

      // Update the venue row.
      // Setting status → "pending" so admin can re-review any changes.
      const { error: updateErr } = await supabase
        .from("venues")
        .update({
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
          status: "pending",     // ← back to pending after any edit
        })
        .eq("id", id)
        .eq("owner_id", user.id)  // belt-and-suspenders; RLS also enforces this

      if (updateErr) {
        console.error("[edit-venue] update error", updateErr)
        showToast(updateErr.message ?? "Failed to save changes. Please try again.", "error")
        setSubmitting(false)
        return
      }

      // Replace venue_matches: delete existing, re-insert selected.
      await supabase.from("venue_matches").delete().eq("venue_id", id)

      if (selectedMatchIds.length > 0) {
        const { error: vmErr } = await supabase
          .from("venue_matches")
          .insert(selectedMatchIds.map((mid) => ({ venue_id: id, match_id: mid })))
        if (vmErr) {
          console.warn("[edit-venue] venue_matches update warning", vmErr)
        }
      }

      showToast("Venue updated and sent for re-approval.", "success")
      router.push("/business")
    } catch (err) {
      console.error("[edit-venue] unexpected error", err)
      showToast("Something went wrong. Please try again.", "error")
      setSubmitting(false)
    }
  }

  // ── Render: loading ──────────────────────────────────────────────────────────

  if (loadState === "loading") {
    return (
      <BusinessShell title="Edit Venue">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading venue…</p>
          </div>
        </div>
      </BusinessShell>
    )
  }

  if (loadState === "not-found") {
    return (
      <BusinessShell title="Edit Venue">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-sm w-full">
            <p className="text-white font-black text-xl mb-2">Venue not found</p>
            <p className="text-gray-400 text-sm mb-6">
              This venue does not exist or you do not have permission to edit it.
            </p>
            <Link
              href="/business"
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm inline-block"
            >
              Back to Portal
            </Link>
          </div>
        </div>
      </BusinessShell>
    )
  }

  if (loadState === "error") {
    return (
      <BusinessShell title="Edit Venue">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
            <p className="text-white font-black text-xl mb-2">Failed to load venue</p>
            <p className="text-gray-400 text-sm mb-6">Something went wrong. Please try again.</p>
            <button
              onClick={() => { setLoadState("loading"); router.refresh() }}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </BusinessShell>
    )
  }

  // ── Render: form ─────────────────────────────────────────────────────────────

  return (
    <BusinessShell title="Edit Venue">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <Link
          href="/business"
          className="inline-flex items-center gap-1 text-gray-400 text-sm hover:text-white transition-colors mb-6 touch-manipulation"
        >
          ← Business Portal
        </Link>

        {/* Re-review notice */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 mb-6">
          <p className="text-yellow-300 text-sm font-semibold">
            Saving changes will set this venue back to <strong>Pending</strong> for admin re-review. It will remain live until the review is complete.
          </p>
        </div>

        {!configured && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 mb-6">
            <p className="text-orange-300 text-sm font-semibold">
              Preview mode — connect Supabase to enable live venue editing.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

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
                {errors.ticketPrice && <p className="text-red-400 text-xs mt-1">{errors.ticketPrice}</p>}
                <input
                  type="url"
                  value={bookingLink}
                  onChange={(e) => setBookingLink(e.target.value)}
                  placeholder="Booking URL (https://...)"
                  className={`${inputCls} ${errors.bookingLink ? "border-red-500/60" : ""}`}
                />
                {errors.bookingLink && <p className="text-red-400 text-xs mt-1">{errors.bookingLink}</p>}
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
                { key: "foodAvailable", label: "Food & Drinks", value: foodAvailable, set: setFoodAvailable },
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
                >
                  {feature.label}
                </button>
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

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/business"
              className="flex-1 text-center border border-white/10 hover:border-white/20 text-white font-bold rounded-xl px-5 py-3.5 transition-all text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl px-5 py-3.5 transition-all text-base"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </BusinessShell>
  )
}
