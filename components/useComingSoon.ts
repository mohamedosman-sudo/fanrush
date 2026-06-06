"use client"
import { useToast } from "./Toast"

export function useComingSoon() {
  const { showToast } = useToast()

  return (feature?: string) => {
    showToast(
      feature
        ? `${feature} is ready for integration but not yet connected.`
        : "This feature is ready for integration but not yet connected.",
      "info"
    )
  }
}
