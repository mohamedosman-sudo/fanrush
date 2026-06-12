"use client"
import AppShell from "@/components/AppShell"
import AdminSidebar from "@/components/AdminSidebar"
import MobileAdminNav from "@/components/MobileAdminNav"
import { ADMIN_NAV_LINKS } from "@/lib/admin-nav-links"

interface AdminShellProps {
  title: string
  children: React.ReactNode
}

export default function AdminShell({ title, children }: AdminShellProps) {
  return (
    <AppShell title={title} showBottomNav={false}>
      <MobileAdminNav title="Admin" links={ADMIN_NAV_LINKS} />
      <div className="flex min-h-screen">
        <div className="hidden md:block flex-shrink-0">
          <AdminSidebar />
        </div>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </AppShell>
  )
}
