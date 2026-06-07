"use client"

import { useState, useEffect } from "react"
import { mockTeams } from "@/lib/mock-data"
import { useToast } from "@/components/Toast"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/** World Cup 2026 opens June 11 — picks are editable until then. */
const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z")
const picksEditable = () => new Date() < TOURNAMENT_START

const TEAMS = [...mockTeams].sort((a, b) => a.name.localeCompare(b.name))

type Picks = { winner: string; topScorer: string; mvp: string }

const EMPTY: Picks = { winner: "", topScorer: "", mvp: "" }

function hasPicks(p: Picks) {
  return !!(p.winner || p.topScorer || p.mvp)
}

interface TournamentPicksSectionProps {
  userId: string | null
}

export default function TournamentPicksSection({ userId }: TournamentPicksSectionProps) {
  const { showToast } = useToast()

  // null = not yet loaded
  const [picks, setPicks] = useState<Picks | null>(null)
  const [form, setForm] = useState<Picks>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!configured || !userId) return
    async function load() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data } = await supabase
        .from("tournament_picks")
        .select("winner, top_scorer, mvp")
        .eq("user_id", userId)
        .single()
      if (data) {
        const p: Picks = {
          winner: (data.winner as string | null) ?? "",
          topScorer: (data.top_scorer as string | null) ?? "",
          mvp: (data.mvp as string | null) ?? "",
        }
        setPicks(p)
        setForm(p)
      } else {
        setPicks(EMPTY)
      }
    }
    load()
  }, [userId])

  async function handleSave() {
    if (!userId || saving) return
    setSaving(true)
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.from("tournament_picks").upsert(
      {
        user_id: userId,
        winner: form.winner || null,
        top_scorer: form.topScorer || null,
        mvp: form.mvp || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    if (error) {
      showToast("Failed to save picks — please try again.", "error")
    } else {
      setPicks(form)
      setEditing(false)
      showToast("Tournament picks saved! ✅", "success")
    }
    setSaving(false)
  }

  function startEditing() {
    setForm(picks ?? EMPTY)
    setEditing(true)
  }

  function cancelEditing() {
    setForm(picks ?? EMPTY)
    setEditing(false)
  }

  const canEdit = picksEditable()
  const locked = !canEdit
  const hasExistingPicks = picks !== null && hasPicks(picks)
  const showForm = canEdit && (!hasExistingPicks || editing)
  const showDisplay = hasExistingPicks && !editing

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-gray-500">
          🏆 Tournament Picks
        </p>
        {locked && (
          <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
            🔒 Locked
          </span>
        )}
        {!locked && showDisplay && (
          <button
            onClick={startEditing}
            className="text-gray-400 hover:text-orange-400 text-xs font-semibold border border-white/10 hover:border-orange-500/30 rounded-xl px-3 py-1.5 transition-all"
          >
            Edit
          </button>
        )}
      </div>

      {/* Not logged in */}
      {!userId && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-gray-500 text-sm">Log in to make your tournament picks.</p>
        </div>
      )}

      {/* Loading */}
      {userId && picks === null && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Display existing picks */}
      {userId && showDisplay && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 space-y-3">
          {picks!.winner && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400 text-xs font-medium shrink-0">🏆 World Cup Winner</span>
              <span className="text-white font-bold text-sm text-right">{picks!.winner}</span>
            </div>
          )}
          {picks!.topScorer && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400 text-xs font-medium shrink-0">⚽ Top Scorer</span>
              <span className="text-white font-bold text-sm text-right">{picks!.topScorer}</span>
            </div>
          )}
          {picks!.mvp && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400 text-xs font-medium shrink-0">⭐ Tournament MVP</span>
              <span className="text-white font-bold text-sm text-right">{picks!.mvp}</span>
            </div>
          )}
          {canEdit && (
            <p className="text-gray-600 text-xs border-t border-white/5 pt-3">
              You can update your picks until the tournament starts on 11 Jun 2026.
            </p>
          )}
        </div>
      )}

      {/* Input form (new picks or editing) */}
      {userId && showForm && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 space-y-4">
          {editing && (
            <p className="text-orange-400 text-xs font-semibold">✏️ Update your picks</p>
          )}

          {/* World Cup Winner */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">🏆 World Cup Winner</label>
            <select
              value={form.winner}
              onChange={(e) => setForm((f) => ({ ...f, winner: e.target.value }))}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 appearance-none"
            >
              <option value="">Select a team…</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.flagEmoji} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Top Scorer */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">⚽ Top Scorer</label>
            <input
              value={form.topScorer}
              onChange={(e) => setForm((f) => ({ ...f, topScorer: e.target.value }))}
              placeholder="e.g. Kylian Mbappé"
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Tournament MVP */}
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">⭐ Tournament MVP</label>
            <input
              value={form.mvp}
              onChange={(e) => setForm((f) => ({ ...f, mvp: e.target.value }))}
              placeholder="e.g. Lionel Messi"
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="flex gap-2">
            {editing && (
              <button
                onClick={cancelEditing}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasPicks(form)}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95"
            >
              {saving ? "Saving…" : editing ? "Update Picks" : "Save Picks 🎯"}
            </button>
          </div>
        </div>
      )}

      {/* Locked and never made picks */}
      {userId && picks !== null && !hasExistingPicks && locked && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-2">🔒</p>
          <p className="text-white font-semibold text-sm mb-1">Picks are locked</p>
          <p className="text-gray-500 text-xs">The tournament has started — picks can no longer be changed.</p>
        </div>
      )}
    </div>
  )
}
