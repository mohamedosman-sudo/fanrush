import Link from "next/link"
import { ReactNode } from "react"

interface CTAButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
}

const variantClasses = {
  primary: "bg-orange-500 hover:bg-orange-400 text-white font-bold active:scale-95",
  secondary: "bg-white/10 hover:bg-white/15 text-white font-semibold",
  outline: "border border-white/20 hover:border-orange-500 hover:text-orange-400 text-white font-semibold",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
}

export default function CTAButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth,
}: CTAButtonProps) {
  const className = [
    "inline-flex items-center justify-center transition-all",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ")

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}
