"use client"

import { useState, useEffect, useCallback } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import MobileAdminNav from "@/components/MobileAdminNav"
import { SponsorSlot } from "@/lib/types"

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Venues", href: "/admin/venues" },
  { label: "Events", href: "/admin/events" },
  { label: "Matches", href: "/admin/matches" },
  { label: "Sponsors", href: "/admin/sponsors" },
  { label: "Launch", href: "/admin/launch" },
]

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
  home:           "bg-orange-500/15  text-orange-400  border-orange-500/25",
  predictions:    "bg-yellow-500/15  text-yellow-400  border-yellow-500/25",
  "watch-parties":"bg-blue-500/15    text-blue-400    border-blue-500/25",
  leagues:        "bg-purple-500/15  text-purple-400  border-purple-500/25",
  "match-detail": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  business:       "bg-pink-500/15    text-pink-400    border-pink-500/25",
  global:         "bg-gray-500/15    text-gray-300    border-gray-500/25",
}

// ── Click row shape (fetched from Supabase) ───────────────────────────────────
type ClickRow = {
  sponsor_slot_id: string
  user_id: string | null
  placement: string | null
  page_path: string | null
  clicked_at: string
}

// ── Per-slot derived stats ────────────────────────────────────────────────────
type SlotStats = {
  total: number
  loggedIn: number
  loggedOut: number
  lastClicked: string | null
  recent: ClickRow[]
}

