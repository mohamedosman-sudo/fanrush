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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Header title={title} showBack={showBack} rightElement={rightElement} />
      <main className={`flex-1 ${showBottomNav ? "pb-24" : ""}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}
