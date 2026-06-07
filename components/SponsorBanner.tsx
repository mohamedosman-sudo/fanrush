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
      // Fire-and-forget — window.open happens synchronously below
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
      <div className="w-full h-[72px] bg-gray-900 border border-white/5 rounded-2xl animate-pulse" />
    )
  }

  // ── No active sponsor — dashed placeholder ────────────────────────────
  if (!slot) {
    return (
      <div className="w-full border border-dashed border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-0.5">
            Sponsored
          </p>
          <p className="text-gray-500 text-xs">Advertising space available</p>
        </div>
        <a
          href="mailto:ads@fanrush.com"
          className="flex-shrink-0 text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors whitespace-nowrap"
        >
          Advertise →
        </a>
      </div>
    )
  }

  // ── Active sponsor ────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#111118]">
      {/* Orange top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />

      <div className="px-4 py-3 flex items-center gap-3">
        {/* Emoji icon */}
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl flex-shrink-0">
          {slot.emoji ?? "📣"}
        </div>

        {/* Text — min-w-0 + truncate so long titles never overflow */}
        <div className="flex-1 min-w-0">
          <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
            Sponsored
          </p>
          <p className="text-white font-bold text-sm leading-snug truncate">
            {slot.title}
          </p>
          {slot.subtitle && (
            <p className="text-gray-400 text-xs leading-snug truncate mt-0.5">
              {slot.subtitle}
            </p>
          )}
        </div>

        {/* CTA */}
        {slot.target_url ? (
          <button
            onClick={handleClick}
            className="flex-shrink-0 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-xs font-bold transition-all min-h-[36px] whitespace-nowrap"
          >
            Learn More
          </button>
        ) : (
          <span className="flex-shrink-0 text-gray-600 text-xs text-right leading-tight whitespace-nowrap">
            Link<br />soon
          </span>
        )}
      </div>
    </div>
  )
}
