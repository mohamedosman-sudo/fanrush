import { Venue } from "@/lib/types"
import { mockVenues } from "@/lib/mock-data"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/** Approved mock venues — used when Supabase is not configured (demo mode). */
const approvedMockVenues = mockVenues.filter((v) => v.status === "approved")

function rowToVenue(row: Record<string, unknown>, matchIds: string[] = []): Venue {
  // `cities` is an embedded resource from select("*, cities(name)")
  const citiesRow = row.cities as { name?: string } | null
  return {
    id: row.id as string,
    name: row.name as string,
    cityId: (row.city_id as string) ?? "",
    city: citiesRow?.name ?? "",
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
    description: (row.description as string) ?? undefined,
    imageUrl: (row.image_url as string) ?? undefined,
  }
}

async function fetchVenueMatchIds(
  supabase: Awaited<ReturnType<Awaited<typeof import("@/lib/supabase/server")>["createClient"]>>,
  venueIds: string[]
): Promise<Record<string, string[]>> {
  if (venueIds.length === 0) return {}
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

// ── Shared select string — always joins cities for the human-readable name ───
const VENUE_SELECT = "*, cities(name)"

export async function getVenues(): Promise<Venue[]> {
  if (!isSupabaseConfigured()) return approvedMockVenues

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select(VENUE_SELECT)
      .eq("status", "approved")
      .order("name")
    if (error) return approvedMockVenues          // error → mock fallback
    if (!data?.length) return []                  // configured + empty → honest empty

    const venueIds = data.map((r) => r.id as string)
    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return approvedMockVenues
  }
}

export async function getVenueById(id: string): Promise<Venue | undefined> {
  if (!isSupabaseConfigured()) return mockVenues.find((v) => v.id === id)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select(VENUE_SELECT)
      .eq("id", id)
      .single()
    if (error || !data) return mockVenues.find((v) => v.id === id)

    const matchIdsMap = await fetchVenueMatchIds(supabase, [id])
    return rowToVenue(data as Record<string, unknown>, matchIdsMap[id] ?? [])
  } catch {
    return mockVenues.find((v) => v.id === id)
  }
}

export async function getVenuesByCity(cityId: string): Promise<Venue[]> {
  if (!isSupabaseConfigured())
    return approvedMockVenues.filter((v) => v.cityId === cityId)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select(VENUE_SELECT)
      .eq("city_id", cityId)
      .eq("status", "approved")
      .order("name")
    if (error) return approvedMockVenues.filter((v) => v.cityId === cityId)
    if (!data?.length) return []

    const venueIds = data.map((r) => r.id as string)
    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return approvedMockVenues.filter((v) => v.cityId === cityId)
  }
}

export async function getVenuesByMatch(matchId: string): Promise<Venue[]> {
  if (!isSupabaseConfigured())
    return approvedMockVenues.filter((v) => v.matchIds.includes(matchId))

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // First find which venue IDs are showing this match.
    const { data: vmData, error: vmError } = await supabase
      .from("venue_matches")
      .select("venue_id")
      .eq("match_id", matchId)
    if (vmError) return approvedMockVenues.filter((v) => v.matchIds.includes(matchId))
    if (!vmData?.length) return []

    const venueIds = vmData.map((r) => (r as { venue_id: string }).venue_id)
    const { data, error } = await supabase
      .from("venues")
      .select(VENUE_SELECT)
      .in("id", venueIds)
      .eq("status", "approved")
    if (error) return approvedMockVenues.filter((v) => v.matchIds.includes(matchId))
    if (!data?.length) return []

    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return approvedMockVenues.filter((v) => v.matchIds.includes(matchId))
  }
}

export async function getFeaturedVenues(): Promise<Venue[]> {
  if (!isSupabaseConfigured())
    return approvedMockVenues.filter((v) => v.featured)

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("venues")
      .select(VENUE_SELECT)
      .eq("featured", true)
      .eq("status", "approved")
      .order("name")
    if (error) return approvedMockVenues.filter((v) => v.featured)
    if (!data?.length) return []

    const venueIds = data.map((r) => r.id as string)
    const matchIdsMap = await fetchVenueMatchIds(supabase, venueIds)
    return data.map((row) =>
      rowToVenue(row as Record<string, unknown>, matchIdsMap[row.id as string] ?? [])
    )
  } catch {
    return approvedMockVenues.filter((v) => v.featured)
  }
}
