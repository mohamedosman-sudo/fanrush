"use client"

import { useState, useEffect, useCallback } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import StatCard from "@/components/StatCard"
import { SponsorSlot } from "@/lib/types"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PLACEMENTS: SponsorSlot["placement"][] = [
  "home",
  "predictions",
  "watch-parties",
  "leagues",
  "match-detail",
  "business",
  "global",
]

const PLACEMENT_BADGE: Record<SponsorSlot["placement"], string> = {
  home: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  predictions: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "watch-parties": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  leagues: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "match-detail": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  business: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  global: "bg-gray-500/15 text-gray-300 border-gray-500/20",
}

type FormState = {
  title: string
  subtitle: string
  placement: SponsorSlot["placement"]
  emoji: string
  target_url: string
  active_from: string
  active_until: string
  active: boolean
}

const emptyForm = (): FormState => ({
  title: "",
  subtitle: "",
  placement: "home",
  emoji: "📣",
  target_url: "",
  active_from: "",
  active_until: "",
  active: false,
})

export default function AdminSponsorsPage() {
  const [slots, setSlots] = useState<SponsorSlot[]>([])
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(configured)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<FormState>(emptyForm)

  // Edit form — keyed by slot id
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  // ── Load slots + click counts ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!configured) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const [slotsRes, clicksRes] = await Promise.all([
        supabase
          .from("sponsor_slots")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("sponsor_clicks")
          .select("sponsor_slot_id"),
      ])

      if (slotsRes.error) throw slotsRes.error

      setSlots((slotsRes.data ?? []) as SponsorSlot[])

      const counts: Record<string, number> = {}
      ;(clicksRes.data ?? []).forEach((row) => {
        const sid = row.sponsor_slot_id as string
        counts[sid] = (counts[sid] ?? 0) + 1
      })
      setClickCounts(counts)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function run() { await loadData() }
    run()
  }, [loadData])

  // ── Create ────────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: err } = await supabase.from("sponsor_slots").insert({
        title: createForm.title.trim(),
        subtitle: createForm.subtitle.trim() || null,
        placement: createForm.placement,
        emoji: createForm.emoji.trim() || "📣",
        target_url: createForm.target_url.trim() || null,
        active_from: createForm.active_from || null,
        active_until: createForm.active_until || null,
        active: createForm.active,
      })
      if (err) throw err
      setCreateForm(emptyForm())
      setShowCreate(false)
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create slot")
    } finally {
      setSaving(false)
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────
  function startEdit(slot: SponsorSlot) {
    setEditingId(slot.id)
    setEditForm({
      title: slot.title,
      subtitle: slot.subtitle ?? "",
      placement: slot.placement,
      emoji: slot.emoji ?? "📣",
      target_url: slot.target_url ?? "",
      active_from: slot.active_from ? slot.active_from.slice(0, 10) : "",
      active_until: slot.active_until ? slot.active_until.slice(0, 10) : "",
      active: slot.active,
    })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !editForm.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: err } = await supabase
        .from("sponsor_slots")
        .update({
          title: editForm.title.trim(),
          subtitle: editForm.subtitle.trim() || null,
          placement: editForm.placement,
          emoji: editForm.emoji.trim() || "📣",
          target_url: editForm.target_url.trim() || null,
          active_from: editForm.active_from || null,
          active_until: editForm.active_until || null,
          active: editForm.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
      if (err) throw err
      setEditingId(null)
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update slot")
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────
  async function toggleActive(slot: SponsorSlot) {
    if (!configured) return
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: err } = await supabase
        .from("sponsor_slots")
        .update({ active: !slot.active, updated_at: new Date().toISOString() })
        .eq("id", slot.id)
      if (err) throw err
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, active: !s.active } : s))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle slot")
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this sponsor slot? This cannot be undone.")) return
    if (!configured) return
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: err } = await supabase
        .from("sponsor_slots")
        .delete()
        .eq("id", id)
      if (err) throw err
      setSlots((prev) => prev.filter((s) => s.id !== id))
      const updated = { ...clickCounts }
      delete updated[id]
      setClickCounts(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete slot")
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────
  const activeCount = slots.filter((s) => s.active).length
  const inactiveCount = slots.filter((s) => !s.active).length
  const totalClicks = Object.values(clickCounts).reduce((a, b) => a + b, 0)

  return (
    <AppShell showBottomNav={false} title="Admin - Sponsors">
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-white font-black text-2xl">Sponsor Management</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Create and manage sponsored placements across the app.
                </p>
              </div>
              <button
                onClick={() => { setShowCreate((v) => !v); setEditingId(null) }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors"
              >
                {showCreate ? "Cancel" : "+ New Sponsor Slot"}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Active Slots" value={activeCount} icon="✅" />
              <StatCard label="Inactive Slots" value={inactiveCount} icon="⏸️" />
              <StatCard label="Total Clicks" value={totalClicks} icon="👆" />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Not configured notice */}
            {!configured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-300 text-sm font-semibold">
                  Supabase not configured — connect your database to manage real sponsor slots.
                </p>
              </div>
            )}

            {/* Create Form */}
            {showCreate && (
              <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-5">
                <h2 className="text-white font-bold text-lg mb-4">Create Sponsor Slot</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <SlotFormFields form={createForm} onChange={setCreateForm} />
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving || !createForm.title.trim()}
                      className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                    >
                      {saving ? "Creating…" : "Create Slot"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Slots List */}
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg">
                Sponsor Slots{" "}
                <span className="text-gray-500 font-normal text-base">({slots.length})</span>
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">📣</p>
                  <p className="text-gray-400 text-sm">No sponsor slots yet — create one above.</p>
                </div>
              ) : (
                slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`bg-gray-900 border rounded-2xl overflow-hidden transition-colors ${
                      slot.active ? "border-white/10" : "border-white/5 opacity-70"
                    }`}
                  >
                    {/* Slot header row */}
                    <div className="p-4 flex items-start gap-3">
                      {/* Emoji */}
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10 flex-shrink-0">
                        {slot.emoji ?? "📣"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold text-sm">{slot.title}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              PLACEMENT_BADGE[slot.placement]
                            }`}
                          >
                            {slot.placement}
                          </span>
                          {slot.active ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-800 text-gray-500 border border-white/5">
                              Inactive
                            </span>
                          )}
                        </div>
                        {slot.subtitle && (
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{slot.subtitle}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {slot.target_url && (
                            <a
                              href={slot.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 text-xs hover:underline truncate max-w-[180px]"
                            >
                              {slot.target_url}
                            </a>
                          )}
                          {slot.active_from && (
                            <span className="text-gray-500 text-xs">
                              From {slot.active_from.slice(0, 10)}
                            </span>
                          )}
                          {slot.active_until && (
                            <span className="text-gray-500 text-xs">
                              Until {slot.active_until.slice(0, 10)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Click count badge */}
                      <div className="flex-shrink-0 text-center">
                        <p className="text-white font-black text-lg leading-none">
                          {clickCounts[slot.id] ?? 0}
                        </p>
                        <p className="text-gray-500 text-xs">clicks</p>
                      </div>
                    </div>

                    {/* Inline edit form */}
                    {editingId === slot.id ? (
                      <div className="border-t border-white/10 p-4">
                        <form onSubmit={handleEdit} className="space-y-4">
                          <SlotFormFields form={editForm} onChange={setEditForm} />
                          <div className="flex gap-3 pt-1">
                            <button
                              type="submit"
                              disabled={saving || !editForm.title.trim()}
                              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                            >
                              {saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Action buttons */
                      <div className="border-t border-white/5 px-4 py-2.5 flex gap-2 flex-wrap">
                        <button
                          onClick={() => toggleActive(slot)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            slot.active
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {slot.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => { startEdit(slot); setShowCreate(false) }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-gray-300 hover:border-white/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </AppShell>
  )
}

// ── Shared form fields component ──────────────────────────────────────────────
function SlotFormFields({
  form,
  onChange,
}: {
  form: FormState
  onChange: (f: FormState) => void
}) {
  function set(patch: Partial<FormState>) {
    onChange({ ...form, ...patch })
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Title */}
      <div className="sm:col-span-2">
        <label className="block text-gray-400 text-xs font-semibold mb-1">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="e.g. Coca-Cola Fan Zone"
          required
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Subtitle */}
      <div className="sm:col-span-2">
        <label className="block text-gray-400 text-xs font-semibold mb-1">Subtitle</label>
        <input
          type="text"
          value={form.subtitle}
          onChange={(e) => set({ subtitle: e.target.value })}
          placeholder="Short tagline or description"
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Placement */}
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1">Placement</label>
        <select
          value={form.placement}
          onChange={(e) => set({ placement: e.target.value as SponsorSlot["placement"] })}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        >
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1">Emoji</label>
        <input
          type="text"
          value={form.emoji}
          onChange={(e) => set({ emoji: e.target.value })}
          placeholder="📣"
          maxLength={4}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Target URL */}
      <div className="sm:col-span-2">
        <label className="block text-gray-400 text-xs font-semibold mb-1">Target URL</label>
        <input
          type="url"
          value={form.target_url}
          onChange={(e) => set({ target_url: e.target.value })}
          placeholder="https://sponsor.com/landing"
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Active from */}
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1">Active From (optional)</label>
        <input
          type="date"
          value={form.active_from}
          onChange={(e) => set({ active_from: e.target.value })}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Active until */}
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1">Active Until (optional)</label>
        <input
          type="date"
          value={form.active_until}
          onChange={(e) => set({ active_until: e.target.value })}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Active toggle */}
      <div className="sm:col-span-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set({ active: !form.active })}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              form.active ? "bg-orange-500" : "bg-gray-700"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                form.active ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-gray-300 text-sm font-medium">
            {form.active ? "Active (visible in app)" : "Inactive (hidden)"}
          </span>
        </label>
      </div>
    </div>
  )
}
