"use client"

import { Badge } from "@/components/ui/badge"
import { BodySmall, Caption, Heading9 } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

export default function MatchingStageCard({
  label,
  detail,
  active,
  complete,
}: {
  label: string
  detail: string
  active: boolean
  complete: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-300",
        active
          ? "border-primary bg-surface-level-2 shadow-lg"
          : "border-primary bg-surface-level-0",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <Heading9>{label}</Heading9>
        <Badge className={cn(complete ? "bg-surface-status-success text-icon-status-success" : "bg-surface-level-2 text-secondary")}>
          {complete ? "Complete" : active ? "Running" : "Queued"}
        </Badge>
      </div>
      <BodySmall className="text-secondary">{detail}</BodySmall>
      {active && (
        <Caption className="mt-3 text-brand">AI is evaluating live site-fit signals.</Caption>
      )}
    </div>
  )
}
