"use client"

import { useState } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import StatCard from "@/components/StatCard"
import { mockSponsorSlots } from "@/lib/mock-data"
import { SponsorSlot } from "@/lib/types"

const TYPE_BADGE: Record<SponsorSlot["type"], string> = {
  banner: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  league: "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
  city: "bg-blue-500/15 text-blue-400 border-blue-500/20",
}

export default function AdminSponsorsPage() {
  const [slots, setSlots] = useState<SponsorSlot[]>(mockSponsorSlots)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<SponsorSlot["type"]>("banner")

  const activeCount = slots.filter((s) => s.active).length
  const inactiveCount = slots.filter((s) => !s.active).length

  function toggleActive(id: string) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }

  function addSlot() {
    if (!newName.trim()) return
    const newSlot: SponsorSlot = {
      id: `s${Date.now()}`,
      name: newName.trim(),
      type: newType,
      active: false,
    }
    setSlots((prev) => [...prev, newSlot])
    setNewName("")
    setNewType("banner")
  }

  return (
    <AppShell showBottomNav={false} title="Admin - Sponsors">
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

            {/* Header */}
            <div>
              <h1 className="text-white font-black text-2xl">Sponsor Management</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Active Slots" value={activeCount} icon="✅" color="green" />
              <StatCard label="Inactive Slots" value={inactiveCount} icon="🔲" color="yellow" />
            </div>

            {/* Sponsor Slots */}
            <section>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Sponsor Slots</p>
              <div className="space-y-3">
                {slots.map((slot) => (
                  <div key={slot.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${TYPE_BADGE[slot.type]}`}
                          >
                            {slot.type}
                          </span>
                          {slot.active ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 text-xs font-bold border border-gray-600/50">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-white font-bold truncate">{slot.name}</p>
                        <p className="text-gray-500 text-xs capitalize mt-0.5">{slot.type} slot</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(slot.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        slot.active
                          ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {slot.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Add Sponsor Slot */}
            <section>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Add Sponsor Slot</p>
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-48">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nike Match Sponsor"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSlot()}
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-2">
                      Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as SponsorSlot["type"])}
                      className="bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                    >
                      <option value="banner">Banner</option>
                      <option value="league">League</option>
                      <option value="city">City</option>
                    </select>
                  </div>
                  <button
                    onClick={addSlot}
                    disabled={!newName.trim()}
                    className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-all"
                  >
                    Add Slot
                  </button>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </AppShell>
  )
}
