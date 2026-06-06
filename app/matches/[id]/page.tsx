import { notFound } from "next/navigation"
import AppShell from "@/components/AppShell"
import { mockMatches, mockVenues, currentUser } from "@/lib/mock-data"
import MatchDetailClient from "./MatchDetailClient"

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params
  const match = mockMatches.find((m) => m.id === id)

  if (!match) notFound()

  const relatedVenues = mockVenues.filter(
    (v) => v.status === "approved" && v.matchIds.includes(match.id)
  )

  const existingPrediction = currentUser.predictions.find(
    (p) => p.matchId === match.id
  )

  const title = `${match.homeTeam.flagEmoji} ${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode} ${match.awayTeam.flagEmoji}`

  return (
    <AppShell title={title} showBack>
      <MatchDetailClient
        match={match}
        relatedVenues={relatedVenues}
        existingPrediction={existingPrediction}
      />
    </AppShell>
  )
}
