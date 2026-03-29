import { BodySmall, Heading7 } from "@/components/ui/typography"

export default function MatchingLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-primary bg-subtle p-8 text-center">
        <Heading7>Preparing AI ranking run</Heading7>
        <BodySmall className="mt-2 text-secondary">
          Loading study data and clinic network context.
        </BodySmall>
      </div>
    </div>
  )
}
