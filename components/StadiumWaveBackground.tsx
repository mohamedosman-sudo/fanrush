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
    <div
      className="stadium-bg fixed inset-0 z-0 pointer-events-none overflow-hidden"
      data-mode={mode}
      aria-hidden="true"
    >
      {/* Stadium photograph */}
      <div className="stadium-bg__image" />

      {/* Dark scrim — keeps text legible */}
      <div className="stadium-bg__overlay" />

      {/*
        SVG ribbon layer — thick neon ribbons that complement the
        orange/blue light streaks already baked into the photograph.
        Two groups are independently animated so the motion feels organic.
        A feGaussianBlur filter adds glow without extra DOM nodes.
      */}
      <svg
        className="stadium-bg__waves"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          {/* Glow filter for orange ribbon */}
          <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow filter for blue ribbon */}
          <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/*
          ORANGE group — mirrors the rising orange streak from the image:
          sweeps from lower-left upward to upper-right.
          Three strokes: fat glow halo → mid core → bright hot centre.
        */}
        <g className="stadium-bg__wave-group stadium-bg__wave-group--orange" filter="url(#glow-orange)">
          {/* Halo — very wide, low opacity */}
          <path
            d="M-200 780 C100 580 350 420 640 360 S1040 260 1340 310 S1560 380 1700 320"
            stroke="#f97316"
            strokeWidth="18"
            opacity="0.30"
          />
          {/* Core ribbon */}
          <path
            d="M-200 780 C100 580 350 420 640 360 S1040 260 1340 310 S1560 380 1700 320"
            stroke="#f97316"
            strokeWidth="7"
            opacity="0.80"
          />
          {/* Hot centre highlight */}
          <path
            d="M-200 780 C100 580 350 420 640 360 S1040 260 1340 310 S1560 380 1700 320"
            stroke="#fdba74"
            strokeWidth="2.5"
            opacity="0.95"
          />
          {/* Secondary trailing ribbon */}
          <path
            d="M-200 840 C140 640 380 490 660 430 S1070 330 1360 370 S1580 440 1720 380"
            stroke="#ea580c"
            strokeWidth="5"
            opacity="0.55"
          />
        </g>

        {/*
          BLUE group — mirrors the blue arc from the image:
          sweeps from upper-left across the middle.
          Same three-stroke layering technique.
        */}
        <g className="stadium-bg__wave-group stadium-bg__wave-group--blue" filter="url(#glow-blue)">
          {/* Halo */}
          <path
            d="M-200 320 C120 280 360 340 620 400 S980 500 1260 420 S1540 330 1720 360"
            stroke="#3b82f6"
            strokeWidth="16"
            opacity="0.28"
          />
          {/* Core ribbon */}
          <path
            d="M-200 320 C120 280 360 340 620 400 S980 500 1260 420 S1540 330 1720 360"
            stroke="#3b82f6"
            strokeWidth="6"
            opacity="0.82"
          />
          {/* Hot centre highlight */}
          <path
            d="M-200 320 C120 280 360 340 620 400 S980 500 1260 420 S1540 330 1720 360"
            stroke="#93c5fd"
            strokeWidth="2"
            opacity="0.90"
          />
          {/* Secondary trailing ribbon */}
          <path
            d="M-200 380 C150 330 390 380 660 450 S1010 545 1290 470 S1560 380 1740 410"
            stroke="#2563eb"
            strokeWidth="4.5"
            opacity="0.50"
          />
        </g>
      </svg>
    </div>
  )
}
