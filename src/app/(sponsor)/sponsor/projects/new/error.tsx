"use client"

import { Button } from "@/components/ui/button"
import { Body } from "@/components/ui/typography"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
      <Body className="text-secondary">Failed to load form data.</Body>
      <Button variant="outline" onClick={reset} className="mt-4">Try again</Button>
    </div>
  )
}
