interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color?: "green" | "blue" | "yellow" | "red"
}

const iconBgMap = {
  green: "bg-emerald-500/10",
  blue: "bg-blue-500/10",
  yellow: "bg-yellow-500/10",
  red: "bg-orange-500/10",
}

export default function StatCard({ label, value, icon, color = "green" }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
      <div className="mb-3">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl ${iconBgMap[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-white font-black text-2xl">{value}</p>
      <p className="text-gray-400 text-xs font-medium mt-1">{label}</p>
    </div>
  )
}
