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

export async function getEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured()) return mockEvents

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date")
    if (error || !data?.length) return mockEvents
    return data.map((row) => rowToEvent(row as Record<string, unknown>))
  } catch {
    return mockEvents
  }
}

export async function getEventsByVenue(venueId: string): Promise<Event[]> {
  if (!isSupabaseConfigured()) return mockEvents.filter((e) => e.venueId === venueId)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("venue_id", venueId)
      .order("event_date")
    if (error || !data?.length) return mockEvents.filter((e) => e.venueId === venueId)
    return data.map((row) => rowToEvent(row as Record<string, unknown>))
  } catch {
    return mockEvents.filter((e) => e.venueId === venueId)
  }
}

export async function getEventsByMatch(matchId: string): Promise<Event[]> {
  if (!isSupabaseConfigured()) return mockEvents.filter((e) => e.matchId === matchId)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("match_id", matchId)
      .order("event_date")
    if (error || !data?.length) return mockEvents.filter((e) => e.matchId === matchId)
    return data.map((row) => rowToEvent(row as Record<string, unknown>))
  } catch {
    return mockEvents.filter((e) => e.matchId === matchId)
  }
}
