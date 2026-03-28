"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const upsertClinicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  contact_email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().optional(),
})

const addEquipmentSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  data: z.object({
    equipment_type: z.string().min(1, "Equipment type is required"),
    name: z.string().min(1, "Name is required"),
    quantity: z.number().positive("Quantity must be positive"),
    is_available: z.boolean(),
  }),
})

const addCertificationSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  data: z.object({
    certification_name: z.string().min(1, "Certification name is required"),
    issued_by: z.string().optional(),
    valid_until: z.string().optional(),
  }),
})

const upsertAvailabilitySchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  data: z.object({
    available_from: z.string().min(1, "Available from is required"),
    available_to: z.string().min(1, "Available to is required"),
    max_concurrent_trials: z.number().positive("Max concurrent trials must be positive"),
  }),
})

const deleteIdSchema = z.string().min(1, "ID is required")

export async function upsertClinic(data: {
  name: string
  city: string
  address: string
  description?: string
  contact_email: string
  phone?: string
  website?: string
}) {
  const result = upsertClinicSchema.safeParse(data)
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { phone, ...rest } = result.data
  const { error } = await supabase
    .from("clinics")
    .upsert({ ...rest, contact_phone: phone, user_id: user.id }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function upsertSpecializations(clinicId: string, areaIds: string[]) {
  const supabase = await createServerClient()

  await supabase.from("clinic_specializations").delete().eq("clinic_id", clinicId)

  if (areaIds.length > 0) {
    const { error } = await supabase
      .from("clinic_specializations")
      .insert(areaIds.map((id) => ({ clinic_id: clinicId, therapeutic_area_id: id })))
    if (error) throw new Error(error.message)
  }

  revalidatePath("/clinic/profile")
}

export async function addEquipment(clinicId: string, data: {
  equipment_type: string
  name: string
  quantity: number
  is_available: boolean
}) {
  const result = addEquipmentSchema.safeParse({ clinicId, data })
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase
    .from("equipment")
    .insert({ ...result.data.data, clinic_id: result.data.clinicId })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function deleteEquipment(id: string) {
  const parsed = deleteIdSchema.safeParse(id)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase.from("equipment").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function addCertification(clinicId: string, data: {
  certification_name: string
  issued_by?: string
  valid_until?: string
}) {
  const result = addCertificationSchema.safeParse({ clinicId, data })
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase
    .from("certifications")
    .insert({ ...result.data.data, clinic_id: result.data.clinicId })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function deleteCertification(id: string) {
  const parsed = deleteIdSchema.safeParse(id)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase.from("certifications").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function upsertAvailability(clinicId: string, data: {
  available_from: string
  available_to: string
  max_concurrent_trials: number
}) {
  const result = upsertAvailabilitySchema.safeParse({ clinicId, data })
  if (!result.success) throw new Error(result.error.issues[0].message)

  const supabase = await createServerClient()
  const { error } = await supabase
    .from("clinic_availability")
    .upsert({ ...result.data.data, clinic_id: result.data.clinicId }, { onConflict: "clinic_id" })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}
