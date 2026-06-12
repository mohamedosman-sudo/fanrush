import type { Metadata, Viewport } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import GlobalWaveBackground from "@/components/GlobalWaveBackground"

/**
 * Explicit viewport export (Next.js 15+ requirement).
 * - width=device-width, initial-scale=1: standard responsive behaviour
 * - No maximum-scale restriction: users can still pinch-zoom for accessibility
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
  // viewport-fit=cover lets the app draw edge-to-edge so we can use
  // env(safe-area-inset-bottom) to pad the bottom nav above the iPhone
  // home indicator — required for proper PWA standalone mode on iOS.
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "FanRush — World Cup 2026 Fan Platform",
  description: "Find watch parties, predict scores, and connect with fans for the 2026 World Cup. FanRush is an independent fan platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FanRush",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <GlobalWaveBackground />
        <div className="relative z-10 min-h-full flex flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
