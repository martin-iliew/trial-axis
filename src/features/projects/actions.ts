"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Enums } from "@/types"

export async function createTrialProject(data: {
  title: string
  description?: string
  therapeutic_area_id?: string
  phase?: Enums<"trial_phase">
  required_patient_count?: number
  start_date?: string
  end_date?: string
  geographic_preference?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: project, error } = await supabase
    .from("trial_projects")
    .insert({ ...data, sponsor_user_id: user.id, status: "draft" as const })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/sponsor/projects")
  return { data: project }
}

export async function addRequirement(data: {
  trial_project_id: string
  requirement_type: Enums<"requirement_type">
  value: string
  priority: "required" | "preferred" | "nice_to_have"
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", data.trial_project_id)
    .eq("sponsor_user_id", user.id)
    .single()

  if (!project) return { error: "Project not found or not authorized" }

  const { data: requirement, error } = await supabase
    .from("trial_requirements")
    .insert({ ...data, description: data.value })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${data.trial_project_id}`)
  return { data: requirement }
}

export async function deleteRequirement(id: string, trialProjectId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: requirement } = await supabase
    .from("trial_requirements")
    .select("id, trial_project_id")
    .eq("id", id)
    .single()

  if (!requirement) return { error: "Requirement not found" }

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", requirement.trial_project_id)
    .eq("sponsor_user_id", user.id)
    .single()

  if (!project) return { error: "Not authorized" }

  const { error } = await supabase
    .from("trial_requirements")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${trialProjectId}`)
  return { error: null }
}
