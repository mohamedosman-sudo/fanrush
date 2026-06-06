"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

type ToastType = "info" | "success" | "error"

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const typeStyles: Record<ToastType, string> = {
    info: "bg-gray-800 border-white/20 text-white",
    success: "bg-emerald-900/80 border-emerald-500/30 text-emerald-300",
    error: "bg-red-900/80 border-red-500/30 text-red-300",
  }

  const typeIcon: Record<ToastType, string> = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl ${typeStyles[toast.type]} transition-all duration-300`}
          >
            <span>{typeIcon[toast.type]}</span>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
