# Wave 3 — Features: Backend Implementation Plan (DB Dev + Logic Dev)

**Timeframe**: Hours 3.5–6 (2.5 hours)
**Exit criterion**: Sponsor can create project -> add requirements -> run match -> view results -> send inquiry. Clinic can accept/decline.
**Scope**: This plan covers DB Dev and Logic Dev lanes only (no UI).

---

## What Exists After Wave 2

| Component | Status |
|-----------|--------|
| All 12 tables | Live in Supabase with generated types |
| Auth + middleware | Working — register, login, role redirect |
| Clinic profile CRUD | 7 server actions + wired page |
| Supabase clients | Browser + server, fully typed |
| Sponsor route group | Layout exists, no pages yet |
| Matching API | Not started |
| Trial project actions | Not started |
| Inquiry actions | Not started |

---

## Architecture Decisions

### 1. Requirement Type Taxonomy

The `trial_requirements.type` field is a free string. We standardize on these values so the matching algorithm can interpret them:

| Type Value | Matches Against | Example Value |
|---|---|---|
| `therapeutic_area` | `clinic_specializations` | `"Oncology"` |
| `equipment` | `equipment.name` (case-insensitive contains) | `"MRI Scanner"` |
| `certification` | `certifications.name` (case-insensitive contains) | `"GCP Certification"` |
| `capacity` | `clinic_availability.capacity` | `"50"` (parsed as number) |
| `geographic` | `clinics.city` (case-insensitive) | `"Sofia"` |

### 2. Matching Algorithm — Scoring Model

**Hard filter first**: Any `Required` priority requirement that fails → clinic is excluded entirely.

**Soft scoring** (5 dimensions, 100 pts total):

| Dimension | Weight | How It's Calculated |
|---|---|---|
| **Therapeutic Area** | 30 pts | Binary — clinic has matching specialization in `clinic_specializations` for the trial's `therapeutic_area_id`. All-or-nothing. |
| **Equipment** | 25 pts | Ratio — `(matched equipment requirements) / (total equipment requirements) * 25`. A requirement matches if clinic has equipment with name containing the requirement value (case-insensitive). Only counts `Preferred` requirements here (Required ones are hard-filtered). If no equipment requirements exist, award full 25 pts. |
| **Certifications** | 20 pts | Ratio — `(matched cert requirements) / (total cert requirements) * 20`. Same matching logic as equipment. If no cert requirements, award full 20 pts. |
| **Capacity/Availability** | 15 pts | Composite — split into availability overlap (10 pts) + capacity sufficiency (5 pts). Availability: clinic's `[start_date, end_date]` overlaps trial's `[start_date, end_date]`. Capacity: `clinic_availability.capacity >= trial.patient_count`. If trial has no dates or patient_count, award full pts for that sub-dimension. |
| **Geographic** | 10 pts | Binary — `clinic.city` matches `trial.geographic_preference` (case-insensitive). If no geographic preference set, award full 10 pts. |

**Key design choice**: When a dimension has zero requirements (e.g., no equipment requirements defined), the clinic gets **full points** for that dimension. Rationale: absence of requirement = no constraint = all clinics equally qualified. This prevents clinics from being penalized for dimensions the sponsor didn't care about.

### 3. Inquiry State Machine

```
match_results.status:    pending → inquiry_sent → accepted / declined
partnership_inquiries:   (created) pending → accepted / declined
```

Sending an inquiry creates a `partnership_inquiries` row AND flips `match_results.status` to `inquiry_sent`. Accepting/declining updates both tables.

### 4. Server Actions vs API Routes

- **Matching algorithm** → API Route (`POST /api/match`). Reason: it's a computational endpoint that could be called from different contexts. Returns JSON.
- **Everything else** (CRUD on projects, requirements, inquiries) → Server Actions in `features/*/actions.ts`. Reason: they're form-driven mutations that benefit from `revalidatePath`.

---

## DB Dev Tasks (Matching Algorithm + Trial Project Actions)

### Task 1: Trial Project Server Actions (30 min)

**File**: `web/features/trial-project/actions.ts`

