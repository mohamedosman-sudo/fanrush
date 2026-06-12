"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavLink = {
  label: string
  href: string
}

type MobileAdminNavProps = {
  links: NavLink[]
  title: string
}

export default function MobileAdminNav({ links, title }: MobileAdminNavProps) {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 md:hidden">
      <div className="flex items-center gap-3 px-4 py-2">
        <Link
          href="/home"
          className="flex-shrink-0 min-h-[44px] flex items-center text-xs text-gray-400 font-semibold hover:text-white transition-colors touch-manipulation"
        >
          ← App
        </Link>
        <span className="text-white font-bold text-sm flex-shrink-0">{title}</span>
        {/* Scrollable links with right-fade indicator */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pr-8">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" &&
                  link.href !== "/business" &&
                  pathname?.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex-shrink-0 min-h-[44px] flex items-center px-3 rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                    isActive
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                      : "text-gray-400 hover:text-white bg-gray-900 border border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
          {/* Fade to indicate more tabs */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent" />
        </div>
      </div>
    </div>
  )
}
