export default function ClinicsLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-7 w-48 animate-pulse rounded-lg bg-surface-level-2" />
        <div className="h-5 w-72 animate-pulse rounded-lg bg-surface-level-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-primary bg-surface-level-1"
          />
        ))}
      </div>
    </div>
  )
}