function buildStats(clicks: ClickRow[]): Record<string, SlotStats> {
  const map: Record<string, ClickRow[]> = {}
  for (const c of clicks) {
    if (!map[c.sponsor_slot_id]) map[c.sponsor_slot_id] = []
    map[c.sponsor_slot_id].push(c)
  }
  const out: Record<string, SlotStats> = {}
  for (const [sid, rows] of Object.entries(map)) {
    const sorted = [...rows].sort(
      (a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime()
    )
    out[sid] = {
      total:       rows.length,
      loggedIn:    rows.filter((r) => r.user_id !== null).length,
      loggedOut:   rows.filter((r) => r.user_id === null).length,
      lastClicked: sorted[0]?.clicked_at ?? null,
      recent:      sorted.slice(0, 10),
    }
  }
  return out
}

// ── Form state ────────────────────────────────────────────────────────────────
type FormState = {
  title:       string
  subtitle:    string
  placement:   SponsorSlot["placement"]
  emoji:       string
  target_url:  string
  active_from: string
  active_until: string
  active:      boolean
}

const emptyForm = (): FormState => ({
  title: "", subtitle: "", placement: "home", emoji: "📣",
  target_url: "", active_from: "", active_until: "", active: false,
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminSponsorsPage() {
  const [slots,      setSlots]      = useState<SponsorSlot[]>([])
  const [allClicks,  setAllClicks]  = useState<ClickRow[]>([])
  const [loading,    setLoading]    = useState(configured)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<FormState>(emptyForm)

  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editForm,   setEditForm]   = useState<FormState>(emptyForm)

  // Which slot card is showing its recent-clicks panel
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // ── Load data ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!configured) { setLoading(false); return }
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
          .select("sponsor_slot_id, user_id, placement, page_path, clicked_at")
          .order("clicked_at", { ascending: false }),
      ])

      if (slotsRes.error) throw slotsRes.error
      setSlots((slotsRes.data ?? []) as SponsorSlot[])
      setAllClicks((clicksRes.data ?? []) as ClickRow[])
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
    setSaving(true); setError(null)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: err } = await supabase.from("sponsor_slots").insert({
        title:       createForm.title.trim(),
        subtitle:    createForm.subtitle.trim() || null,
        placement:   createForm.placement,
        emoji:       createForm.emoji.trim() || "📣",
        target_url:  createForm.target_url.trim() || null,
        active_from: createForm.active_from  || null,
        active_until:createForm.active_until || null,
        active:      createForm.active,
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
      title:       slot.title,
      subtitle:    slot.subtitle    ?? "",
      placement:   slot.placement,
      emoji:       slot.emoji       ?? "📣",
      target_url:  slot.target_url  ?? "",
      active_from: slot.active_from  ? slot.active_from.slice(0, 10)  : "",
      active_until:slot.active_until ? slot.active_until.slice(0, 10) : "",
      active:      slot.active,
    })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !editForm.title.trim()) return
    setSaving(true); setError(null)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: err } = await supabase
        .from("sponsor_slots")
        .update({
          title:       editForm.title.trim(),
          subtitle:    editForm.subtitle.trim() || null,
          placement:   editForm.placement,
          emoji:       editForm.emoji.trim() || "📣",
          target_url:  editForm.target_url.trim() || null,
          active_from: editForm.active_from  || null,
          active_until:editForm.active_until || null,
          active:      editForm.active,
          updated_at:  new Date().toISOString(),
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
      setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, active: !s.active } : s))
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
      const { error: err } = await supabase.from("sponsor_slots").delete().eq("id", id)
      if (err) throw err
      setSlots((prev)    => prev.filter((s) => s.id !== id))
      setAllClicks((prev) => prev.filter((c) => c.sponsor_slot_id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete slot")
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────
  const statsMap    = buildStats(allClicks)
  const activeCount  = slots.filter((s) =>  s.active).length
  const inactiveCount= slots.filter((s) => !s.active).length
  const totalClicks  = allClicks.length
  const loggedInClicks  = allClicks.filter((c) => c.user_id !== null).length
  const loggedOutClicks = allClicks.filter((c) => c.user_id === null).length

  return (
    <AppShell showBottomNav={false} title="Admin - Sponsors">
      <MobileAdminNav title="Admin" links={ADMIN_LINKS} />
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-8">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-white font-black text-2xl">Sponsor Management</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Create and manage sponsored placements across the app.{" "}
                  <a
                    href="/advertise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    View public advertise page →
                  </a>
                </p>
              </div>
              <button
                onClick={() => { setShowCreate((v) => !v); setEditingId(null) }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors"
              >
                {showCreate ? "Cancel" : "+ New Sponsor Slot"}
              </button>
            </div>

            {/* ── 5-stat overview row ──────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Active",         value: activeCount,      accent: "text-emerald-400" },
                { label: "Inactive",       value: inactiveCount,    accent: "text-gray-400" },
                { label: "Total Clicks",   value: totalClicks,      accent: "text-orange-400" },
                { label: "Logged-In",      value: loggedInClicks,   accent: "text-blue-400" },
                { label: "Logged-Out",     value: loggedOutClicks,  accent: "text-yellow-400" },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="bg-gray-900 border border-white/8 rounded-2xl p-4 text-center"
                >
                  <p className={`font-black text-2xl ${accent}`}>{value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* ── Error ───────────────────────────────────────────────── */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* ── Not configured notice ────────────────────────────────── */}
            {!configured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-300 text-sm font-semibold">
                  Supabase not configured — connect your database to manage real sponsor slots.
                </p>
              </div>
            )}

            {/* ── Create Form ──────────────────────────────────────────── */}
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

            {/* ── Slots List ───────────────────────────────────────────── */}
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
                slots.map((slot) => {
                  const stats = statsMap[slot.id]
                  const isExpanded = expandedId === slot.id
                  const isEditing  = editingId  === slot.id

                  return (
                    <div
                      key={slot.id}
                      className={`bg-gray-900 border rounded-2xl overflow-hidden transition-colors ${
                        slot.active ? "border-white/10" : "border-white/5 opacity-75"
                      }`}
                    >
                      {/* ── Card header ───────────────────────────────── */}
                      <div className="p-4 flex items-start gap-3">

                        {/* Emoji */}
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10 flex-shrink-0">
                          {slot.emoji ?? "📣"}
                        </div>

                        {/* Info block */}
                        <div className="flex-1 min-w-0 space-y-1">

                          {/* Title + placement badge + status badge */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-white font-bold text-sm">{slot.title}</p>
                            {/* whitespace-nowrap prevents the text clipping bug */}
                            <span
                              className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                PLACEMENT_BADGE[slot.placement]
                              }`}
                            >
                              {slot.placement}
                            </span>
                            {slot.active ? (
                              <span className="inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Active
                              </span>
                            ) : (
                              <span className="inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold bg-gray-800 text-gray-500 border border-white/5">
                                Inactive
                              </span>
                            )}
                          </div>

                          {/* Subtitle */}
                          {slot.subtitle && (
                            <p className="text-gray-400 text-xs truncate">{slot.subtitle}</p>
                          )}

                          {/* Target URL + date range */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            {slot.target_url && (
                              <a
                                href={slot.target_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 text-xs hover:underline truncate max-w-[200px]"
                              >
                                {slot.target_url}
                              </a>
                            )}
                            {slot.active_from && (
                              <span className="text-gray-500 text-xs whitespace-nowrap">
                                From {slot.active_from.slice(0, 10)}
                              </span>
                            )}
                            {slot.active_until && (
                              <span className="text-gray-500 text-xs whitespace-nowrap">
                                Until {slot.active_until.slice(0, 10)}
                              </span>
                            )}
                          </div>

                          {/* Per-slot click stats */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 pt-0.5">
                            <span className="text-gray-300 text-xs">
                              <span className="font-bold text-white">{stats?.total ?? 0}</span> total clicks
                            </span>
                            <span className="text-blue-400 text-xs">
                              <span className="font-bold">{stats?.loggedIn ?? 0}</span> logged-in
                            </span>
                            <span className="text-yellow-400 text-xs">
                              <span className="font-bold">{stats?.loggedOut ?? 0}</span> logged-out
                            </span>
                            {stats?.lastClicked && (
                              <span className="text-gray-500 text-xs">
                                Last: {fmtDate(stats.lastClicked)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand toggle */}
                        {stats && stats.total > 0 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : slot.id)}
                            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-xs font-bold"
                            title={isExpanded ? "Hide recent clicks" : "Show recent clicks"}
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        )}
                      </div>

                      {/* ── Recent clicks panel ────────────────────────── */}
                      {isExpanded && stats && stats.recent.length > 0 && (
                        <div className="border-t border-white/5 px-4 pb-4">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-500 py-3">
                            Recent Clicks (last {stats.recent.length})
                          </p>
                          <div className="space-y-1">
                            {stats.recent.map((click, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
                              >
                                {/* Auth indicator */}
                                <span
                                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    click.user_id
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                  title={click.user_id ? "Logged-in user" : "Logged-out"}
                                >
                                  {click.user_id ? "✓" : "?"}
                                </span>

                                {/* Page path */}
                                <span className="text-gray-400 text-xs truncate flex-1 min-w-0">
                                  {click.page_path ?? "unknown"}
                                </span>

                                {/* Placement (may differ from slot if future-proofed) */}
                                {click.placement && click.placement !== slot.placement && (
                                  <span className="text-gray-600 text-xs flex-shrink-0 whitespace-nowrap">
                                    {click.placement}
                                  </span>
                                )}

                                {/* Timestamp */}
                                <span className="text-gray-500 text-xs flex-shrink-0 whitespace-nowrap">
                                  {fmtDate(click.clicked_at)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Inline edit form ───────────────────────────── */}
                      {isEditing ? (
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
                        /* ── Action buttons ───────────────────────────── */
                        <div className="border-t border-white/5 px-4 py-2.5 flex gap-2 flex-wrap">
                          <button
                            onClick={() => toggleActive(slot)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              slot.active
                                ? "border-red-500/30    text-red-400    hover:bg-red-500/10"
                                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {slot.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => { startEdit(slot); setShowCreate(false); setExpandedId(null) }}
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
                  )
                })
              )}
            </div>

          </div>
        </main>
      </div>
    </AppShell>
  )
}

// ── Shared form fields ────────────────────────────────────────────────────────
function SlotFormFields({
  form,
  onChange,
}: {
  form:     FormState
  onChange: (f: FormState) => void
}) {
  function set(patch: Partial<FormState>) { onChange({ ...form, ...patch }) }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

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

      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1">Active From (optional)</label>
        <input
          type="date"
          value={form.active_from}
          onChange={(e) => set({ active_from: e.target.value })}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-1">Active Until (optional)</label>
        <input
          type="date"
          value={form.active_until}
          onChange={(e) => set({ active_until: e.target.value })}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
        />
      </div>

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
