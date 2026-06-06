import { Venue } from "@/lib/types"
import { mockVenues } from "@/lib/mock-data"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function rowToVenue(row: Record<string, unknown>, matchIds: string[] = []): Venue {
  return {
    id: row.id as string,
    name: row.name as string,
    cityId: (row.city_id as string) ?? "",
    city: (row.city as string) ?? "",
    address: (row.address as string) ?? "",
    matchIds,
    price: ((row.price_type as string) ?? "free") as "free" | "ticketed",
    capacity: (row.capacity as number) ?? 0,
    bookingLink: (row.booking_url as string) ?? undefined,
    featured: (row.featured as boolean) ?? false,
    bigScreen: (row.big_screen as boolean) ?? false,
    familyFriendly: (row.family_friendly as boolean) ?? false,
    foodAvailable: (row.food_available as boolean) ?? false,
    status: ((row.status as string) ?? "pending") as Venue["status"],
    businessId: (row.owner_id as string) ?? undefined,
    views: (row.views as number) ?? 0,
    clicks: (row.clicks as number) ?? 0,
    saves: (row.saves as number) ?? 0,
    bookings: (row.bookings as number) ?? 0,
  }
}

async function fetchVenueMatchIds(
  supabase: Awaited<ReturnType<Awaited<typeof import("@/lib/supabase/server")>["createClient"]>>,
  venueIds: string[]
): Promise<Record<string, string[]>> {
  const { data } = await supabase
    .from("venue_matches")
    .select("venue_id, match_id")
    .in("venue_id", venueIds)

  const map: Record<string, string[]> = {}
  if (data) {
    for (const row of data as { venue_id: string; match_id: string }[]) {
      if (!map[row.venue_id]) map[row.venue_id] = []
      map[row.venue_id].push(row.match_id)
    }
  }
  return map
}

export async function getVenues(): Promise<Venue[]> {
  if (!isSupabaseConfigured()) return mockVenues.filter((v) => v.status === "approved")

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("status", "approved")
      .order("name")
    if (error || !data?.length) return mockVenues.filter((v) => v.status === "approved")

    const venueIds = data.map((r) => r.id as string)
    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return mockVenues.filter((v) => v.status === "approved")
  }
}

export async function getVenueById(id: string): Promise<Venue | undefined> {
  if (!isSupabaseConfigured()) return mockVenues.find((v) => v.id === id)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase.from("venues").select("*").eq("id", id).single()
    if (error || !data) return mockVenues.find((v) => v.id === id)

    const matchIdsMap = await fetchVenueMatchIds(supabase, [id])
    return rowToVenue(data as Record<string, unknown>, matchIdsMap[id] ?? [])
  } catch {
    return mockVenues.find((v) => v.id === id)
  }
}

export async function getVenuesByCity(cityId: string): Promise<Venue[]> {
  if (!isSupabaseConfigured())
    return mockVenues.filter((v) => v.cityId === cityId && v.status === "approved")

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("city_id", cityId)
      .eq("status", "approved")
      .order("name")
    if (error || !data?.length)
      return mockVenues.filter((v) => v.cityId === cityId && v.status === "approved")

    const venueIds = data.map((r) => r.id as string)
    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return mockVenues.filter((v) => v.cityId === cityId && v.status === "approved")
  }
}

export async function getVenuesByMatch(matchId: string): Promise<Venue[]> {
  if (!isSupabaseConfigured())
    return mockVenues.filter((v) => v.matchIds.includes(matchId) && v.status === "approved")

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: vmData, error: vmError } = await supabase
      .from("venue_matches")
      .select("venue_id")
      .eq("match_id", matchId)
    if (vmError || !vmData?.length)
      return mockVenues.filter((v) => v.matchIds.includes(matchId) && v.status === "approved")

    const venueIds = vmData.map((r) => (r as { venue_id: string }).venue_id)
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .in("id", venueIds)
      .eq("status", "approved")
    if (error || !data?.length)
      return mockVenues.filter((v) => v.matchIds.includes(matchId) && v.status === "approved")

    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return mockVenues.filter((v) => v.matchIds.includes(matchId) && v.status === "approved")
  }
}

export async function getFeaturedVenues(): Promise<Venue[]> {
  if (!isSupabaseConfigured())
    return mockVenues.filter((v) => v.featured && v.status === "approved")

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("featured", true)
      .eq("status", "approved")
      .order("name")
    if (error || !data?.length)
      return mockVenues.filter((v) => v.featured && v.status === "approved")

    const venueIds = data.map((r) => r.id as string)
    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return mockVenues.filter((v) => v.featured && v.status === "approved")
  }
}
