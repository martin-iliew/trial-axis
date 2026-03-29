import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321"
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type UserRole = "cro" | "clinic_admin"
type OrganizationType = "cro" | "clinic"

async function createUser(
  email: string,
  password: string,
  role: UserRole,
  firstName: string,
  lastName: string,
) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role },
  })

  if (error || !data.user) {
    throw new Error(`Failed to create ${email}: ${error?.message ?? "Unknown error"}`)
  }

  console.log(`Created user: ${email} (${data.user.id})`)
  return data.user.id
}

async function createOrganization(
  name: string,
  type: OrganizationType,
  website?: string,
) {
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name,
      type,
      website: website ?? null,
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(
      `Failed to create organization ${name}: ${error?.message ?? "Unknown error"}`,
    )
  }

  return data.id
}

async function upsertProfile(
  userId: string,
  role: UserRole,
  firstName: string,
  lastName: string,
  organizationId: string,
) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    role,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    organization_id: organizationId,
  })

  if (error) {
    throw new Error(`Failed to upsert profile for ${userId}: ${error.message}`)
  }
}

async function insertSeedProjects(cro1OrgId: string) {
  const { error: projectError } = await supabase.from("trial_projects").insert([
    {
      id: "00000000-0000-0000-0000-000000000301",
      organization_id: cro1OrgId,
      title: "NSCLC Maintenance Therapy Phase III - Osimertinib Comparator",
      description:
        "A randomized Phase III study comparing osimertinib versus platinum-based chemotherapy as maintenance therapy in EGFR-mutated non-small cell lung cancer after first-line treatment.",
      therapeutic_area_id: "00000000-0000-0000-0000-000000000101",
      phase: "III",
      target_enrollment: 120,
      start_date: "2026-09-01",
      end_date: "2029-03-01",
      status: "draft",
    },
    {
      id: "00000000-0000-0000-0000-000000000302",
      organization_id: cro1OrgId,
      title: "Axicabtagene Phase I Dose Escalation - Relapsed/Refractory DLBCL",
      description:
        "First-in-human Phase I dose escalation study of a next-generation axicabtagene ciloleucel formulation in adult patients with relapsed or refractory diffuse large B-cell lymphoma after two or more prior lines of therapy.",
      therapeutic_area_id: "00000000-0000-0000-0000-000000000114",
      phase: "I",
      target_enrollment: 24,
      start_date: "2026-10-01",
      end_date: "2029-10-01",
      status: "draft",
    },
    {
      id: "00000000-0000-0000-0000-000000000303",
      organization_id: cro1OrgId,
      title: "Anti-IL-6 Biologic Phase II - Heart Failure with Preserved Ejection Fraction",
      description:
        "Phase II randomized controlled trial of a novel anti-IL-6 monoclonal antibody in patients with HFpEF and elevated CRP. Primary endpoint: change in 6-minute walk distance at 24 weeks.",
      therapeutic_area_id: "00000000-0000-0000-0000-000000000102",
      phase: "II",
      target_enrollment: 96,
      start_date: "2026-08-01",
      end_date: "2028-08-01",
      status: "draft",
    },
  ])

  if (projectError) {
    throw new Error(`Failed to insert trial projects: ${projectError.message}`)
  }

  const requirements = [
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "therapeutic_area" as const,
      label: "Oncology specialization required",
      value: { therapeuticArea: "Oncology" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "patient_volume" as const,
      label: "Minimum 100 EGFR+ NSCLC patients in database",
      value: { indication: "EGFR+ NSCLC", minimumPatients: 100 },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "equipment" as const,
      label: "CT imaging for RECIST 1.1 assessment",
      value: { equipment: "CT Scanner" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "certification" as const,
      label: "GCP certification required for investigational staff",
      value: { certification: "GCP ICH E6(R2)" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "other" as const,
      label: "Phase III trial experience required",
      value: { phaseExperience: "III" },
      is_hard_filter: true,
      weight: 0.9,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "other" as const,
      label: "Small molecule drug experience required",
      value: { moleculeExperience: "small_molecule" },
      is_hard_filter: true,
      weight: 0.85,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "other" as const,
      label: "Screen failure rate below 25% preferred",
      value: { screenFailureRateMax: 25 },
      is_hard_filter: false,
      weight: 0.55,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000301",
      type: "other" as const,
      label: "IRB approval within 21 days preferred",
      value: { irbApprovalDaysMax: 21 },
      is_hard_filter: false,
      weight: 0.45,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "therapeutic_area" as const,
      label: "Hematology specialization required",
      value: { therapeuticArea: "Hematology" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "equipment" as const,
      label: "Phase I clinical pharmacology unit required",
      value: { equipment: "Phase I Clinical Pharmacology Unit" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "equipment" as const,
      label: "Leukapheresis capability required",
      value: { equipment: "Leukapheresis Machine" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "equipment" as const,
      label: "Cryogenic storage for CAR-T product required",
      value: { equipment: "-80C Biospecimen Freezer" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "certification" as const,
      label: "GCP certification required",
      value: { certification: "GCP ICH E6(R2)" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "certification" as const,
      label: "FACT accreditation required for cell therapy program",
      value: { certification: "FACT Accreditation (Cell Therapy)" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "patient_volume" as const,
      label: "Minimum 20 relapsed/refractory DLBCL patients in database",
      value: { indication: "Relapsed/Refractory DLBCL", minimumPatients: 20 },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "other" as const,
      label: "Phase I trial experience required",
      value: { phaseExperience: "I" },
      is_hard_filter: true,
      weight: 0.9,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000302",
      type: "other" as const,
      label: "Cell therapy trial experience required",
      value: { moleculeExperience: "cell_therapy" },
      is_hard_filter: true,
      weight: 0.9,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "therapeutic_area" as const,
      label: "Cardiology specialization required",
      value: { therapeuticArea: "Cardiology" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "equipment" as const,
      label: "Echocardiography required for LVEF assessment",
      value: { equipment: "Echocardiography" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "patient_volume" as const,
      label: "Minimum 80 HFpEF patients in database",
      value: { indication: "HFpEF", minimumPatients: 80 },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "certification" as const,
      label: "GCP certification required",
      value: { certification: "GCP ICH E6(R2)" },
      is_hard_filter: true,
      weight: 1,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "other" as const,
      label: "Phase II trial experience required",
      value: { phaseExperience: "II" },
      is_hard_filter: true,
      weight: 0.9,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "other" as const,
      label: "Biologic trial experience required",
      value: { moleculeExperience: "biologic" },
      is_hard_filter: true,
      weight: 0.85,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "geography" as const,
      label: "Site located in Varna or Burgas preferred",
      value: { preferredCities: ["Varna", "Burgas"] },
      is_hard_filter: false,
      weight: 0.4,
    },
    {
      project_id: "00000000-0000-0000-0000-000000000303",
      type: "other" as const,
      label: "Contract execution within 25 days preferred",
      value: { contractExecutionDaysMax: 25 },
      is_hard_filter: false,
      weight: 0.45,
    },
  ]

  const { error: requirementError } = await supabase
    .from("project_requirements")
    .insert(requirements)

  if (requirementError) {
    throw new Error(`Failed to insert project requirements: ${requirementError.message}`)
  }
}

async function main() {
  console.log("Seeding demo auth users...")

  const cro1Id = await createUser(
    "cro@demo.com",
    "Demo1234!",
    "cro",
    "Alex",
    "Morgan",
  )
  const cro2Id = await createUser(
    "cro2@demo.com",
    "Demo1234!",
    "cro",
    "Jordan",
    "Taylor",
  )

  const clinic1AdminId = await createUser(
    "clinic1@demo.com",
    "Demo1234!",
    "clinic_admin",
    "Elena",
    "Petrova",
  )
  const clinic2AdminId = await createUser(
    "clinic2@demo.com",
    "Demo1234!",
    "clinic_admin",
    "Ivan",
    "Dimitrov",
  )
  const clinic3AdminId = await createUser(
    "clinic3@demo.com",
    "Demo1234!",
    "clinic_admin",
    "Maria",
    "Ivanova",
  )

  const cro1OrgId = await createOrganization(
    "TrialAxis CRO Demo",
    "cro",
    "https://trialaxis.app",
  )
  const cro2OrgId = await createOrganization(
    "TrialAxis CRO Demo 2",
    "cro",
    "https://trialaxis.app",
  )
  const clinic1OrgId = await createOrganization(
    "Rilski Demo Clinic",
    "clinic",
  )
  const clinic2OrgId = await createOrganization(
    "Tokuda Demo Clinic",
    "clinic",
  )
  const clinic3OrgId = await createOrganization(
    "St. George Demo Clinic",
    "clinic",
  )

  await upsertProfile(cro1Id, "cro", "Alex", "Morgan", cro1OrgId)
  await upsertProfile(cro2Id, "cro", "Jordan", "Taylor", cro2OrgId)
  await upsertProfile(
    clinic1AdminId,
    "clinic_admin",
    "Elena",
    "Petrova",
    clinic1OrgId,
  )
  await upsertProfile(
    clinic2AdminId,
    "clinic_admin",
    "Ivan",
    "Dimitrov",
    clinic2OrgId,
  )
  await upsertProfile(
    clinic3AdminId,
    "clinic_admin",
    "Maria",
    "Ivanova",
    clinic3OrgId,
  )

  await supabase
    .from("clinics")
    .update({ organization_id: clinic1OrgId })
    .eq("id", "00000000-0000-0000-0000-000000000201")
  await supabase
    .from("clinics")
    .update({ organization_id: clinic2OrgId })
    .eq("id", "00000000-0000-0000-0000-000000000202")
  await supabase
    .from("clinics")
    .update({ organization_id: clinic3OrgId })
    .eq("id", "00000000-0000-0000-0000-000000000203")

  console.log("Linked clinic admins to demo clinic organizations")

  await insertSeedProjects(cro1OrgId)

  console.log("Seed complete.")
  console.log("")
  console.log("Demo accounts:")
  console.log("  cro@demo.com         / Demo1234!  (CRO)")
  console.log("  cro2@demo.com        / Demo1234!  (CRO)")
  console.log("  clinic1@demo.com     / Demo1234!  (Clinic Admin -> Rilski)")
  console.log("  clinic2@demo.com     / Demo1234!  (Clinic Admin -> Tokuda)")
  console.log("  clinic3@demo.com     / Demo1234!  (Clinic Admin -> St. George)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