```
"use server"

createTrialProject(data: { title, description?, therapeutic_area_id?, phase?, patient_count?, start_date?, end_date?, geographic_preference? })
  → Get auth user
  → Insert into trial_projects with sponsor_id = user.id, status = 'draft'
  → revalidatePath("/sponsor/projects")
  → Return { data, error }

updateTrialProject(id: string, data: Partial<above>)
  → Get auth user
  → Verify ownership: select where id = id AND sponsor_id = user.id AND status = 'draft'
  → If not found or not draft, return error
  → Update trial_projects
  → revalidatePath("/sponsor/projects/[id]")

addRequirement(data: { trial_project_id, type, value, priority })
  → Get auth user
  → Verify ownership of the trial project
  → Insert into trial_requirements
  → revalidatePath for project detail page

deleteRequirement(id: string)
  → Get auth user
  → Verify ownership (join trial_requirements → trial_projects → check sponsor_id)
  → Delete from trial_requirements
  → revalidatePath
```

**Ownership verification pattern** (use consistently):
```ts
// Always verify the sponsor owns the project before mutating
const { data: project } = await supabase
  .from("trial_projects")
  .select("id")
  .eq("id", projectId)
  .eq("sponsor_id", user.id)
  .single()
if (!project) return { error: "Not found or not authorized" }
```

### Task 2: Matching Algorithm API Route (60 min)

**File**: `web/app/api/match/route.ts`

This is the most complex piece. Implementation steps:

```
POST /api/match
Body: { trial_project_id: string }

Step 1 — Auth + Load Trial
  → createServerClient, getUser
  → Load trial_project where id = trial_project_id AND sponsor_id = user.id
  → If not found → 404
  → Load all trial_requirements for this project

Step 2 — Load All Clinics (with related data)
  → Load clinics with: specializations, equipment, certifications, availability
  → Use separate queries (Supabase doesn't do deep nested joins well):
    - All clinics: supabase.from("clinics").select("*")
    - All specializations: supabase.from("clinic_specializations").select("*")
    - All equipment: supabase.from("equipment").select("*")
    - All certifications: supabase.from("certifications").select("*")
    - All availability: supabase.from("clinic_availability").select("*")
  → Group by clinic_id in-memory (build a Map<clinicId, ClinicProfile>)

Step 3 — Separate Requirements by Type
  → Group requirements: { therapeutic_area[], equipment[], certification[], capacity[], geographic[] }
  → Separate into required vs preferred for each type

Step 4 — Hard Filter (Required criteria)
  → For each clinic, check ALL Required requirements:
    - therapeutic_area Required: clinic must have matching specialization
    - equipment Required: clinic must have equipment name matching (case-insensitive contains)
    - certification Required: clinic must have cert name matching
    - capacity Required: clinic availability.capacity >= parseInt(requirement.value)
    - geographic Required: clinic.city matches value (case-insensitive)
  → If ANY Required fails → exclude clinic

Step 5 — Score Remaining Clinics
  → For each surviving clinic, compute 5 dimension scores:

  therapeuticAreaScore(clinic, trial):
    if trial.therapeutic_area_id is null → 30 (no preference)
    clinicAreaIds = clinic.specializations.map(s => s.therapeutic_area_id)
    return clinicAreaIds.includes(trial.therapeutic_area_id) ? 30 : 0

  equipmentScore(clinic, preferredEquipReqs):
    if preferredEquipReqs.length === 0 → 25 (no requirements)
    matched = count reqs where clinic has equipment with name containing req.value
    return (matched / preferredEquipReqs.length) * 25

  certificationScore(clinic, preferredCertReqs):
    if preferredCertReqs.length === 0 → 20
    matched = count reqs where clinic has cert with name containing req.value
    return (matched / preferredCertReqs.length) * 20

  availabilityScore(clinic, trial):
    availPoints = 0, capacityPoints = 0
    if no trial dates → availPoints = 10
    else if clinic.availability overlaps trial dates → availPoints = 10
    if no trial.patient_count → capacityPoints = 5
    else if clinic.availability.capacity >= trial.patient_count → capacityPoints = 5
    return availPoints + capacityPoints

  geographicScore(clinic, trial):
    if no trial.geographic_preference → 10
    return clinic.city.toLowerCase() === trial.geographic_preference.toLowerCase() ? 10 : 0

  totalScore = sum of all 5
  breakdown = { therapeutic_area, equipment, certification, availability, geographic }

Step 6 — Persist Results
  → Delete existing match_results for this trial_project_id
  → Insert new match_results rows (one per scored clinic), ordered by score desc
  → Update trial_projects.status to 'matched' (or keep 'draft' if 0 results)

Step 7 — Return
  → Return JSON: { results: [...], count: N }
  → Each result: { clinic_id, clinic_name, clinic_city, score, breakdown, status: 'pending' }
```

