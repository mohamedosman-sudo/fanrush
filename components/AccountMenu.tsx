"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/context/SessionContext"

interface AccountMenuProps {
  email: string
}

export default function AccountMenu({ email }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const { role, signOut } = useSession()
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await signOut()
    router.push("/")
    router.refresh()
  }

  const initial = (email[0] ?? "?").toUpperCase()
  const close = () => setOpen(false)

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger — avatar + chevron */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all touch-manipulation select-none"
      >
        <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
          {initial}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-[60] overflow-hidden"
        >
          {/* Elevated role section */}
          {role === "admin" && (
            <section className="border-b border-white/5">
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500/70">
                Admin
              </p>
              <MenuItem
                href="/admin"
                label="Admin Dashboard"
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                }
                onClick={close}
              />
              <MenuItem href="/admin/launch" label="Launch Checklist" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              } onClick={close} />
              <MenuItem href="/home" label="Fan App" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              } onClick={close} />
              <MenuItem href="/" label="Public Landing" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              } onClick={close} />
            </section>
          )}

          {role === "business" && (
            <section className="border-b border-white/5">
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500/70">
                Business
              </p>
              <MenuItem href="/business" label="Business Dashboard" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
                </svg>
              } onClick={close} />
              <MenuItem href="/business/add-venue" label="Add Venue" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              } onClick={close} />
              <MenuItem href="/business/add-event" label="Add Event" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
                </svg>
              } onClick={close} />
              <MenuItem href="/business/analytics" label="Analytics" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              } onClick={close} />
              <MenuItem href="/business/pricing" label="Pricing" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v1.5h-2v-1.5c-1.66-.41-3-1.92-3-3.5h2c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5 0-.82-.66-1.5-1.5-1.5h-1c-1.93 0-3.5-1.57-3.5-3.5 0-1.58 1.34-3.09 3-3.5V7h2v1.5c1.66.41 3 1.92 3 3.5h-2c0-.83-.67-1.5-1.5-1.5h-1c-.83 0-1.5.67-1.5 1.5 0 .82.66 1.5 1.5 1.5h1c1.93 0 3.5 1.57 3.5 3.5 0 1.58-1.34 3.09-3 3.5z" />
                </svg>
              } onClick={close} />
              <MenuItem href="/home" label="Fan App" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              } onClick={close} />
              <MenuItem href="/" label="Public Landing" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              } onClick={close} />
            </section>
          )}

          {/* Common items for fan role (or no role) */}
          {role !== "admin" && role !== "business" && (
            <section className="border-b border-white/5 py-1">
              <MenuItem href="/home" label="Home" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              } onClick={close} />
              <MenuItem href="/profile" label="Profile" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              } onClick={close} />
              <MenuItem href="/" label="Public Landing" icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              } onClick={close} />
            </section>
          )}


          {/* Logout */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors text-sm font-medium touch-manipulation"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium touch-manipulation"
    >
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      {label}
    </Link>
  )
}
