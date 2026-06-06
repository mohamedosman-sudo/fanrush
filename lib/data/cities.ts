import { City } from "@/lib/types"
import { mockCities } from "@/lib/mock-data"

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function rowToCity(row: Record<string, unknown>): City {
  return {
    id: row.id as string,
    name: row.name as string,
    country: (row.country as string) ?? "",
    timezone: (row.timezone as string) ?? "UTC",
    venueCount: 0,
  }
}

export async function getCities(): Promise<City[]> {
  if (!isSupabaseConfigured()) return mockCities

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase.from("cities").select("*").order("name")
    if (error || !data?.length) return mockCities
    return data.map(rowToCity)
  } catch {
    return mockCities
  }
}

export async function getCityById(id: string): Promise<City | undefined> {
  const cities = await getCities()
  return cities.find((c) => c.id === id)
}
