import { Match } from "@/lib/types"
import { mockMatches } from "@/lib/mock-data"
import { rowToTeam } from "@/lib/data/teams"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function rowToMatch(row: Record<string, unknown>): Match {
  const homeTeam = rowToTeam(row.home_team as Record<string, unknown>)
  const awayTeam = rowToTeam(row.away_team as Record<string, unknown>)

  return {
    id: row.id as string,
    homeTeam,
    awayTeam,
    kickoffTime: row.kickoff_at as string,
    stadium: (row.stadium as string) ?? "",
    city: (row.city as string) ?? "",
    cityId: (row.city_id as string) ?? "",
    stage: (row.stage as string) ?? "",
    status: (row.status as Match["status"]) ?? "upcoming",
    homeScore: row.home_score != null ? (row.home_score as number) : undefined,
    awayScore: row.away_score != null ? (row.away_score as number) : undefined,
  }
}

export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured()) return mockMatches

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("matches")
      .select(
        "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)"
      )
      .order("kickoff_at")
    if (error || !data?.length) return mockMatches
    return data.map((row) => rowToMatch(row as Record<string, unknown>))
  } catch {
    return mockMatches
  }
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  if (!isSupabaseConfigured()) return mockMatches.find((m) => m.id === id)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("matches")
      .select(
        "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)"
      )
      .eq("id", id)
      .single()
    if (error || !data) return mockMatches.find((m) => m.id === id)
    return rowToMatch(data as Record<string, unknown>)
  } catch {
    return mockMatches.find((m) => m.id === id)
  }
}

export async function getUpcomingMatches(): Promise<Match[]> {
  const matches = await getMatches()
  return matches.filter((m) => m.status === "upcoming")
}

export async function getLiveMatches(): Promise<Match[]> {
  const matches = await getMatches()
  return matches.filter((m) => m.status === "live")
}
