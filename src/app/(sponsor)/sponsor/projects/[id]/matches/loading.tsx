export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-surface-level-2" />
      <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-surface-level-2" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-primary bg-surface-level-1" />
        ))}
      </div>
    </div>
  )
}
