import AppShell from "@/components/AppShell"
import WatchPartiesClient from "./WatchPartiesClient"
import { getVenues } from "@/lib/data/venues"
import { mockVenues } from "@/lib/mock-data"

/**
 * Server component — fetches approved venues from Supabase (or returns the
 * approved subset of mock data when Supabase is not configured).
 * Passes them to the interactive client component for filtering.
 */
export default async function WatchPartiesPage() {
  const configured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const venues = await getVenues()

  // `usingDemo` is true when Supabase is not configured — getVenues() returns
  // approved mock venues in that case.  When configured, we always trust the
  // DB result (even if empty) as the source of truth.
  const usingDemo =
    !configured ||
    (venues.length > 0 &&
      venues.every((v) => mockVenues.some((m) => m.id === v.id)))

  return (
    <AppShell title="Watch Parties">
      <WatchPartiesClient venues={venues} usingDemo={usingDemo} />
    </AppShell>
  )
}
