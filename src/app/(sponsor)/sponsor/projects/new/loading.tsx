export default function Loading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-surface-level-2" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-level-2" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-level-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
