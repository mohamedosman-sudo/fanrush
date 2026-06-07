import { notFound } from "next/navigation"
import AppShell from "@/components/AppShell"
import { mockMatches } from "@/lib/mock-data"
import { getVenuesByMatch } from "@/lib/data/venues"
import { getEventsByMatch } from "@/lib/data/events"
import MatchDetailClient from "./MatchDetailClient"
import { Prediction } from "@/lib/types"

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params
  const match = mockMatches.find((m) => m.id === id)
  if (!match) notFound()

  // Fetch approved venues and events for this match from Supabase (or mock fallback).
  const [relatedVenues, relatedEvents] = await Promise.all([
    getVenuesByMatch(match.id),
    getEventsByMatch(match.id),
  ])

  // Load existing prediction for the current user from Supabase (server-side).
  let existingPrediction: Prediction | undefined
  const configured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  if (configured) {
    try {
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id)
          .eq("match_id", match.id)
          .single()
        if (data) {
          existingPrediction = {
            id: data.id as string,
            userId: data.user_id as string,
            matchId: data.match_id as string,
            homeScore: data.home_score as number,
            awayScore: data.away_score as number,
            points: data.points != null ? (data.points as number) : undefined,
          }
        }
      }
    } catch {
      // Server-side prediction load failed silently; PredictionCard falls back to localStorage
    }
  }

  const title = `${match.homeTeam.flagEmoji} ${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode} ${match.awayTeam.flagEmoji}`

  return (
    <AppShell title={title} showBack>
      <MatchDetailClient
        match={match}
        relatedVenues={relatedVenues}
        relatedEvents={relatedEvents}
        existingPrediction={existingPrediction}
      />
    </AppShell>
  )
}
