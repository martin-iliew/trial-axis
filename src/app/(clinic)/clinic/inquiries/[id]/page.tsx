import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getClinicForUser, getInquiryDetail } from "@/features/inquiries/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Heading5, Heading9, BodySmall, Caption } from "@/components/ui/typography"
import InquiryResponseForm from "./components/InquiryResponseForm"

const statusColors: Record<string, string> = {
  open: "bg-surface-status-warning text-icon-status-warning",
  in_progress: "bg-surface-status-info text-icon-status-info",
  closed: "bg-surface-status-success text-icon-status-success",
  withdrawn: "bg-surface-status-danger text-icon-status-danger",
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: clinic } = await getClinicForUser(user.id)
  if (!clinic) redirect("/clinic/profile")

  const { data: inquiry } = await getInquiryDetail(id, clinic.id)
  if (!inquiry) notFound()

  const trial = (inquiry.match_result as Record<string, unknown>)?.trial_projects as {
    title: string
    description: string | null
    phase: string | null
    target_enrollment: number | null
    start_date: string | null
    end_date: string | null
    geographic_preference: string | null
    therapeutic_areas: { name: string } | null
  } | null

  const croContact = inquiry.cro as { first_name: string; last_name: string } | null
  const matchScore = (inquiry.match_result as Record<string, unknown>)?.overall_score as number | undefined
  const primaryMessage = inquiry.messages.find((message) => message.type === "text")?.content
  const latestStatusUpdate = [...inquiry.messages]
    .reverse()
    .find((message) => message.type === "status_update")?.content
  const geographicPreference =
    trial && "geographic_preference" in trial && typeof trial.geographic_preference === "string"
      ? trial.geographic_preference
      : null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/clinic/inquiries" className="body-small text-secondary hover:underline">← Back to inquiries</Link>
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Heading5>{trial?.title ?? "Trial Inquiry"}</Heading5>
          <div className="mt-1 flex items-center gap-2">
            {croContact && <BodySmall className="text-secondary">From {croContact.first_name} {croContact.last_name}</BodySmall>}
            <Caption className="text-tertiary">{new Date(inquiry.created_at).toLocaleDateString()}</Caption>
          </div>
        </div>
        <Badge className={statusColors[inquiry.status] ?? ""}>{inquiry.status}</Badge>
      </div>

      {trial && (
        <div className="mb-6 rounded-2xl border border-primary p-4">
          <Heading9 className="mb-3 uppercase text-secondary">Trial Details</Heading9>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trial.therapeutic_areas && (
              <div>
                <Caption className="text-secondary">Therapeutic Area</Caption>
                <BodySmall>{trial.therapeutic_areas.name}</BodySmall>
              </div>
            )}
            {trial.phase && (
              <div>
                <Caption className="text-secondary">Phase</Caption>
                <BodySmall>Phase {trial.phase}</BodySmall>
              </div>
            )}
            {trial.target_enrollment && (
              <div>
                <Caption className="text-secondary">Patient Count</Caption>
                <BodySmall>{trial.target_enrollment}</BodySmall>
              </div>
            )}
            {geographicPreference && (
              <div>
                <Caption className="text-secondary">Geographic Preference</Caption>
                <BodySmall>{geographicPreference}</BodySmall>
              </div>
            )}
            {trial.start_date && (
              <div>
                <Caption className="text-secondary">Timeline</Caption>
                <BodySmall>{trial.start_date} — {trial.end_date ?? "TBD"}</BodySmall>
              </div>
            )}
            {matchScore !== undefined && (
              <div>
                <Caption className="text-secondary">Match Score</Caption>
                <BodySmall>{matchScore}/100</BodySmall>
              </div>
            )}
          </div>
          {trial.description && <BodySmall className="mt-3 text-secondary">{trial.description}</BodySmall>}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-primary p-4">
        <Heading9 className="mb-2 uppercase text-secondary">Message from CRO</Heading9>
        <BodySmall>{primaryMessage ?? inquiry.subject}</BodySmall>
      </div>

      {inquiry.status === "open" ? (
        <InquiryResponseForm inquiryId={inquiry.id} />
      ) : (
        <div className="rounded-2xl border border-primary p-4">
          <Heading9 className="mb-2 uppercase text-secondary">Your Response</Heading9>
          <Badge className={statusColors[inquiry.status] ?? ""}>{inquiry.status}</Badge>
          {latestStatusUpdate && <BodySmall className="mt-2">{latestStatusUpdate}</BodySmall>}
        </div>
      )}
    </div>
  )
}
