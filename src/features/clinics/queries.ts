import { createServerClient } from "@/lib/supabase/server"

export async function getClinicForUser(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
