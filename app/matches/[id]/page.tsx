import { notFound } from "next/navigation"
import AppShell from "@/components/AppShell"
import { mockMatches, currentUser } from "@/lib/mock-data"
import { getVenuesByMatch } from "@/lib/data/venues"
import { getEventsByMatch } from "@/lib/data/events"
import MatchDetailClient from "./MatchDetailClient"

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

  const existingPrediction = currentUser.predictions.find((p) => p.matchId === match.id)

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
