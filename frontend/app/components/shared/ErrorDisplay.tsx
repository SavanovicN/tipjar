interface ErrorDisplayProps {
  message: string
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div
        role="alert"
        aria-live="polite"
        className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center"
      >
        <p className="text-destructive">{message}</p>
      </div>
    </div>
  )
}
