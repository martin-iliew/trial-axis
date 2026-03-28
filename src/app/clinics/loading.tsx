import { Skeleton } from "@/components/ui/skeleton";

export default function ClinicsLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <Skeleton className="mb-2 h-7 w-48 rounded-lg" />
          <Skeleton className="h-5 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
