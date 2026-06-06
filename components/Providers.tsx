"use client"

import { ToastProvider } from "./Toast"
import { ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
