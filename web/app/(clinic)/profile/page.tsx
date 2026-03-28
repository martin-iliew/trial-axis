import type { Tables } from "@/types/supabase"
import ClinicProfileTabs from "@/features/clinic-profile/ClinicProfileTabs"

export default async function ClinicProfilePage() {
  // Typed stubs — Logic Dev replaces with real Supabase queries at end of Wave 2
  // Replace with: const supabase = await createServerClient()
  //               const { data: { user } } = await supabase.auth.getUser()
  //               const { data: clinic } = await supabase.from("clinics").select("*").eq("owner_id", user!.id).single()
  //               etc.
  const clinic: Tables<"clinics"> | null = null
  const equipment: Tables<"equipment">[] = []
  const certifications: Tables<"certifications">[] = []
  const availability: Tables<"clinic_availability"> | null = null

  return (
    <ClinicProfileTabs
      clinic={clinic}
      equipment={equipment}
      certifications={certifications}
      availability={availability}
    />
  )
}
