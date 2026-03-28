export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-surface-level-2" />
      <div className="flex gap-4 border-b border-primary pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-24 animate-pulse rounded bg-surface-level-2" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-surface-level-2" />
        ))}
      </div>
    </div>
  )
}
