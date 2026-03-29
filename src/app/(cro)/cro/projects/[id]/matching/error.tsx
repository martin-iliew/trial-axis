"use client"

import { Button } from "@/components/ui/button"
import { BodySmall, Heading7 } from "@/components/ui/typography"

export default function MatchingError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-primary bg-subtle p-8 text-center">
        <Heading7>Unable to start the ranking run</Heading7>
        <BodySmall className="mt-2 text-secondary">
          TrialAxis could not initialize the matching workflow for this study.
        </BodySmall>
        <Button className="mt-4" variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}
