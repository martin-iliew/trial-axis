"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendInquiry(data: {
  matchResultId: string
  message: string
  notes?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: matchResult } = await supabase
    .from("match_results")
    .select("*")
    .eq("id", data.matchResultId)
    .single()

  if (!matchResult) return { error: "Match result not found" }

  const { data: trialProject } = await supabase
    .from("trial_projects")
    .select("id, sponsor_user_id")
    .eq("id", matchResult.trial_project_id)
    .single()

  if (!trialProject || trialProject.sponsor_user_id !== user.id) {
    return { error: "Not authorized" }
  }

  if (matchResult.status !== "pending") {
    return { error: "Inquiry already sent for this match" }
  }

  const { error: insertError } = await supabase
    .from("partnership_inquiries")
    .insert({
      match_result_id: data.matchResultId,
      sender_user_id: user.id,
      message: data.message,
      notes: data.notes ?? null,
      status: "pending" as const,
    })

  if (insertError) return { error: insertError.message }

  const { error: updateError } = await supabase
    .from("match_results")
    .update({ status: "inquiry_sent" as const })
    .eq("id", data.matchResultId)

  if (updateError) return { error: updateError.message }

  revalidatePath(`/sponsor/projects/${trialProject.id}/matches`)
  return { error: null }
}

export async function respondToInquiry(
  inquiryId: string,
  action: "accepted" | "declined",
  data: {
    response_message?: string
    decline_reason?: string
  }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  if (action === "declined" && !data.decline_reason) {
    return { error: "Decline reason is required" }
  }

  const { data: inquiry } = await supabase
    .from("partnership_inquiries")
    .select("*")
    .eq("id", inquiryId)
    .single()

  if (!inquiry) return { error: "Inquiry not found" }

  const { data: matchResult } = await supabase
    .from("match_results")
    .select("clinic_id")
    .eq("id", inquiry.match_result_id)
    .single()

  if (!matchResult) return { error: "Match result not found" }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, user_id")
    .eq("id", matchResult.clinic_id)
    .single()

  if (!clinic || clinic.user_id !== user.id) {
    return { error: "Not authorized" }
  }

  if (inquiry.status !== "pending") {
    return { error: "Inquiry has already been responded to" }
  }

  const { error: inquiryError } = await supabase
    .from("partnership_inquiries")
    .update({
      status: action,
      response_message: data.response_message ?? null,
      decline_reason: data.decline_reason ?? null,
      responded_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)

  if (inquiryError) return { error: inquiryError.message }

  const { error: matchError } = await supabase
    .from("match_results")
    .update({ status: action })
    .eq("id", inquiry.match_result_id)

  if (matchError) return { error: matchError.message }

  revalidatePath("/clinic/inquiries")
  revalidatePath(`/clinic/inquiries/${inquiryId}`)
  return { error: null }
}
