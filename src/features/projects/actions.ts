"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Enums } from "@/types"

const createTrialProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  therapeutic_area_id: z.string().uuid("Invalid therapeutic area ID").optional(),
  phase: z.enum(["I", "Ia", "Ib", "II", "IIa", "IIb", "III", "IV"]).optional(),
  required_patient_count: z.number().positive("Patient count must be positive").optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  geographic_preference: z.string().optional(),
})

const addRequirementSchema = z.object({
  trial_project_id: z.string().uuid("Invalid project ID"),
  requirement_type: z.enum([
    "equipment",
    "certification",
    "specialization",
    "capacity",
    "phase_experience",
    "molecule_experience",
  ]),
  value: z.string().min(1, "Value is required"),
  priority: z.enum(["required", "preferred", "nice_to_have"]),
})

const deleteRequirementSchema = z.object({
  id: z.string().min(1, "Requirement ID is required"),
  trialProjectId: z.string().min(1, "Project ID is required"),
})

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
  const result = createTrialProjectSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: project, error } = await supabase
    .from("trial_projects")
    .insert({ ...result.data, sponsor_user_id: user.id, status: "draft" as const })
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
  const result = addRequirementSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id")
    .eq("id", result.data.trial_project_id)
    .eq("sponsor_user_id", user.id)
    .single()

  if (!project) return { error: "Project not found or not authorized" }

  const { data: requirement, error } = await supabase
    .from("trial_requirements")
    .insert({ ...result.data, description: result.data.value })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/sponsor/projects/${result.data.trial_project_id}`)
  return { data: requirement }
}

export async function deleteRequirement(id: string, trialProjectId: string) {
  const result = deleteRequirementSchema.safeParse({ id, trialProjectId })
  if (!result.success) return { error: result.error.issues[0].message }

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
