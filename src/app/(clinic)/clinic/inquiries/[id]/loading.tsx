export default function Loading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-surface-level-2" />
      <div className="mb-2 h-8 w-64 animate-pulse rounded-lg bg-surface-level-2" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-5 w-full animate-pulse rounded bg-surface-level-2" />
        ))}
      </div>
    </div>
  )
}