**Date overlap check**:
```ts
// Two ranges overlap if: start1 <= end2 AND start2 <= end1
const overlaps = clinicAvail.start_date <= trial.end_date
              && trial.start_date <= clinicAvail.end_date
```

**Edge cases to handle**:
- Clinic with no availability record → gets 0 for availability dimension (not excluded unless it's Required)
- Clinic with no equipment → matches 0 equipment requirements
- Trial with no requirements at all → every clinic scores 100
- All clinics filtered out by hard filter → return empty array, status stays 'draft'

### Task 3: Seed Data Enhancement (20 min)

**File**: `web/supabase/seed.sql`

The matching algorithm needs good seed data to produce meaningful results. If seed doesn't exist yet, create it. If it does, verify it has:

- 15 therapeutic areas
- 8-10 clinics with **distinct** profiles:
  - Clinic A (Sofia): Oncology + Cardiology, has MRI + CT Scanner, GCP cert, high capacity → should be top match for oncology trials
  - Clinic B (Plovdiv): Neurology, has EEG + MRI, ISO 9001, medium capacity → top for neuro
  - Clinic C (Varna): Oncology + Immunology, has PET Scanner, GCP + ISO, low capacity → matches oncology but capacity-limited
  - etc. — ensure no two clinics are identical
- 3 trial projects with varied requirements:
  - Easy match: Phase 2 Oncology in Sofia, requires MRI + GCP → Clinic A should score ~90+
  - Hard match: Phase 3 Rare Disease, requires PET Scanner + genetic lab + FDA audit cert → maybe 0-1 matches
  - Medium match: Phase 1 Cardiology, prefers Sofia, prefers Echo machine → several partial matches
- 2 sponsor accounts + 3 clinic_admin accounts in auth.users + profiles

---

## Logic Dev Tasks (Inquiries + Data Loading Pages)

### Task 4: Inquiry Server Actions (30 min)

**File**: `web/features/inquiries/actions.ts`

```
"use server"

sendInquiry({ matchResultId, message, notes? })
  → Get auth user (must be sponsor)
  → Load match_result by id, verify it belongs to a trial owned by this sponsor
  → Verify match_result.status === 'pending' (can't send duplicate)
  → Get clinic_id from match_result
  → Insert partnership_inquiries: { match_result_id, sponsor_id: user.id, clinic_id, message, notes, status: 'pending' }
  → Update match_results.status to 'inquiry_sent'
  → revalidatePath for project matches page
  → Return { data, error }

respondToInquiry(inquiryId: string, action: 'accepted' | 'declined', { response_message?, decline_reason? })
  → Get auth user (must be clinic_admin)
  → Load inquiry by id, verify clinic_id matches a clinic owned by this user
  → Verify inquiry.status === 'pending' (can't re-respond)
  → Update partnership_inquiries: { status: action, response_message, decline_reason }
  → Update match_results.status to action (accepted/declined)
  → revalidatePath for clinic inquiries page
  → Return { data, error }
```

**Validation rules**:
- `decline_reason` is required when action = 'declined'
- `response_message` is optional for both accept and decline
- Can only respond to pending inquiries (idempotency guard)

### Task 5: Sponsor Project Data Loaders (20 min)

These are Server Component data-fetching functions. They could live in the page files themselves or in a shared `features/trial-project/queries.ts`.

**Recommended: `web/features/trial-project/queries.ts`**

```
getProjectsForSponsor(userId)
  → supabase.from("trial_projects").select("*, therapeutic_areas(name)").eq("sponsor_id", userId).order("created_at", { ascending: false })

getProjectDetail(projectId, userId)
  → supabase.from("trial_projects").select("*, therapeutic_areas(name)").eq("id", projectId).eq("sponsor_id", userId).single()

getProjectRequirements(projectId)
  → supabase.from("trial_requirements").select("*").eq("trial_project_id", projectId).order("created_at")

getMatchResults(projectId)
  → supabase.from("match_results").select("*, clinics(name, city, contact_email)").eq("trial_project_id", projectId).order("score", { ascending: false })

getMatchResultWithInquiry(matchResultId)
  → supabase.from("match_results").select("*, partnership_inquiries(*), clinics(*)").eq("id", matchResultId).single()
```

### Task 6: Clinic Inquiry Data Loaders (20 min)

**File**: `web/features/inquiries/queries.ts`

```
getInquiriesForClinic(clinicId)
  → supabase.from("partnership_inquiries")
    .select("*, match_results(*, trial_projects(title, phase, patient_count, start_date, end_date, therapeutic_areas(name))), profiles!sponsor_id(first_name, last_name)")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })

getInquiryDetail(inquiryId, clinicId)
  → Same select as above but .eq("id", inquiryId).eq("clinic_id", clinicId).single()
```

### Task 7: Clinic Inquiry Pages — Server Components (30 min)

**File**: `web/app/(clinic)/inquiries/page.tsx`
```
Server Component:
  → createServerClient, getUser
  → Load clinic for this user (to get clinic_id)
  → Call getInquiriesForClinic(clinic.id)
  → Render inquiry list (pass to client component for interactivity)
  → Handle empty state: "No inquiries yet"
```

**File**: `web/app/(clinic)/inquiries/[id]/page.tsx`
```
Server Component:
  → createServerClient, getUser
  → Load clinic for user
  → Call getInquiryDetail(params.id, clinic.id)
  → If not found → notFound()
  → Render inquiry detail with trial info + accept/decline forms
```

### Task 8: Sponsor Match Results Page — Server Component (20 min)

**File**: `web/app/(sponsor)/projects/[id]/matches/page.tsx`
```
Server Component:
  → createServerClient, getUser
  → Load project (verify ownership)
  → Call getMatchResults(projectId)
  → Also load existing inquiries for these match results to show status
  → Pass data to client component for rendering score cards + send inquiry button
```

### Task 9: Public Clinics Browse + Contact Page (20 min)

**File**: `web/app/clinics/page.tsx`
```
Server Component (public, no auth required):
  → Load all clinics with top 3 specializations
  → supabase.from("clinics").select("id, name, city, clinic_specializations(therapeutic_areas(name))")
  → Render simple card grid: clinic name, city, specialization badges
```

**File**: `web/app/contact/page.tsx` + `web/features/contact/actions.ts`
```
Server Action: submitContactInquiry({ name, email, message })
  → Insert into contact_inquiries
  → Return success

Page: Simple form with name, email, message fields + submit
```

---

## Parallel Execution Timeline

```
                    0:00          0:30          1:00          1:30          2:00          2:30
                    │             │             │             │             │             │
  DB Dev            ├─ Trial project actions ──┤─── Matching algorithm ────────────────┤─ Seed data ─┤
                    │  (createProject,          │   (the big one — API route,           │  verify &   │
                    │   addRequirement, etc.)   │   scoring, hard filter, persist)      │  enhance    │
                    │                           │                                       │             │
  Logic Dev         ├─ Inquiry actions ────────┤─ Query helpers ─┤─ Inquiry pages ─────┤─ Public ────┤
                    │  (send, accept, decline)  │  (project &     │  (clinic inbox,     │  clinics +  │
                    │                           │  inquiry loaders)│  detail, matches)   │  contact    │
```

**No blockers between lanes**: Logic Dev doesn't need the matching API to build inquiry actions — they just need the `match_results` and `partnership_inquiries` table schemas, which are already typed. The pages can reference the matching endpoint without it existing yet.

**Integration point**: At ~1:30, both devs should do a quick sync. DB Dev's matching algorithm creates `match_results` rows, Logic Dev's inquiry system reads them. Verify the data shape matches expectations.

---

## File Inventory (What Gets Created/Modified)

### New Files
| File | Owner | Purpose |
|---|---|---|
| `web/features/trial-project/actions.ts` | DB Dev | CRUD server actions for trial projects + requirements |
| `web/app/api/match/route.ts` | DB Dev | Matching algorithm API route |
| `web/features/trial-project/queries.ts` | Logic Dev | Reusable data loaders for sponsor pages |
| `web/features/inquiries/actions.ts` | Logic Dev | Send/respond inquiry server actions |
| `web/features/inquiries/queries.ts` | Logic Dev | Reusable data loaders for inquiry pages |
| `web/app/(clinic)/inquiries/page.tsx` | Logic Dev | Clinic inquiry inbox |
| `web/app/(clinic)/inquiries/[id]/page.tsx` | Logic Dev | Inquiry detail + respond |
| `web/app/(sponsor)/projects/[id]/matches/page.tsx` | Logic Dev | Match results list |
| `web/app/clinics/page.tsx` | Logic Dev | Public clinic browse |
| `web/app/contact/page.tsx` | Logic Dev | Public contact form |
| `web/features/contact/actions.ts` | Logic Dev | Contact form server action |

### Modified Files
| File | Owner | Change |
|---|---|---|
| `web/supabase/seed.sql` | DB Dev | Add/verify varied clinic + trial seed data |

---

## Verification Checklist

After both devs finish, verify these flows work:

### Sponsor Flow
- [ ] Create a new trial project (title, therapeutic area, phase, dates, patient count, geographic preference)
- [ ] Add requirements (mix of Required and Preferred, across all 5 types)
- [ ] Hit "Find Matching Clinics" → POST `/api/match` → returns ranked results
- [ ] Results show varied scores (not all same) with per-dimension breakdown
- [ ] Match results are persisted in `match_results` table
- [ ] Send inquiry on a pending match result → creates `partnership_inquiries` row + flips match status
- [ ] Cannot send duplicate inquiry on same match result

### Clinic Flow
- [ ] Clinic admin sees inquiry in inbox with trial details + sponsor name
- [ ] Can open inquiry detail page
- [ ] Can accept inquiry (with optional message)
- [ ] Can decline inquiry (with required reason)
- [ ] Cannot re-respond to already responded inquiry

### Matching Quality
- [ ] Run match on "easy" seed trial → top clinic scores 85+
- [ ] Run match on "hard" seed trial → 0-1 results (most filtered by hard requirements)
- [ ] Run match on "medium" seed trial → 3-5 results with spread of scores
- [ ] Clinics missing Required criteria are excluded (not scored low, excluded entirely)
- [ ] Clinics with no availability still appear but score 0 on that dimension

### Edge Cases
- [ ] Trial with zero requirements → all clinics score 100
- [ ] Trial with only Required therapeutic area → binary: match or exclude
- [ ] Sponsor can only see/modify their own projects
- [ ] Clinic admin can only respond to inquiries sent to their clinic

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Matching algorithm takes longer than 60 min | Delays everything | Start with simplest scoring first (therapeutic area + geographic are trivial). Equipment and cert matching are similar pattern. Availability is most complex — do last. |
| Supabase join syntax surprises | Wasted debug time | Use separate queries + in-memory grouping. More queries but zero join complexity. |
| Seed data doesn't produce varied scores | Demo looks broken | Manually verify 3 trial scenarios against seed clinics before calling it done. |
| Inquiry state gets inconsistent (match_results vs partnership_inquiries) | Data corruption | Both updates happen in same server action. If one fails, error is returned. Could wrap in Supabase RPC/transaction later, but for MVP sequential updates with error checking is fine. |
| Foreign key references in queries (e.g., `clinics(name)`) don't work | Queries fail | Supabase PostgREST requires FK relationships to be defined. Schema should already have them. If not, fall back to separate queries. |
