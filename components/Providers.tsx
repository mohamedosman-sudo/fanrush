"use client"

import { ReactNode } from "react"
import { ToastProvider } from "./Toast"
import { SessionProvider } from "@/lib/context/SessionContext"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
