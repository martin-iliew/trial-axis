export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-surface-level-2" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-primary p-4">
            <div className="h-5 w-64 animate-pulse rounded bg-surface-level-2" />
            <div className="mt-2 h-4 w-40 animate-pulse rounded bg-surface-level-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
