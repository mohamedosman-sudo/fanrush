import Link from "next/link"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
      <p className="text-gray-400 text-sm text-center max-w-xs mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all active:scale-95"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
