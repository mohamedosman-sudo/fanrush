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
    /* Relative wrapper so the fade overlays are positioned against this element */
    <div className="relative">
      {/* Fade — right edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
        style={{ background: "linear-gradient(to right, transparent, #0a0a0f)" }}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 pr-6">
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
    </div>
  )
}
