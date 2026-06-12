"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const businessLinks = [
  {
    label: "Overview",
    href: "/business",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Add Venue",
    href: "/business/add-venue",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Add Event",
    href: "/business/add-event",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/business#analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M5 20V14m4 6V9m4 11V4m4 16v-7" />
      </svg>
    ),
  },
]

export default function BusinessSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#0a0a0f] border-r border-white/5 min-h-screen hidden md:flex flex-col p-4">
      {/* Logo — links to Business Portal home */}
      <div className="px-2 py-3 mb-6">
        <Link href="/business" className="inline-flex items-center gap-1 text-white font-black text-xl hover:opacity-80 transition-opacity">
          <span className="text-orange-500">⚡</span>FanRush
        </Link>
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mt-1">Business Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {businessLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/business" && !link.href.includes("#") && pathname?.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <Link
          href="/home"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
          Back to App
        </Link>
        <Link href="/pricing" className="text-xs text-orange-400 font-semibold hover:text-orange-300 transition-colors px-3">
          Upgrade to Premium →
        </Link>
      </div>
    </aside>
  )
}
