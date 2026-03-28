import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-primary p-4">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
