"use client"

import { useState } from "react"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import { mockCities } from "@/lib/mock-data"
import { City } from "@/lib/types"

type CityForm = {
  name: string
  country: string
  timezone: string
  id: string
}

const emptyForm = (): CityForm => ({ name: "", country: "", timezone: "", id: "" })

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>(mockCities)
  const [form, setForm] = useState<CityForm>(emptyForm())
  const [successMsg, setSuccessMsg] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<CityForm>(emptyForm())

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.id) return
    const newCity: City = {
      id: form.id,
      name: form.name,
      country: form.country,
      timezone: form.timezone,
      venueCount: 0,
    }
    setCities((prev) => [...prev, newCity])
    setForm(emptyForm())
    showSuccess(`"${newCity.name}" added successfully.`)
  }

  function handleRemove(id: string) {
    setCities((prev) => prev.filter((c) => c.id !== id))
  }

  function startEdit(city: City) {
    setEditingId(city.id)
    setEditForm({ name: city.name, country: city.country, timezone: city.timezone, id: city.id })
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    setCities((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, name: editForm.name, country: editForm.country, timezone: editForm.timezone, id: editForm.id }
          : c
      )
    )
    setEditingId(null)
    showSuccess("City updated.")
  }

  return (
    <AppShell showBottomNav={false} title="Admin - Cities">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-white font-black text-2xl">City Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage World Cup host cities</p>
            </div>

            {/* Success message */}
            {successMsg && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                {successMsg}
              </div>
            )}

            {/* Add City Form */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Add City</p>
              <form onSubmit={handleAdd}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">City Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="New York / New Jersey"
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="USA"
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">Timezone</label>
                    <input
                      type="text"
                      value={form.timezone}
                      onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                      placeholder="America/New_York"
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">City ID</label>
                    <input
                      type="text"
                      value={form.id}
                      onChange={(e) => setForm({ ...form, id: e.target.value })}
                      placeholder="new-york — used as URL slug"
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Add City
                </button>
              </form>
            </div>

            {/* Cities List */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Active Cities</p>
              <div className="space-y-2">
                {cities.map((city) => (
                  <div key={city.id}>
                    {editingId === city.id ? (
                      <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Edit City</p>
                        <form onSubmit={handleSaveEdit}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="City Name"
                              className="bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                            />
                            <input
                              type="text"
                              value={editForm.country}
                              onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                              placeholder="Country"
                              className="bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                            />
                            <input
                              type="text"
                              value={editForm.timezone}
                              onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                              placeholder="Timezone"
                              className="bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                            />
                            <input
                              type="text"
                              value={editForm.id}
                              onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                              placeholder="City ID slug"
                              className="bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg text-xs transition-all"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-4 py-1.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-bold rounded-lg text-xs transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="bg-gray-900 border border-white/10 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold">{city.name}</span>
                            <span className="bg-gray-800 px-2 py-0.5 rounded text-orange-400 text-xs font-mono">{city.id}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-gray-400 text-sm">{city.country}</span>
                            <span className="text-gray-500 text-xs font-mono">{city.timezone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(city)}
                            className="px-3 py-1.5 border border-white/10 hover:border-white/20 text-white font-bold rounded-lg text-xs transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(city.id)}
                            className="px-3 py-1.5 border border-red-500/30 hover:border-red-500/60 text-red-400 font-bold rounded-lg text-xs transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </AppShell>
  )
}
