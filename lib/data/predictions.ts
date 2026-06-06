import { Prediction } from "@/lib/types"
import { currentUser } from "@/lib/mock-data"
import { calcPredictionPoints } from "@/lib/utils"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function rowToPrediction(row: Record<string, unknown>): Prediction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    matchId: row.match_id as string,
    homeScore: row.home_score as number,
    awayScore: row.away_score as number,
    points: row.points != null ? (row.points as number) : undefined,
  }
}

export async function getUserPredictions(userId: string): Promise<Prediction[]> {
  if (!isSupabaseConfigured()) return currentUser.predictions

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error || !data) return currentUser.predictions
    return data.map((row) => rowToPrediction(row as Record<string, unknown>))
  } catch {
    return currentUser.predictions
  }
}

export async function upsertPrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: userId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
      },
      { onConflict: "user_id,match_id" }
    )
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

export async function calculateAndUpdatePoints(
  matchId: string,
  actualHome: number,
  actualAway: number
): Promise<void> {
  if (!isSupabaseConfigured()) return

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", matchId)
    if (error || !data?.length) return

    for (const row of data as Record<string, unknown>[]) {
      const points = calcPredictionPoints(
        { homeScore: row.home_score as number, awayScore: row.away_score as number },
        { homeScore: actualHome, awayScore: actualAway }
      )

      await supabase.from("predictions").update({ points }).eq("id", row.id as string)

      // Update user profile points total
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", row.user_id as string)
        .single()

      if (profile) {
        const currentPoints = (profile as { points: number }).points ?? 0
        const previousPoints = row.points != null ? (row.points as number) : 0
        await supabase
          .from("profiles")
          .update({ points: currentPoints - previousPoints + points })
          .eq("id", row.user_id as string)
      }
    }
  } catch {
    // no-op on error
  }
}
