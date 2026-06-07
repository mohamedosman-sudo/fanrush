"use client"

import Link from "next/link"
import { useState } from "react"
import AppShell from "@/components/AppShell"
import MatchCard from "@/components/MatchCard"
import VenueCard from "@/components/VenueCard"
import Leaderboard from "@/components/Leaderboard"
import SponsorBanner from "@/components/SponsorBanner"
import { mockMatches, mockUsers, mockDeals, mockSponsorSlots, currentUser } from "@/lib/mock-data"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import { Venue } from "@/lib/types"

const nextMatch = mockMatches[0]
const todaysMatches = mockMatches.slice(0, 5)

const leaderboardUsers = [...mockUsers]
  .sort((a, b) => b.points - a.points)
  .slice(0, 5)
  .map((u, i) => ({ name: u.name, points: u.points, avatar: u.avatar, rank: i + 1 }))

const dealsToShow = mockDeals.slice(0, 4)

const dealCategoryIcon: Record<string, string> = {
  food: "🍔",
  travel: "✈️",
  merch: "👕",
  accommodation: "🏨",
}

interface HomeClientProps {
  /** Up to 2 approved venues near the user's city (or top approved venues). */
  nearbyVenues: Venue[]
  /** Up to 2 approved featured venues. */
  featuredVenues: Venue[]
  /** True when venue data came from mock/demo rather than Supabase. */
  usingDemo: boolean
}

