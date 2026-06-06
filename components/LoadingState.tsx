interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-gray-800 border-t-orange-500 rounded-full animate-spin" />
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  )
}
