import { User } from "./types"

export function formatKickoffTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC"
}

export function getCountdown(isoString: string): string {
  const now = new Date()
  const kickoff = new Date(isoString)
  const diff = kickoff.getTime() - now.getTime()
  if (diff <= 0) return "Kicked off"
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function calcPredictionPoints(
  prediction: { homeScore: number; awayScore: number },
  actual: { homeScore: number; awayScore: number }
): number {
  if (prediction.homeScore === actual.homeScore && prediction.awayScore === actual.awayScore) return 5
  const predResult = Math.sign(prediction.homeScore - prediction.awayScore)
  const actualResult = Math.sign(actual.homeScore - actual.awayScore)
  if (predResult === actualResult) return 2
  return 0
}

export function getBadges(user: User): string[] {
  const badges: string[] = []
  if (user.predictions.length >= 1) badges.push("First Prediction")
  if (user.predictions.length >= 5) badges.push("Matchday Regular")
  if (user.savedVenues.length >= 1) badges.push("Venue Explorer")
  if (user.predictions.some(p => p.points === 5)) badges.push("Correct Score")
  if (user.points >= 20) badges.push("Super Fan")
  return badges
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
