import HomeClient from "./HomeClient"
import { getVenues, getFeaturedVenues } from "@/lib/data/venues"
import { mockVenues } from "@/lib/mock-data"

/**
 * Server component — fetches approved venues from Supabase in parallel,
 * then renders the interactive HomeClient with real data.
 *
 * "nearbyVenues": top 2 approved venues (city-based filtering requires
 *   client-side localStorage; server uses global top venues as a proxy).
 * "featuredVenues": up to 2 featured + approved venues.
 */
export default async function HomePage() {
  const configured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [allVenues, featuredVenues] = await Promise.all([
    getVenues(),
    getFeaturedVenues(),
  ])

  const nearbyVenues = allVenues.slice(0, 2)

  // usingDemo is true when Supabase is not configured, or when every returned
  // venue ID matches a mock ID (i.e. getVenues() fell back to mock data).
  const usingDemo =
    !configured ||
    (allVenues.length > 0 &&
      allVenues.every((v) => mockVenues.some((m) => m.id === v.id)))

  return (
    <HomeClient
      nearbyVenues={nearbyVenues}
      featuredVenues={featuredVenues.slice(0, 2)}
      usingDemo={usingDemo}
    />
  )
}
