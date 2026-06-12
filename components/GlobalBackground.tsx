"use client"
import { usePathname } from "next/navigation"

function getMode(pathname: string): "public" | "fan" | "business" | "admin" {
  if (pathname === "/" || /^\/(pricing|advertise|about|legal)/.test(pathname)) return "public"
  if (pathname.startsWith("/business")) return "business"
  if (pathname.startsWith("/admin")) return "admin"
  return "fan"
}

export default function GlobalBackground() {
  const pathname = usePathname()
  const mode = getMode(pathname)
  return (
    <div className="fanrush-bg" data-mode={mode} aria-hidden="true">
      <div className="fanrush-bg-crowd" />
    </div>
  )
}
