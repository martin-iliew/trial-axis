"use client";

import { Button } from "@/components/ui/button";
import { Heading8 } from "@/components/ui/typography";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4">
      <Heading8 className="text-secondary">
        Failed to load clinic profile.
      </Heading8>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
