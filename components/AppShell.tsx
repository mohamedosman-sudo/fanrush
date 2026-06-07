import { ReactNode } from "react"
import Header from "./Header"
import BottomNav from "./BottomNav"

interface AppShellProps {
  children: ReactNode
  title?: string
  showBack?: boolean
  showBottomNav?: boolean
  rightElement?: ReactNode
}

export default function AppShell({
  children,
  title,
  showBack,
  showBottomNav = true,
  rightElement,
}: AppShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #12121f 0%, #0a0a0f 280px)" }}
    >
      <Header title={title} showBack={showBack} rightElement={rightElement} />
      {/* pb accounts for fixed nav (4rem) + iPhone home-indicator safe area */}
      <main
        className="flex-1"
        style={showBottomNav ? { paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" } : undefined}
      >
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}
