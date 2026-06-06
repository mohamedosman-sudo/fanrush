interface LeaderboardUser {
  name: string
  points: number
  avatar?: string
  rank: number
}

interface LeaderboardProps {
  users: LeaderboardUser[]
}

const rankMedal = (rank: number) => {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return `#${rank}`
}

const rankTextStyle = (rank: number) => {
  if (rank === 1) return "text-yellow-400 font-black"
  if (rank === 2) return "text-gray-300 font-black"
  if (rank === 3) return "text-amber-500 font-black"
  return "text-gray-400 font-semibold"
}

export default function Leaderboard({ users }: LeaderboardProps) {
  return (
    <div className="space-y-1">
      {users.map((user) => (
        <div
          key={user.rank}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
        >
          <span className={`w-8 text-center text-sm ${rankTextStyle(user.rank)}`}>
            {rankMedal(user.rank)}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm overflow-hidden flex-shrink-0 border border-white/10">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-xs font-bold">{user.name[0]?.toUpperCase()}</span>
            )}
          </div>
          <span className="flex-1 text-white font-semibold text-sm">{user.name}</span>
          <span className="text-orange-400 font-bold text-sm">
            {user.points} <span className="text-gray-500 font-normal text-xs">pts</span>
          </span>
        </div>
      ))}
    </div>
  )
}
