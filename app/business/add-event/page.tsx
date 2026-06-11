"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import { mockVenues, mockMatches } from "@/lib/mock-data"
import { useToast } from "@/components/Toast"
import { formatKickoffTime } from "@/lib/utils"

interface FormErrors {
  name?: string
  venueId?: string
  matchId?: string
  date?: string
}

type VenueOption = { id: string; name: string; city: string }

const inputCls =
  "w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
const selectCls =
  "w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AddEventPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [myVenues, setMyVenues] = useState<VenueOption[]>(() => {
    if (configured) return []
    return mockVenues
      .filter((v) => v.businessId === "biz01")
      .map((v) => ({ id: v.id, name: v.name, city: v.city }))
  })
  const [venuesLoading, setVenuesLoading] = useState(configured)

  const [name, setName] = useState("")
  const [venueId, setVenueId] = useState("")
  const [matchId, setMatchId] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [deals, setDeals] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load this user's venues from Supabase when configured.
  useEffect(() => {
    if (!configured) return

    async function loadVenues() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setVenuesLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("venues")
          .select("id, name, city_id, cities(name)")
          .eq("owner_id", user.id)
          .eq("status", "approved")
          .order("name")

        if (error || !data) {
          console.warn("[add-event] venues load error", error)
          setVenuesLoading(false)
          return
        }

        setMyVenues(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any[]).map((v) => ({
            id: v.id as string,
            name: v.name as string,
            city: (v.cities?.name as string | undefined) ?? v.city_id ?? "—",
          }))
        )
      } catch (err) {
        console.error("[add-event] load venues unexpected error", err)
      } finally {
        setVenuesLoading(false)
      }
    }

    loadVenues()
  }, [])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = "Event name is required"
    if (!venueId) newErrors.venueId = "Please select a venue"
    if (!matchId) newErrors.matchId = "Please select a match"
    if (!date) newErrors.date = "Please select a date"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // ── Demo mode ────────────────────────────────────────────────────────────
    if (!configured) {
      setSubmitted(true)
      return
    }

    // ── Supabase path ─────────────────────────────────────────────────────────
    setSubmitting(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        showToast("You must be logged in to add an event.", "error")
        setSubmitting(false)
        return
      }

      const { error: eventError } = await supabase.from("events").insert({
        venue_id: venueId,
        match_id: matchId || null,
        title: name.trim(),
        description: description.trim() || null,
        special_offers: deals.trim() || null,
        event_date: date ? new Date(date).toISOString() : null,
        status: "pending",
        featured: false,
      })

      if (eventError) {
        console.error("[add-event] insert error", eventError)
        showToast(eventError.message ?? "Failed to submit event. Please try again.", "error")
        setSubmitting(false)
        return
      }

      showToast("Event submitted for approval!", "success")
      router.push("/business")
    } catch (err) {
      console.error("[add-event] unexpected error", err)
      showToast("Something went wrong. Please try again.", "error")
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AppShell title="Add Event" showBottomNav={false} showBack>
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
            <h2 className="text-white font-black text-2xl mb-2">Event Submitted!</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Your event has been submitted and will be reviewed by our team. It will go live within 24 hours.
            </p>
            <p className="text-yellow-400/70 text-xs mt-3">
              Preview mode — connect Supabase to persist submissions.
            </p>
            <div className="flex gap-2 mt-6 justify-center flex-wrap">
              <button
                onClick={() => {
                  setSubmitted(false)
                  setName(""); setVenueId(""); setMatchId(""); setDate("")
                  setDescription(""); setDeals(""); setErrors({})
                }}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
              >
                Add Another Event
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
    <AppShell title="Add Event" showBottomNav={false} showBack>
      <div className="bg-[#0a0a0f] min-h-screen">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-8">

          {/* Event Details */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Event Details</p>
            <div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Event name *"
                className={`${inputCls} ${errors.name ? "border-red-500/60" : ""}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Venue & Match */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Venue &amp; Match</p>
            <div>
              {venuesLoading ? (
                <div className="bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-gray-500 text-sm animate-pulse">
                  Loading your venues…
                </div>
              ) : myVenues.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">No approved venues found.</p>
                  <Link
                    href="/business/add-venue"
                    className="text-orange-400 text-xs hover:underline mt-1 inline-block"
                  >
                    Add a venue first
                  </Link>
                </div>
              ) : (
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className={`${selectCls} ${errors.venueId ? "border-red-500/60" : ""}`}
                >
                  <option value="">Select a venue...</option>
                  {myVenues.map((v) => (
                    <option key={v.id} value={v.id} className="bg-gray-800">
                      {v.name} — {v.city}
                    </option>
                  ))}
                </select>
              )}
              {errors.venueId && <p className="text-red-400 text-xs mt-1">{errors.venueId}</p>}
            </div>
            <div>
              <select
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className={`${selectCls} ${errors.matchId ? "border-red-500/60" : ""}`}
              >
                <option value="">Select a match...</option>
                {mockMatches.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-800">
                    {m.homeTeam.name} vs {m.awayTeam.name} — {formatKickoffTime(m.kickoffTime)}
                  </option>
                ))}
              </select>
              {errors.matchId && <p className="text-red-400 text-xs mt-1">{errors.matchId}</p>}
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Date &amp; Time</p>
            <div>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputCls} ${errors.date ? "border-red-500/60" : ""}`}
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell fans about your event — atmosphere, entertainment, what to expect..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Special Offers */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Special Offers</p>
            <textarea
              value={deals}
              onChange={(e) => setDeals(e.target.value)}
              placeholder="e.g. 2-for-1 drinks until kick-off, free nachos with every pint..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || venuesLoading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl px-5 py-3.5 transition-all text-base"
          >
            {submitting ? "Submitting…" : "Submit Event for Approval"}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
