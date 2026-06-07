"use client"

import { useState, useEffect } from "react"
import { SponsorSlot } from "@/lib/types"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

interface SponsorBannerProps {
  placement: SponsorSlot["placement"]
}

export default function SponsorBanner({ placement }: SponsorBannerProps) {
  // undefined = loading, null = no active sponsor, SponsorSlot = found
  const [slot, setSlot] = useState<SponsorSlot | null | undefined>(undefined)

  useEffect(() => {
    async function fetchSlot() {
      if (!configured) {
        setSlot(null)
        return
      }
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const now = new Date().toISOString()
      const { data } = await supabase
        .from("sponsor_slots")
        .select("id, title, subtitle, placement, emoji, image_url, target_url, active_from, active_until")
        .eq("placement", placement)
        .eq("active", true)
        .or(`active_from.is.null,active_from.lte.${now}`)
        .or(`active_until.is.null,active_until.gte.${now}`)
        .limit(1)
        .maybeSingle()
      setSlot((data as SponsorSlot | null) ?? null)
    }
    fetchSlot()
  }, [placement])

  async function handleClick() {
    if (!slot?.target_url) return
    if (configured) {
      // Fire-and-forget click tracking — open the URL immediately
      ;(async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from("sponsor_clicks").insert({
          sponsor_slot_id: slot.id,
          user_id: user?.id ?? null,
          placement,
          page_path: typeof window !== "undefined" ? window.location.pathname : null,
          user_agent:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 250)
              : null,
        })
      })()
    }
    window.open(slot.target_url, "_blank", "noopener,noreferrer")
  }

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (slot === undefined) {
    return (
      <div className="w-full h-[68px] bg-gray-900 border border-white/5 rounded-2xl animate-pulse" />
    )
  }

  // ── No active sponsor — show advertising placeholder ──────────────────
  if (!slot) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-dashed border-white/10 rounded-2xl p-4 text-center">
        <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-1">Sponsored</p>
        <p className="text-gray-500 text-sm mb-2">Advertising space available</p>
        <a
          href="mailto:ads@fanrush.com"
          className="text-orange-400 text-xs hover:text-orange-300 hover:underline transition-colors"
        >
          Advertise here →
        </a>
      </div>
    )
  }

  // ── Active sponsor ────────────────────────────────────────────────────
  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10 flex-shrink-0">
          {slot.emoji ?? "📣"}
        </div>
        <div className="min-w-0">
          <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Sponsored</p>
          <p className="text-white font-semibold text-sm truncate">{slot.title}</p>
          {slot.subtitle && (
            <p className="text-gray-400 text-xs truncate">{slot.subtitle}</p>
          )}
        </div>
      </div>

      {slot.target_url ? (
        <button
          onClick={handleClick}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-orange-500/15 text-orange-400 text-xs font-semibold hover:bg-orange-500/25 transition-colors min-h-[36px]"
        >
          Learn More
        </button>
      ) : (
        <span className="text-gray-600 text-xs flex-shrink-0 text-right leading-tight">
          Partner link<br />coming soon
        </span>
      )}
    </div>
  )
}