export default function HomeClient({ nearbyVenues, featuredVenues, usingDemo }: HomeClientProps) {
  const [savedVenuesCount] = useState(() =>
    storage.get<string[]>(STORAGE_KEYS.SAVED_VENUES, []).length || currentUser.savedVenues.length
  )
  const [savedMatchesCount] = useState(() =>
    storage.get<string[]>(STORAGE_KEYS.SAVED_MATCHES, []).length
  )
  const [predictionsCount] = useState(() => {
    const stored = Object.keys(storage.get<Record<string, unknown>>(STORAGE_KEYS.PREDICTIONS, {})).length
    return stored || currentUser.predictions.length
  })

  const kickoff = new Date(nextMatch.kickoffTime)
  const dateStr = kickoff.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  })
  const timeStr = kickoff.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  })

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-8">

        {/* 1. TONIGHT'S RUSH HERO */}
        <section>
          <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-3">
            ⚡ Tonight&apos;s Rush
          </p>
          <div
            className="relative rounded-3xl overflow-hidden p-6 border border-orange-500/20"
            style={{ background: "radial-gradient(ellipse at top right, rgba(249,115,22,0.2) 0%, #111118 60%)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                {nextMatch.stage}
              </span>
              <span className="text-gray-400 text-xs">{nextMatch.stadium}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl">{nextMatch.homeTeam.flagEmoji}</span>
                <span className="text-white font-bold text-sm">{nextMatch.homeTeam.name}</span>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-500/30">
                <span className="text-orange-500 font-black text-2xl">VS</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl">{nextMatch.awayTeam.flagEmoji}</span>
                <span className="text-white font-bold text-sm">{nextMatch.awayTeam.name}</span>
              </div>
            </div>
            <p className="text-orange-400 font-bold text-sm text-center mb-5">
              {dateStr} · {timeStr}
            </p>
            <div className="flex gap-3">
              <Link
                href="/predictions"
                className="flex-1 text-center border border-white/20 text-white rounded-xl py-2 px-4 text-sm font-semibold hover:border-white/40 transition-colors"
              >
                🎯 Predict Score
              </Link>
              <Link
                href="/watch-parties"
                className="flex-1 text-center bg-orange-500 hover:bg-orange-400 text-white rounded-xl py-2 px-4 text-sm font-bold transition-colors"
              >
                📍 Find Watch Party
              </Link>
            </div>
          </div>
        </section>

        {/* 2. TODAY'S MATCHES */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Today&apos;s Matches</h2>
            <Link href="/matches" className="text-orange-400 text-sm hover:text-orange-300">See all →</Link>
          </div>
          {/*
            Escape the section px-4 so the scroll track spans full screen width.
            -mx-4 pulls it to the device edge; px-4 re-adds inner padding so the
            first card starts flush with the rest of the page content.
            snap-x mandatory gives smooth card-by-card scrolling on iOS/Android.
          */}
          <div className="-mx-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 px-4 pb-2 snap-x snap-mandatory">
              {todaysMatches.map((match) => (
                <div key={match.id} className="min-w-[168px] w-[168px] flex-shrink-0 snap-start">
                  <MatchCard match={match} compact />
                </div>
              ))}
              {/* trailing spacer so last card isn't flush against the right edge */}
              <div className="w-4 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* 3. YOUR TEAMS */}
        <section>
          <h2 className="text-white font-bold text-lg mb-3">Your Teams</h2>
          <div className="-mx-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 px-4 pb-1">
            {currentUser.favouriteTeams.length > 0 ? (
              currentUser.favouriteTeams.slice(0, 5).map((teamId) => {
                const team = mockMatches
                  .flatMap((m) => [m.homeTeam, m.awayTeam])
                  .find((t) => t.id === teamId)
                if (!team) return null
                return (
                  <Link
                    key={teamId}
                    href={`/matches?team=${teamId}`}
                    className="flex-shrink-0 flex items-center gap-2 bg-gray-900 border border-white/10 rounded-full px-4 py-2 hover:border-orange-500/40 transition-colors"
                  >
                    <span className="text-lg">{team.flagEmoji}</span>
                    <span className="text-white font-medium text-sm">{team.name}</span>
                  </Link>
                )
              })
            ) : (
              <Link href="/onboarding" className="text-orange-400 text-sm font-semibold">
                Add teams →
              </Link>
            )}
          </div>
          </div>
        </section>

        {/* 4. WATCH PARTIES NEAR YOU */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Watch Parties Near You</h2>
            <Link href="/watch-parties" className="text-orange-400 text-sm hover:text-orange-300">See all →</Link>
          </div>
          {usingDemo && (
            <p className="text-yellow-400/70 text-xs mb-2">Sample venues — connect Supabase for live listings.</p>
          )}
          <div className="space-y-3">
            {nearbyVenues.length > 0 ? (
              nearbyVenues.map((venue) => <VenueCard key={venue.id} venue={venue} />)
            ) : (
              <p className="text-gray-500 text-sm">No approved venues yet — check back soon.</p>
            )}
          </div>
        </section>

        {/* 5. PREDICTION LEADERBOARD */}
        <section>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
            🏆 Prediction Leaders
          </p>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
            <Leaderboard users={leaderboardUsers} />
            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <Link href="/predictions" className="text-orange-400 text-sm font-semibold hover:text-orange-300">
                Join the game →
              </Link>
            </div>
          </div>
        </section>

        {/* 6. FEATURED VENUES */}
        {featuredVenues.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">Featured Fan Zones</h2>
              <Link href="/watch-parties" className="text-orange-400 text-sm hover:text-orange-300">See all →</Link>
            </div>
            {usingDemo && (
              <p className="text-yellow-400/70 text-xs mb-2">Sample venues — connect Supabase for live listings.</p>
            )}
            <div className="space-y-3">
              {featuredVenues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
            </div>
          </section>
        )}

        {/* 7. MATCHDAY DEALS */}
        <section>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">🔥 Matchday Deals</p>
          <div className="grid grid-cols-2 gap-3">
            {dealsToShow.map((deal) => {
              const content = (
                <>
                  <div className="text-3xl mb-2">{dealCategoryIcon[deal.category] ?? "🎁"}</div>
                  <div className="text-white font-bold text-sm leading-tight mb-2">{deal.title}</div>
                  <div className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold mb-3">
                    {deal.discount}
                  </div>
                  <div className="block text-orange-500 text-sm font-semibold">
                    {deal.affiliateLink ? "Get Deal →" : "Partner link coming soon"}
                  </div>
                </>
              )
              return deal.affiliateLink ? (
                <a
                  key={deal.id}
                  href={deal.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 border border-white/10 rounded-2xl p-4 hover:border-orange-500/30 transition-colors block"
                >
                  {content}
                </a>
              ) : (
                <div key={deal.id} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                  {content}
                </div>
              )
            })}
          </div>
        </section>

        {/* 8. FAN PASSPORT TEASER */}
        <section>
          <div className="bg-gradient-to-r from-orange-950/40 to-gray-900 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{currentUser.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-gray-400 text-xs">{predictionsCount} predictions</span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-gray-400 text-xs">{savedVenuesCount + savedMatchesCount} saved</span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-yellow-400 text-xs font-bold">{currentUser.badges.length} badges</span>
                </div>
              </div>
            </div>
            <Link href="/profile" className="text-orange-400 text-sm font-semibold hover:text-orange-300 flex-shrink-0">
              View Passport →
            </Link>
          </div>
        </section>

        {/* 9. SPONSOR BANNER */}
        <section>
          <SponsorBanner slot={mockSponsorSlots[0]} />
        </section>

      </div>
    </AppShell>
  )
}
