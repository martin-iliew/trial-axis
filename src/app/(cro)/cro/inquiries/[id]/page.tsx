import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getInquiryForSponsor } from "@/features/inquiries/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Heading5, BodySmall, Caption } from "@/components/ui/typography"
import CroInquiryThread from "./components/CroInquiryThread"

const statusColors: Record<string, string> = {
  open: "bg-surface-status-warning text-icon-status-warning",
  in_progress: "bg-surface-status-info text-icon-status-info",
  closed: "bg-surface-level-2 text-tertiary",
  withdrawn: "bg-surface-level-2 text-tertiary",
}

const statusLabels: Record<string, string> = {
  open: "Awaiting response",
  in_progress: "Active",
  closed: "Declined",
  withdrawn: "Withdrawn",
}

export default async function CroInquiryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: inquiry, error } = await getInquiryForSponsor(id, user.id)
  if (error || !inquiry) notFound()

  const projectId = inquiry.match_result?.project_id

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        {projectId ? (
          <Link
            href={`/cro/projects/${projectId}/matches`}
            className="text-body-small text-secondary hover:underline"
          >
            ← Back to matches
          </Link>
        ) : (
          <Link href="/cro/projects" className="text-body-small text-secondary hover:underline">
            ← Back to projects
          </Link>
        )}
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <Heading5>{inquiry.subject}</Heading5>
          {inquiry.clinic && (
            <BodySmall className="mt-1 text-secondary">
              {inquiry.clinic.name}
              {inquiry.clinic.city ? ` · ${inquiry.clinic.city}` : ""}
            </BodySmall>
          )}
        </div>
        <Badge className={statusColors[inquiry.status] ?? ""}>
          {statusLabels[inquiry.status] ?? inquiry.status}
        </Badge>
      </div>

      {inquiry.trial && (
        <div className="mb-6 rounded-2xl border border-primary p-4">
          <Caption className="mb-3 font-semibold uppercase text-secondary">Trial</Caption>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Caption className="text-secondary">Title</Caption>
              <BodySmall className="font-medium">{inquiry.trial.title}</BodySmall>
            </div>
            {inquiry.trial.phase && (
              <div>
                <Caption className="text-secondary">Phase</Caption>
                <BodySmall className="font-medium">Phase {inquiry.trial.phase}</BodySmall>
              </div>
            )}
            {inquiry.trial.therapeutic_areas && (
              <div>
                <Caption className="text-secondary">Therapeutic Area</Caption>
                <BodySmall className="font-medium">
                  {inquiry.trial.therapeutic_areas.name}
                </BodySmall>
              </div>
            )}
          </div>
        </div>
      )}

      <CroInquiryThread
        messages={inquiry.messages}
        currentUserId={user.id}
        senderNames={inquiry.senderNames}
        inquiryId={inquiry.id}
        inquiryStatus={inquiry.status}
      />
    </div>
  )
}
