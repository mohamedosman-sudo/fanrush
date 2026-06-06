"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

type Role = "fan" | "business"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("fan")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [demoMode, setDemoMode] = useState(false)
  const [success, setSuccess] = useState(false)

  const configured = isSupabaseConfigured()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!configured) {
      setLoading(false)
      setDemoMode(true)
      return
    }

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name, role },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-white font-black text-xl mb-2">Check your email</h2>
          <p className="text-gray-400 text-sm mb-6">
            Check your email to confirm your account. Then sign in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all active:scale-95"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-xl font-black">
            <span className="text-orange-500">⚡</span>
            <span className="text-orange-500">Fan</span>
            <span className="text-white">Rush</span>
          </Link>
        </div>

        <h1 className="text-white font-black text-2xl mb-1">Create your account</h1>
        <p className="text-gray-400 text-sm mb-6">Join thousands of fans for World Cup 2026</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
          />
          <div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
            />
            <p className="text-gray-600 text-xs mt-1 pl-1">Minimum 8 characters</p>
          </div>

          {/* Role selector */}
          <div>
            <p className="text-gray-400 text-sm mb-2">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("fan")}
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-sm font-medium flex flex-col items-center gap-1 ${
                  role === "fan"
                    ? "border-orange-500 bg-orange-500/10 text-white"
                    : "border-white/10 text-gray-400 hover:border-orange-500/30"
                }`}
              >
                <span className="text-xl">🙋</span>
                Fan
              </button>
              <button
                type="button"
                onClick={() => setRole("business")}
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-sm font-medium flex flex-col items-center gap-1 ${
                  role === "business"
                    ? "border-orange-500 bg-orange-500/10 text-white"
                    : "border-white/10 text-gray-400 hover:border-orange-500/30"
                }`}
              >
                <span className="text-xl">🏪</span>
                Business
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {demoMode && (
            <div className="text-sm text-gray-400 bg-gray-800 border border-white/10 rounded-xl px-4 py-3">
              Demo mode — Supabase not configured. Click &lsquo;Continue as Demo User&rsquo; to proceed.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl px-5 py-2.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {demoMode && (
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="w-full text-orange-400 text-sm font-medium py-2 hover:text-orange-300 transition-colors"
            >
              Continue as Demo User →
            </button>
          )}
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
