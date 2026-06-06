// Safe localStorage helpers (SSR-safe)

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },

  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  },

  remove(key: string): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(key)
    } catch {}
  },
}

// Key constants
export const STORAGE_KEYS = {
  PREDICTIONS: "fanrush_predictions",
  SAVED_VENUES: "fanrush_saved_venues",
  SAVED_MATCHES: "fanrush_saved_matches",
  TEAMS: "fanrush_teams",
  CITY: "fanrush_city",
  INTERESTS: "fanrush_interests",
} as const
