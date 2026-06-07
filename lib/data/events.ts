import { Event } from "@/lib/types"
import { mockEvents } from "@/lib/mock-data"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function rowToEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    venueId: row.venue_id as string,
    name: (row.title as string) ?? "",
    matchId: (row.match_id as string) ?? "",
    date: (row.event_date as string) ?? "",
    description: (row.description as string) ?? "",
    status: ((row.status as string) ?? "pending") as Event["status"],
  }
}

/** Approved mock events — used when Supabase is not configured (demo mode). */
const approvedMockEvents = mockEvents.filter((e) => e.status === "approved")

export async function getEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured()) return approvedMockEvents

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")   // ← only approved events for public views
      .order("event_date")
    if (error) return approvedMockEvents          // error → graceful mock fallback
    if (!data?.length) return []                  // empty → honest empty state
    return data.map((row) => rowToEvent(row as Record<string, unknown>))
  } catch {
    return approvedMockEvents
  }
}

export async function getEventsByVenue(venueId: string): Promise<Event[]> {
  if (!isSupabaseConfigured())
    return approvedMockEvents.filter((e) => e.venueId === venueId)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("venue_id", venueId)
      .eq("status", "approved")   // ← only approved
      .order("event_date")
    if (error) return approvedMockEvents.filter((e) => e.venueId === venueId)
    if (!data?.length) return []
    return data.map((row) => rowToEvent(row as Record<string, unknown>))
  } catch {
    return approvedMockEvents.filter((e) => e.venueId === venueId)
  }
}

export async function getEventsByMatch(matchId: string): Promise<Event[]> {
  if (!isSupabaseConfigured())
    return approvedMockEvents.filter((e) => e.matchId === matchId)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("match_id", matchId)
      .eq("status", "approved")   // ← only approved
      .order("event_date")
    if (error) return approvedMockEvents.filter((e) => e.matchId === matchId)
    if (!data?.length) return []
    return data.map((row) => rowToEvent(row as Record<string, unknown>))
  } catch {
    return approvedMockEvents.filter((e) => e.matchId === matchId)
  }
}
