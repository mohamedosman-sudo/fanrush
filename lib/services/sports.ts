import { mockCities, mockMatches, mockTeams } from "@/lib/mock-data"
import type { City, Match, Team } from "@/lib/types"

export interface SportsDataService {
  getTeams(): Promise<Team[]>
  getCities(): Promise<City[]>
  getMatches(): Promise<Match[]>
  getMatch(id: string): Promise<Match | null>
}

export const mockSportsDataService: SportsDataService = {
  async getTeams() {
    return mockTeams
  },
  async getCities() {
    return mockCities
  },
  async getMatches() {
    return mockMatches
  },
  async getMatch(id) {
    return mockMatches.find((match) => match.id === id) ?? null
  },
}

// Swap this export for an API-backed implementation without changing consumers.
export const sportsDataService = mockSportsDataService
