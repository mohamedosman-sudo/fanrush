"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Leaderboard from "@/components/Leaderboard"
import { useToast } from "@/components/Toast"

const configured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

type UserLeague = {
  id: string
  name: string
  code: string
  memberCount: number
}

type LeagueMember = {
  name: string
  points: number
  rank: number
}

interface MiniLeaguesProps {
  userId: string | null
  /** Invite code pre-populated from the ?join= URL param. */
  initialJoinCode?: string
}

export default function MiniLeagues({ userId, initialJoinCode = "" }: MiniLeaguesProps) {
  const { showToast } = useToast()

  // null = not yet loaded; [] = loaded + empty
  const [leagues, setLeagues] = useState<UserLeague[] | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [membersMap, setMembersMap] = useState<Record<string, LeagueMember[]>>({})

  // Create league
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createdCode, setCreatedCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Join league
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState("")
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [joinedName, setJoinedName] = useState("")

  // Track whether we've auto-opened the join modal from the invite URL
  const autoOpenedRef = useRef(false)

  // Load user's leagues on mount (once userId is known)
  useEffect(() => {
    if (!configured || !userId) return
    async function load() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data: memberships } = await supabase
        .from("mini_league_members")
        .select("league_id")
        .eq("user_id", userId)

      if (!memberships?.length) { setLeagues([]); return }

      const leagueIds = memberships.map((m) => m.league_id as string)

      const { data: leagueRows } = await supabase
        .from("mini_leagues")
        .select("id, name, invite_code")
        .in("id", leagueIds)

      if (!leagueRows) { setLeagues([]); return }

      const withCounts = await Promise.all(
        leagueRows.map(async (l) => {
          const { count } = await supabase
            .from("mini_league_members")
            .select("*", { count: "exact", head: true })
            .eq("league_id", l.id)
          return {
            id: l.id as string,
            name: l.name as string,
            code: l.invite_code as string,
            memberCount: count ?? 0,
          }
        })
      )
      setLeagues(withCounts)
    }
    load()
  }, [userId])

  // Auto-open the join modal when arriving via an invite link
  useEffect(() => {
    if (!initialJoinCode || autoOpenedRef.current) return
    async function autoOpen() {
      setJoinCode(initialJoinCode)
      if (userId !== null) {
        setShowJoin(true)
        autoOpenedRef.current = true
      }
    }
    autoOpen()
  }, [initialJoinCode, userId])

  async function loadMembers(leagueId: string) {
    if (membersMap[leagueId] !== undefined) return
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: rows } = await supabase
      .from("mini_league_members")
      .select("user_id")
      .eq("league_id", leagueId)

    if (!rows?.length) { setMembersMap((p) => ({ ...p, [leagueId]: [] })); return }

    const userIds = rows.map((r) => r.user_id as string)

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, points")
      .in("id", userIds)

    const members: LeagueMember[] = (profiles ?? [])
      .map((p) => ({
        name: (p.display_name as string | null) ?? "Fan",
        points: (p.points as number | null) ?? 0,
        rank: 0,
      }))
      .sort((a, b) => b.points - a.points)
      .map((m, i) => ({ ...m, rank: i + 1 }))

    setMembersMap((p) => ({ ...p, [leagueId]: members }))
  }

  function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      loadMembers(id)
    }
  }

  async function handleCreate() {
    if (!userId || !createName.trim() || creating) return
    setCreating(true)
    const code = generateCode()

    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: league, error } = await supabase
      .from("mini_leagues")
      .insert({ name: createName.trim(), invite_code: code, owner_id: userId })
      .select("id, name, invite_code")
      .single()

    if (error || !league) {
      showToast("Failed to create league — please try again.", "error")
      setCreating(false)
      return
    }

    await supabase
      .from("mini_league_members")
      .insert({ league_id: league.id, user_id: userId })

    setLeagues((prev) => [
      ...(prev ?? []),
      { id: league.id as string, name: league.name as string, code: league.invite_code as string, memberCount: 1 },
    ])
    setCreatedCode(code)
    setCreateSuccess(true)
    setCreating(false)
  }

  async function handleJoin() {
    if (!userId || !joinCode.trim() || joining) return
    setJoining(true)
    setJoinError("")

    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()

    const { data: league } = await supabase
      .from("mini_leagues")
      .select("id, name, invite_code")
      .eq("invite_code", joinCode.trim().toUpperCase())
      .single()

    if (!league) {
      setJoinError("League not found. Double-check the code and try again.")
      setJoining(false)
      return
    }

    if (leagues?.some((l) => l.id === league.id)) {
      setJoinError("You are already in this league.")
      setJoining(false)
      return
    }

    const { error } = await supabase
      .from("mini_league_members")
      .insert({ league_id: league.id, user_id: userId })

    if (error) {
      setJoinError(
        error.code === "23505"
          ? "You are already in this league."
          : "Failed to join — please try again."
      )
      setJoining(false)
      return
    }

    setLeagues((prev) => [
      ...(prev ?? []),
      { id: league.id as string, name: league.name as string, code: league.invite_code as string, memberCount: 1 },
    ])
    setJoinedName(league.name as string)
    setJoinSuccess(true)
    setJoining(false)
  }

  function closeCreate() {
    setShowCreate(false)
    setCreateName("")
    setCreateSuccess(false)
    setCreatedCode("")
    setCodeCopied(false)
    setLinkCopied(false)
  }

  function closeJoin() {
    setShowJoin(false)
    setJoinCode("")
    setJoinError("")
    setJoinSuccess(false)
    setJoinedName("")
  }

  async function copyText(text: string, onCopied: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text)
      onCopied(true)
      setTimeout(() => onCopied(false), 2000)
    } catch {
      showToast("Couldn't copy — please copy manually.", "error")
    }
  }

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/predictions?join=${createdCode}`
      : `/predictions?join=${createdCode}`

  // Login link that returns the user to the invite URL after authentication
  const loginWithReturn = (code: string) =>
    `/login?next=${encodeURIComponent(`/predictions?join=${code}`)}`

  return (
    <div className="space-y-4">
      <p className="text-xs font-black uppercase tracking-widest text-gray-500">
        Your Leagues
      </p>

      {/* Invite CTA for unauthenticated users arriving via invite link */}
      {!userId && initialJoinCode && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center space-y-3">
          <p className="text-orange-400 font-semibold text-sm">
            You&apos;ve been invited to join a league!
          </p>
          <p className="text-gray-400 text-xs">
            Log in to accept the invite and see the league leaderboard.
          </p>
          <Link
            href={loginWithReturn(initialJoinCode)}
            className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors min-h-[44px] leading-[44px] py-0"
          >
            Log In to Join
          </Link>
        </div>
      )}

      {/* League list */}
      {!userId && !initialJoinCode ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Log in to create or join a league.
        </p>
      ) : userId && leagues === null ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : userId && leagues !== null && leagues.length === 0 ? (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-white font-semibold text-sm mb-1">No leagues yet</p>
          <p className="text-gray-500 text-xs">Create a league or join one with a code.</p>
        </div>
      ) : userId && leagues !== null ? (
        <div className="space-y-3">
          {leagues.map((league) => (
            <div
              key={league.id}
              className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(league.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left min-h-[56px]"
              >
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm">{league.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Code:{" "}
                    <span className="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-orange-400">
                      {league.code}
                    </span>
                    <span className="ml-2 text-gray-600">
                      · {league.memberCount} member{league.memberCount !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
                <span className="text-gray-600 text-xs ml-3 flex-shrink-0">
                  {expandedId === league.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === league.id && (
                <div className="border-t border-white/5 px-4 pb-4 pt-3">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3">
                    Leaderboard
                  </p>
                  {membersMap[league.id] === undefined ? (
                    <div className="flex justify-center py-4">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : membersMap[league.id].length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-2">No members found.</p>
                  ) : (
                    <Leaderboard users={membersMap[league.id]} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Action buttons */}
      {userId && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex-1 min-h-[44px] rounded-xl border border-orange-500/50 text-orange-400 hover:border-orange-500 font-bold text-sm transition-all active:scale-95"
          >
            + Create League
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="flex-1 min-h-[44px] bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-all active:scale-95"
          >
            Join League
          </button>
        </div>
      )}

      {/* ── Create League Modal ─────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-[calc(100vw-2rem)] sm:max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg mb-4">Create a League</h2>

            {createSuccess ? (
              <div className="space-y-4">
                <p className="text-emerald-400 font-bold text-lg text-center">League Created! 🎉</p>

                {/* Code display */}
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-xs mb-1">Invite Code</p>
                  <p className="text-white font-mono font-black text-3xl tracking-widest">
                    {createdCode}
                  </p>
                </div>

                {/* Invite link */}
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">Invite Link</p>
                  <p className="text-gray-300 text-xs font-mono break-all leading-relaxed">
                    {inviteLink}
                  </p>
                </div>

                {/* Copy buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyText(createdCode, setCodeCopied)}
                    className="flex-1 min-h-[44px] rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:border-white/20 transition-all"
                  >
                    {codeCopied ? "✅ Code Copied" : "📋 Copy Code"}
                  </button>
                  <button
                    onClick={() => copyText(inviteLink, setLinkCopied)}
                    className="flex-1 min-h-[44px] rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-all"
                  >
                    {linkCopied ? "✅ Link Copied" : "🔗 Copy Link"}
                  </button>
                </div>

                <button
                  onClick={closeCreate}
                  className="w-full min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <label className="block text-gray-400 text-xs mb-1.5">League Name</label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Office World Cup"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500/50 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={closeCreate}
                    className="flex-1 min-h-[44px] rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!createName.trim() || creating}
                    className="flex-1 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95"
                  >
                    {creating ? "Creating…" : "Create"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Join League Modal ───────────────────────────────── */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-[calc(100vw-2rem)] sm:max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg mb-4">Join a League</h2>

            {joinSuccess ? (
              <div className="text-center py-2 space-y-4">
                <p className="text-emerald-400 font-bold text-lg">Joined! 🎉</p>
                <p className="text-gray-400 text-sm">
                  You are now in{" "}
                  <span className="text-white font-semibold">{joinedName}</span>.
                </p>
                <button
                  onClick={closeJoin}
                  className="w-full min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : !userId ? (
              /* Unauthenticated user opened modal via invite link */
              <div className="text-center space-y-4 py-2">
                <p className="text-white font-semibold text-sm">
                  Log in to join this league
                </p>
                <p className="text-gray-400 text-xs">
                  You need an account to join and compete on the leaderboard.
                </p>
                <Link
                  href={loginWithReturn(joinCode || initialJoinCode)}
                  className="block w-full min-h-[44px] leading-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm text-center transition-all"
                >
                  Log In to Join
                </Link>
                <button
                  onClick={closeJoin}
                  className="w-full min-h-[44px] rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <label className="block text-gray-400 text-xs mb-1.5">Invite Code</label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={8}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-orange-500/50 mb-1"
                />
                {joinError && (
                  <p className="text-red-400 text-xs mb-2">{joinError}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={closeJoin}
                    className="flex-1 min-h-[44px] rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoin}
                    disabled={!joinCode.trim() || joining}
                    className="flex-1 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95"
                  >
                    {joining ? "Joining…" : "Join"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
