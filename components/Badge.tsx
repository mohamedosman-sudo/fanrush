interface BadgeProps {
  name: string
  earned: boolean
}

export default function Badge({ name, earned }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
        earned
          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
          : "bg-gray-800 text-gray-500 border border-white/5"
      }`}
    >
      {earned && <span className="mr-1">✦</span>}
      {name}
    </span>
  )
}
