"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-white font-black text-2xl mb-2">Access Restricted</h1>
        <p className="text-gray-400 text-sm mb-6">
          You don&apos;t have permission to view this page.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="border border-white/10 rounded-xl px-5 py-2.5 text-white text-sm font-bold hover:bg-white/5 transition-all active:scale-95"
          >
            ← Go Back
          </button>
          <Link
            href="/home"
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-all active:scale-95"
          >
            Go to Home
          </Link>
        </div>

        <p className="text-gray-600 text-xs mt-6">
          If you think this is a mistake, contact support.
        </p>
      </div>
    </div>
  )
}
