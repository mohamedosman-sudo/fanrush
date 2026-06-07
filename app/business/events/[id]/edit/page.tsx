"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import MobileAdminNav from "@/components/MobileAdminNav"
import { useToast } from "@/components/Toast"
import { mockMatches } from "@/lib/mock-data"
import { formatKickoffTime } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string
  venueId?: string
  date?: string
}

type LoadState = "loading" | "ready" | "not-found" | "error"
type VenueOption = { id: string; name: string; city: string }

// ── Constants ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
const selectCls =
  "w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert an ISO timestamp to the "YYYY-MM-DDTHH:MM" string that
 *  <input type="datetime-local"> expects, interpreted as UTC. */
function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditEventPage({
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
  const [venueId, setVenueId] = useState("")
  const [matchId, setMatchId] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [deals, setDeals] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // ── Venue options for the selector ───────────────────────────────────────────
  const [myVenues, setMyVenues] = useState<VenueOption[]>([])

  // ── Load event + owned venues from Supabase ──────────────────────────────────
  useEffect(() => {
    if (!configured) return  // already "ready" via lazy initializer

    async function loadData() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) {
          setLoadState("not-found")
          return
        }

        // Load the event and the user's venues in parallel.
        const [eventRes, venuesRes] = await Promise.all([
          supabase
            .from("events")
            .select("id, title, description, event_date, venue_id, match_id, special_offers")
            .eq("id", id)
            .single(),
          supabase
            .from("venues")
            .select("id, name, city_id, cities(name)")
            .eq("owner_id", user.id)
            .order("name"),
        ])

        if (eventRes.error || !eventRes.data) {
          setLoadState("not-found")
          return
        }

        // Belt-and-suspenders: confirm the event's venue belongs to this user.
        const ownedVenueIds = new Set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (venuesRes.data ?? []).map((v: any) => v.id as string)
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ev = eventRes.data as any
        if (!ownedVenueIds.has(ev.venue_id)) {
          setLoadState("not-found")
          return
        }

        // Populate venue options.
        setMyVenues(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (venuesRes.data ?? []).map((v: any) => ({
            id: v.id as string,
            name: v.name as string,
            city: (v.cities?.name as string | undefined) ?? v.city_id ?? "—",
          }))
        )

        // Populate form fields.
        setName(ev.title ?? "")
        setVenueId(ev.venue_id ?? "")
        setMatchId(ev.match_id ?? "")
        setDate(isoToDatetimeLocal(ev.event_date))
        setDescription(ev.description ?? "")
        setDeals(ev.special_offers ?? "")
        setLoadState("ready")
      } catch (err) {
        console.error("[edit-event] load error", err)
        setLoadState("error")
      }
    }

    loadData()
  }, [id])

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = "Event name is required"
    if (!venueId) newErrors.venueId = "Please select a venue"
    if (!date) newErrors.date = "Please select a date and time"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!configured) {
      showToast("Connect Supabase to persist event edits.", "info")
      return
    }

    setSubmitting(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        showToast("You must be logged in to edit an event.", "error")
        setSubmitting(false)
        return
      }

      // Update the event. RLS enforces venue ownership.
      // status → "pending" so admin re-reviews after any edit.
      const { error: updateErr } = await supabase
        .from("events")
        .update({
          title: name.trim(),
          venue_id: venueId,
          match_id: matchId || null,
          event_date: date ? new Date(date).toISOString() : null,
          description: description.trim() || null,
          special_offers: deals.trim() || null,
          status: "pending",
        })
        .eq("id", id)

      if (updateErr) {
        console.error("[edit-event] update error", updateErr)
        showToast(updateErr.message ?? "Failed to save changes. Please try again.", "error")
        setSubmitting(false)
        return
      }

      showToast("Event updated and sent for re-approval.", "success")
      router.push("/business")
    } catch (err) {
      console.error("[edit-event] unexpected error", err)
      showToast("Something went wrong. Please try again.", "error")
      setSubmitting(false)
    }
  }

  // ── Render: non-ready states ─────────────────────────────────────────────────

  if (loadState === "loading") {
    return (
      <AppShell title="Edit Event" showBottomNav={false} showBack>
        <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading event…</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (loadState === "not-found") {
    return (
      <AppShell title="Edit Event" showBottomNav={false} showBack>
        <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-sm w-full">
            <p className="text-white font-black text-xl mb-2">Event not found</p>
            <p className="text-gray-400 text-sm mb-6">
              This event does not exist or you do not have permission to edit it.
            </p>
            <Link
              href="/business"
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm inline-block"
            >
              Back to Portal
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  if (loadState === "error") {
    return (
      <AppShell title="Edit Event" showBottomNav={false} showBack>
        <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
            <p className="text-white font-black text-xl mb-2">Failed to load event</p>
            <p className="text-gray-400 text-sm mb-6">Something went wrong. Please try again.</p>
            <button
              onClick={() => { setLoadState("loading"); router.refresh() }}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  // ── Render: form ─────────────────────────────────────────────────────────────

  return (
    <AppShell title="Edit Event" showBottomNav={false} showBack>
      <MobileAdminNav
        title="Business"
        links={[
          { label: "Overview", href: "/business" },
          { label: "Add Venue", href: "/business/add-venue" },
          { label: "Add Event", href: "/business/add-event" },
        ]}
      />
      <div className="bg-[#0a0a0f] min-h-screen">

        {/* Re-review notice */}
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
            <p className="text-yellow-300 text-sm font-semibold">
              Saving changes will set this event back to{" "}
              <strong>Pending</strong> for admin re-review.
            </p>
          </div>
        </div>

        {!configured && (
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
              <p className="text-orange-300 text-sm font-semibold">
                Demo mode — connect Supabase to enable real event editing.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-8">

          {/* Event Name */}
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
              {myVenues.length === 0 ? (
                <div className="bg-gray-900 border border-dashed border-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">No venues found.</p>
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
                  <option value="">Select a venue…</option>
                  {myVenues.map((v) => (
                    <option key={v.id} value={v.id} className="bg-gray-800">
                      {v.name} — {v.city}
                    </option>
                  ))}
                </select>
              )}
              {errors.venueId && (
                <p className="text-red-400 text-xs mt-1">{errors.venueId}</p>
              )}
            </div>
            <div>
              <select
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className={selectCls}
              >
                <option value="">Select a match (optional)…</option>
                {mockMatches.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-800">
                    {m.homeTeam.name} vs {m.awayTeam.name} —{" "}
                    {formatKickoffTime(m.kickoffTime)}
                  </option>
                ))}
              </select>
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
              placeholder="Tell fans about your event…"
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
              placeholder="e.g. 2-for-1 drinks until kick-off…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
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
    </AppShell>
  )
}
