"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- Clinic ---

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

  const { error } = await supabase
    .from("clinics")
    .upsert({ ...data, owner_id: user.id }, { onConflict: "owner_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}

// --- Specializations ---

export async function upsertSpecializations(clinicId: string, areaIds: string[]) {
  const supabase = await createServerClient()

  await supabase
    .from("clinic_specializations")
    .delete()
    .eq("clinic_id", clinicId)

  if (areaIds.length > 0) {
    const { error } = await supabase
      .from("clinic_specializations")
      .insert(areaIds.map((id) => ({ clinic_id: clinicId, therapeutic_area_id: id })))
    if (error) throw new Error(error.message)
  }

  revalidatePath("/clinic/profile")
}

// --- Equipment ---

export async function addEquipment(clinicId: string, data: {
  type: string
  name: string
  quantity: number
  available: boolean
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

// --- Certifications ---

export async function addCertification(clinicId: string, data: {
  name: string
  issued_by?: string
  expires_at?: string
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

// --- Availability ---

export async function upsertAvailability(clinicId: string, data: {
  start_date: string
  end_date: string
  capacity: number
}) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("clinic_availability")
    .upsert({ ...data, clinic_id: clinicId }, { onConflict: "clinic_id" })
  if (error) throw new Error(error.message)
  revalidatePath("/clinic/profile")
}
