"use client"

import { usePathname } from "next/navigation"

type BackgroundMode = "public" | "fan" | "business" | "admin"

function getMode(pathname: string): BackgroundMode {
  if (pathname.startsWith("/admin")) return "admin"
  if (pathname.startsWith("/business")) return "business"
  if (
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/advertise" ||
    pathname === "/about" ||
    pathname.startsWith("/legal")
  ) {
    return "public"
  }
  return "fan"
}

export default function StadiumWaveBackground() {
  const pathname = usePathname()
  const mode = getMode(pathname)

  return (
    <div className="stadium-bg fixed inset-0 z-0 pointer-events-none overflow-hidden" data-mode={mode} aria-hidden="true">
      <div className="stadium-bg__image" />
      <div className="stadium-bg__overlay" />

      <svg className="stadium-bg__waves" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
        <g className="stadium-bg__wave-group stadium-bg__wave-group--orange">
          <path d="M-180 555 C90 400 290 680 545 525 S980 355 1240 525 S1540 700 1740 515" stroke="#f97316" strokeWidth="2.2" />
          <path d="M-180 625 C120 465 335 750 625 575 S1030 420 1290 605 S1570 740 1740 580" stroke="#fb923c" strokeWidth="1" opacity=".62" />
        </g>
        <g className="stadium-bg__wave-group stadium-bg__wave-group--blue">
          <path d="M-180 450 C90 330 305 560 565 435 S975 290 1250 445 S1535 575 1740 420" stroke="#3b82f6" strokeWidth="1.8" />
          <path d="M-180 605 C115 455 330 725 610 560 S1015 405 1280 585 S1560 720 1740 555" stroke="#38bdf8" strokeWidth=".85" opacity=".5" />
        </g>
      </svg>
    </div>
  )
}
