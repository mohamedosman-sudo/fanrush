import { User } from "@/lib/types"
import Badge from "./Badge"

interface FanPassportCardProps {
  user: User
}

export default function FanPassportCard({ user }: FanPassportCardProps) {
  return (
    <div className="bg-gradient-to-br from-orange-950/40 via-gray-900 to-gray-900 border border-orange-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-orange-400/30">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-white">{user.name[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-black text-xl tracking-tight">{user.name}</h2>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 font-bold px-3 py-1 rounded-full text-sm">
              ⭐ {user.points} pts
            </span>
          </div>
        </div>
      </div>

      {user.favouriteTeams.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Favourite Teams</p>
          <div className="flex flex-wrap gap-2">
            {user.favouriteTeams.map((teamId) => (
              <span key={teamId} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium uppercase">
                {teamId}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 rounded-xl p-3 text-center border border-white/5">
          <p className="text-white font-black text-lg">{user.predictions.length}</p>
          <p className="text-gray-400 text-xs mt-0.5">Predictions</p>
        </div>
        <div className="bg-black/20 rounded-xl p-3 text-center border border-white/5">
          <p className="text-white font-black text-lg">{user.savedVenues.length}</p>
          <p className="text-gray-400 text-xs mt-0.5">Saved Venues</p>
        </div>
        <div className="bg-black/20 rounded-xl p-3 text-center border border-white/5">
          <p className="text-white font-black text-lg">{user.savedMatches.length}</p>
          <p className="text-gray-400 text-xs mt-0.5">Saved Matches</p>
        </div>
      </div>

      {user.badges.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">
            Badges
            <span className="ml-2 bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold normal-case tracking-normal">
              {user.badges.length}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <Badge key={badge} name={badge} earned />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
