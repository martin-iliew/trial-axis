"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function upsertClinic(data: {
  name: string
  city: string
  address: string
  description?: string
  contact_email: string
  phone?: string
  website?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { phone, ...rest } = data
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
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("equipment")
    .insert({ ...data, clinic_id: clinicId })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function deleteEquipment(id: string) {
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
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("certifications")
    .insert({ ...data, clinic_id: clinicId })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

export async function deleteCertification(id: string) {
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
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("clinic_availability")
    .upsert({ ...data, clinic_id: clinicId }, { onConflict: "clinic_id" })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}
