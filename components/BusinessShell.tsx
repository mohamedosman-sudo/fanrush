"use client"

import AppShell from "@/components/AppShell"
import BusinessSidebar from "@/components/BusinessSidebar"
import MobileAdminNav from "@/components/MobileAdminNav"
import { BUSINESS_NAV_LINKS } from "@/lib/business-nav-links"

interface BusinessShellProps {
  title: string
  children: React.ReactNode
}

export default function BusinessShell({ title, children }: BusinessShellProps) {
  return (
    <AppShell title={title} showBottomNav={false}>
      <MobileAdminNav title="Business" links={BUSINESS_NAV_LINKS} />
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <div className="hidden md:block flex-shrink-0">
          <BusinessSidebar />
        </div>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </AppShell>
  )
}
