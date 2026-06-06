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
    <div className="bg-[#0a0a0f] border-b border-white/5 px-4 py-2 md:hidden">
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-sm flex-shrink-0">{title}</span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-white bg-gray-900"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
