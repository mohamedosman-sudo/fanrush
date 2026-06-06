"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { mockTeams, mockCities } from "@/lib/mock-data"
import TeamSelector from "@/components/TeamSelector"
import CitySelector from "@/components/CitySelector"

const TOTAL_STEPS = 3
const MAX_TEAMS = 5

const INTERESTS = [
  { id: "watch-parties", label: "Watch Parties", icon: "📺" },
  { id: "predictions", label: "Predictions", icon: "🎯" },
  { id: "travel", label: "Travel & Away Games", icon: "✈️" },
  { id: "deals", label: "Matchday Deals", icon: "🎟️" },
  { id: "reminders", label: "Match Reminders", icon: "🔔" },
  { id: "fan-zones", label: "Fan Zones", icon: "🏟️" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("fanrush_teams") ?? "[]") } catch { return [] }
  })
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("fanrush_city") ?? ""
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("fanrush_interests") ?? "[]") } catch { return [] }
  })

  const progressPercent = (step / TOTAL_STEPS) * 100

  function toggleTeam(teamId: string) {
    setSelectedTeams((prev) => {
      if (prev.includes(teamId)) return prev.filter((t) => t !== teamId)
      if (prev.length >= MAX_TEAMS) return prev
      return [...prev, teamId]
    })
  }

  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      localStorage.setItem("fanrush_teams", JSON.stringify(selectedTeams))
      localStorage.setItem("fanrush_city", selectedCity)
      localStorage.setItem("fanrush_interests", JSON.stringify(selectedInterests))
      router.push("/home")
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  const canProceed =
    (step === 1 && selectedTeams.length > 0) ||
    (step === 2 && selectedCity !== "") ||
    (step === 3 && selectedInterests.length > 0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* ── HEADER ── */}
      <div className="border-b border-white/10 px-4 py-4 bg-[#0a0a0f]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            {/* Back button or spacer */}
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
              >
                ← Back
              </button>
            ) : (
              <Link href="/" className="flex items-center gap-1 font-black text-xl tracking-tight">
                <span className="text-orange-500">⚡</span>
                <span className="text-orange-500">Fan</span>
                <span className="text-white">Rush</span>
              </Link>
            )}

            {step > 1 && (
              <Link href="/" className="flex items-center gap-1 font-black text-xl tracking-tight">
                <span className="text-orange-500">⚡</span>
                <span className="text-orange-500">Fan</span>
                <span className="text-white">Rush</span>
              </Link>
            )}

            <span className="text-gray-500 text-xs font-medium">
              {step} / {TOTAL_STEPS}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-10">

          {/* Step 1: Team selector */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-black">Who do you support?</h1>
                  {selectedTeams.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                      {selectedTeams.length} / {MAX_TEAMS} selected
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">Pick up to {MAX_TEAMS} teams to follow</p>
              </div>
              <TeamSelector
                teams={mockTeams}
                selected={selectedTeams}
                onToggle={toggleTeam}
              />
            </div>
          )}

          {/* Step 2: City selector */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-black mb-2">Where are you based?</h1>
                <p className="text-gray-400 text-sm">We&apos;ll find watch parties near you</p>
              </div>
              <CitySelector
                cities={mockCities}
                selected={selectedCity}
                onSelect={setSelectedCity}
              />
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-black mb-2">What&apos;s your vibe?</h1>
                <p className="text-gray-400 text-sm">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id)
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-white/10 bg-gray-900 hover:border-white/20"
                      }`}
                    >
                      <span className="text-2xl">{interest.icon}</span>
                      <span
                        className={`font-semibold text-sm ${
                          isSelected ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {interest.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER NAV ── */}
      <div className="border-t border-white/10 px-4 py-4 bg-[#0a0a0f]">
        <div className="max-w-lg mx-auto">
          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? "w-6 bg-orange-500"
                    : i + 1 < step
                    ? "w-2 bg-orange-500/50"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${
              canProceed
                ? "bg-orange-500 hover:bg-orange-400 text-white"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            {step === TOTAL_STEPS ? "Let's Go! 🚀" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  )
}
