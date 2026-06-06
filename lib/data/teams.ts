import { Team } from "@/lib/types"
import { mockTeams } from "@/lib/mock-data"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Supabase row → app Team type
function rowToTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    shortCode: row.code as string,
    group: (row.group_name as string) ?? "",
    flagEmoji: (row.emoji as string) ?? "🏴",
  }
}

export { rowToTeam }

export async function getTeams(): Promise<Team[]> {
  if (!isSupabaseConfigured()) return mockTeams

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase.from("teams").select("*").order("name")
    if (error || !data?.length) return mockTeams
    return data.map(rowToTeam)
  } catch {
    return mockTeams
  }
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  const teams = await getTeams()
  return teams.find((t) => t.id === id)
}
