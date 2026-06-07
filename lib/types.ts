export type Team = {
  id: string
  name: string
  shortCode: string
  group: string
  flagEmoji: string
}

export type City = {
  id: string
  name: string
  country: string
  timezone: string
  venueCount: number
}

export type Match = {
  id: string
  homeTeam: Team
  awayTeam: Team
  kickoffTime: string // ISO string
  stadium: string
  city: string
  cityId: string
  stage: string // "Group Stage", "Round of 16", etc.
  status: "upcoming" | "live" | "finished"
  homeScore?: number
  awayScore?: number
}

export type Venue = {
  id: string
  name: string
  cityId: string
  city: string
  address: string
  matchIds: string[]
  price: "free" | "ticketed"
  capacity: number
  bookingLink?: string
  featured: boolean
  bigScreen: boolean
  familyFriendly: boolean
  foodAvailable: boolean
  status: "pending" | "approved" | "rejected"
  businessId?: string
  views: number
  clicks: number
  saves: number
  bookings: number
  description?: string
  imageUrl?: string
}

export type Event = {
  id: string
  venueId: string
  name: string
  matchId: string
  date: string
  description: string
  status: "pending" | "approved" | "rejected"
}

export type Prediction = {
  id: string
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
  points?: number
}

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  favouriteTeams: string[]
  cityId: string
  interests: string[]
  savedVenues: string[]
  savedMatches: string[]
  points: number
  predictions: Prediction[]
  badges: string[]
}

export type League = {
  id: string
  name: string
  code: string
  creatorId: string
  memberIds: string[]
  sponsored: boolean
}

export type SponsorSlot = {
  id: string
  title: string
  subtitle?: string | null
  placement: "home" | "predictions" | "watch-parties" | "leagues" | "match-detail" | "business" | "global"
  emoji?: string | null
  image_url?: string | null
  target_url?: string | null
  active_from?: string | null
  active_until?: string | null
  active: boolean
  clicks?: number
  created_at?: string
  updated_at?: string
}

export type Deal = {
  id: string
  title: string
  description: string
  discount: string
  venueId?: string
  cityId?: string
  affiliateLink?: string
  category: "food" | "travel" | "merch" | "accommodation"
}

export type BusinessAccount = {
  id: string
  name: string
  email: string
  venueIds: string[]
  plan: "free" | "featured" | "premium"
  status: "active" | "pending" | "suspended"
}
