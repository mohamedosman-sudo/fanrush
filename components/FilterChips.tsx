"use client"

interface FilterOption {
  label: string
  value: string
}

interface FilterChipsProps {
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
}

export default function FilterChips({
  options,
  selected,
  onToggle,
}: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-white/5"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
