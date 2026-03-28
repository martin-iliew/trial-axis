"use client"

import { Body, BodySmall } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"

export default function ClinicsError({ reset }: { reset: () => void }) {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center">
      <Body className="text-secondary">Something went wrong loading clinics.</Body>
      <BodySmall className="text-tertiary">Please try again.</BodySmall>
      <Button variant="outline" onClick={reset}>
        Retry
      </Button>
    </div>
  )
}
