import { SponsorSlot } from "@/lib/types"

interface SponsorBannerProps {
  slot?: SponsorSlot
}

export default function SponsorBanner({ slot }: SponsorBannerProps) {
  if (!slot || !slot.active) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-dashed border-white/10 rounded-2xl p-4 text-center">
        <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-1">Sponsored</p>
        <p className="text-gray-500 text-sm mb-2">Advertising space available</p>
        <a
          href="mailto:ads@fanrush.com"
          className="text-orange-400 text-xs hover:text-orange-300 hover:underline transition-colors"
        >
          Advertise here →
        </a>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">
          📣
        </div>
        <div>
          <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Sponsored</p>
          <p className="text-white font-semibold text-sm">{slot.name}</p>
        </div>
      </div>
      <button className="px-3 py-1.5 rounded-xl bg-orange-500/15 text-orange-400 text-xs font-semibold hover:bg-orange-500/25 transition-colors">
        Learn More
      </button>
    </div>
  )
}
