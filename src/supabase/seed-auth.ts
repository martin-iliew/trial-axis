import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createUser(
  email: string,
  password: string,
  role: 'sponsor' | 'clinic_admin',
  firstName: string,
  lastName: string,
) {
  // Creating the user fires the handle_new_user trigger which creates
  // the organization and profile automatically.
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, first_name: firstName, last_name: lastName },
  })
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`)

  console.log(`✓ Created user: ${email} (${data.user.id})`)
  return data.user.id
}

async function getOrganizationId(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single()
  if (error || !data?.organization_id) {
    throw new Error(`Could not find organization for user ${userId}: ${error?.message}`)
  }
  return data.organization_id
}

async function linkClinicToOrg(clinicId: string, organizationId: string) {
  const { error } = await supabase
    .from('clinics')
    .update({ organization_id: organizationId })
    .eq('id', clinicId)
  if (error) throw new Error(`Failed to link clinic ${clinicId}: ${error.message}`)
}

async function main() {
  console.log('Seeding demo auth users...\n')

  // ── Sponsors ──────────────────────────────────────────────
  await createUser('sponsor@demo.com', 'Demo1234!', 'sponsor', 'Alex', 'Morgan')
  await createUser('sponsor2@demo.com', 'Demo1234!', 'sponsor', 'Jordan', 'Taylor')

  // ── Clinic admins ─────────────────────────────────────────
  const clinic1Id = await createUser('clinic1@demo.com', 'Demo1234!', 'clinic_admin', 'Elena', 'Petrova')
  const clinic2Id = await createUser('clinic2@demo.com', 'Demo1234!', 'clinic_admin', 'Ivan', 'Dimitrov')
  const clinic3Id = await createUser('clinic3@demo.com', 'Demo1234!', 'clinic_admin', 'Maria', 'Ivanova')

  // Fetch the org IDs created by the trigger
  const [org1, org2, org3] = await Promise.all([
    getOrganizationId(clinic1Id),
    getOrganizationId(clinic2Id),
    getOrganizationId(clinic3Id),
  ])

  // Link seeded clinics to these clinic admin orgs
  await linkClinicToOrg('00000000-0000-0000-0000-000000000201', org1) // Rilski → Elena
  await linkClinicToOrg('00000000-0000-0000-0000-000000000202', org2) // Tokuda → Ivan
  await linkClinicToOrg('00000000-0000-0000-0000-000000000203', org3) // St. George → Maria

  console.log('\n✓ Linked clinic admins to seeded clinics')

  console.log('\n────────────────────────────────────')
  console.log('Demo accounts (all passwords: Demo1234!)')
  console.log('────────────────────────────────────')
  console.log('  sponsor@demo.com    — Sponsor (Alex Morgan)')
  console.log('  sponsor2@demo.com   — Sponsor (Jordan Taylor)')
  console.log('  clinic1@demo.com    — Clinic Admin → St. Ivan Rilski, Sofia')
  console.log('  clinic2@demo.com    — Clinic Admin → Tokuda, Sofia')
  console.log('  clinic3@demo.com    — Clinic Admin → St. George, Plovdiv')
  console.log('────────────────────────────────────\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
