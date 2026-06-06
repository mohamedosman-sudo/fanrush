"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"
import AuthNav from "./AuthNav"

interface HeaderProps {
  title?: string
  showBack?: boolean
  /** Explicit right-side content. When omitted the auth nav is shown instead. */
  rightElement?: ReactNode
}

export default function Header({ title, showBack, rightElement }: HeaderProps) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push("/home")
  }

  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all font-bold"
          >
            ←
          </button>
        )}
        {title ? (
          <h1 className="text-white font-bold text-lg tracking-tight">{title}</h1>
        ) : (
          <Link href="/home" className="flex items-center gap-1.5">
            <span className="text-orange-500 text-lg">⚡</span>
            <span className="text-orange-500 font-black text-xl tracking-tight">Fan</span>
            <span className="text-white font-black text-xl tracking-tight">Rush</span>
          </Link>
        )}
      </div>

      {/* Explicit override takes priority; otherwise show the auth widget */}
      <div className="flex items-center">
        {rightElement ?? <AuthNav compact />}
      </div>
    </header>
  )
}
