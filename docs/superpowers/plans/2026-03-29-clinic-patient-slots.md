# Clinic Patient Slots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `slots_available` per availability window and surface `patient_capacity` on the clinic profile, then use slots as a soft signal in the match algorithm.

**Architecture:** Four independent changes wired together — DB type regeneration cleans up the cast hack, the clinic form gains two new inputs, the match algorithm replaces a flat 15-pt availability score with slot-proportional logic, and the sponsor clinic preview modal shows availability windows with slot counts.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres + RLS), Zod, React Hook Form, Tailwind CSS semantic tokens.

---

## Current State (already done — do not redo)

The DB migration adding `slots_available integer` to `clinic_availability` has already been applied. The following code changes were also partially applied:

- `src/features/clinics/actions.ts` — `upsertClinicSchema`, `upsertClinic`, `upsertAvailabilitySchema`, `addAvailability` all accept the new fields.
- `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx`:
  - `profileSchema` includes `patient_capacity`
  - `availabilitySchema` includes `slots_available`
  - `defaultValues` includes `patient_capacity`
  - Profile form UI has `patient_capacity` input
  - Optimistic item in `onAddAvailability` includes `slots_available`
  - Availability list display uses a type cast to show slots (works, but messy)

**Remaining work: Tasks 1–4 below.**

---

## Task 1: Regenerate Supabase TypeScript types

**Files:**
- Modify: `src/types/supabase.ts`

- [ ] **Step 1: Run type generation**

```bash
npx supabase gen types typescript --project-id quspttdskskroknumixc > src/types/supabase.ts
```

Expected: file updated with `slots_available: number | null` in the `clinic_availability` Row/Insert/Update types.

- [ ] **Step 2: Remove the type cast in the availability list**

In `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx`, the list currently uses an ugly cast. Replace it with direct access now that the type is correct.

Find this block (around line 473):
```tsx
<Caption className="text-secondary capitalize">
  {a.type}
  {(a as Tables<"clinic_availability"> & { slots_available?: number | null }).slots_available
    ? ` · ${(a as Tables<"clinic_availability"> & { slots_available?: number | null }).slots_available} patient slots`
    : ""}
  {a.notes ? ` · ${a.notes}` : ""}
</Caption>
```

Replace with:
```tsx
<Caption className="text-secondary capitalize">
  {a.type}
  {a.slots_available != null
    ? ` · ${a.slots_available} patient slots`
    : " · slots not specified"}
  {a.notes ? ` · ${a.notes}` : ""}
</Caption>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `slots_available`.

- [ ] **Step 4: Commit**

```bash
git add src/types/supabase.ts src/app/\(clinic\)/clinic/profile/components/ClinicProfileTabs.tsx
git commit -m "chore(types): regenerate supabase types with slots_available; remove cast"
```

---

## Task 2: Add `slots_available` input to the availability form UI

**Files:**
- Modify: `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx`

The schema already has `slots_available` but the form is missing the input field.

- [ ] **Step 1: Add the input between the status select and notes fields**

Find this block in the availability form (around line 510):
```tsx
          <div className="space-y-1.5">
            <Label htmlFor="avail_type">Status</Label>
            <select
              id="avail_type"
              className="h-10 w-full rounded-xl border border-primary bg-surface-level-0 px-3 text-body-small text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
              {...availForm.register("type")}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="tentative">Tentative</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avail_notes">Notes</Label>
            <Input id="avail_notes" placeholder="Optional" {...availForm.register("notes")} />
          </div>
```

Replace with:
```tsx
          <div className="space-y-1.5">
            <Label htmlFor="avail_type">Status</Label>
            <select
              id="avail_type"
              className="h-10 w-full rounded-xl border border-primary bg-surface-level-0 px-3 text-body-small text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-level-5"
              {...availForm.register("type")}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="tentative">Tentative</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slots_available">Patient slots available</Label>
            <Input
              id="slots_available"
              type="number"
              min={1}
              placeholder="e.g. 20 (optional)"
              {...availForm.register("slots_available", { valueAsNumber: true })}
            />
            {availForm.formState.errors.slots_available && (
              <Caption className="text-icon-status-danger">
                {availForm.formState.errors.slots_available.message}
              </Caption>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avail_notes">Notes</Label>
            <Input id="avail_notes" placeholder="Optional" {...availForm.register("notes")} />
          </div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(clinic\)/clinic/profile/components/ClinicProfileTabs.tsx
git commit -m "feat(clinic): add slots_available input to availability window form"
```

---

## Task 3: Update `scoreAvailability` in the match algorithm

**Files:**
- Modify: `src/app/api/match/route.ts`

The current function gives 10 pts for date overlap + 5 pts for `patient_capacity > 0`. Replace with the slot-proportional 15-pt logic from the spec.

- [ ] **Step 1: Replace `scoreAvailability`**

Find the current function (around line 66):
```ts
function scoreAvailability(cp: ClinicProfile, trial: TrialProject): number {
  let availPoints = 0
  const capacityPoints = cp.clinic.patient_capacity && cp.clinic.patient_capacity > 0 ? 5 : 0

  if (!trial.start_date || !trial.end_date) {
    availPoints = 10
  } else {
    const hasOverlap = cp.availability.some(
      (a) => a.type === "available" && a.start_date <= trial.end_date! && trial.start_date! <= a.end_date
    )
    availPoints = hasOverlap ? 10 : 0
  }

  return availPoints + capacityPoints
}
```

Replace with:
```ts
function scoreAvailability(cp: ClinicProfile, trial: TrialProject): number {
  // No trial dates → clinic is always eligible
  if (!trial.start_date || !trial.end_date) return 15

  const overlappingWindows = cp.availability.filter(
    (a) =>
      a.type === "available" &&
      a.start_date <= trial.end_date! &&
      trial.start_date! <= a.end_date
  )

  if (overlappingWindows.length === 0) return 0

  const target = trial.target_enrollment
  if (!target || target <= 0) return 15

  // Find the best (highest) slots_available across overlapping windows
  const slots = overlappingWindows
    .map((a) => (a as typeof a & { slots_available?: number | null }).slots_available)
    .filter((s): s is number => s != null && s > 0)

  if (slots.length === 0) {
    // Overlap exists but no slot count declared — partial credit
    return 8
  }

  const bestSlots = Math.max(...slots)
  if (bestSlots >= target) return 15
  return Math.max(3, Math.round((bestSlots / target) * 15))
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/match/route.ts
git commit -m "feat(match): slot-proportional availability scoring (15 pts)"
```

---

## Task 4: Show availability windows + capacity in the clinic preview modal

**Files:**
- Modify: `src/app/(sponsor)/sponsor/projects/[id]/matches/components/MatchResultCard.tsx`

The `ClinicPreviewModal` currently fetches the clinic row but not its availability windows.

- [ ] **Step 1: Add availability state and fetch to `ClinicPreviewModal`**

Find the existing state/effect in `ClinicPreviewModal` (around line 65):
```tsx
  const [clinic, setClinic] = useState<Tables<"clinics"> | null>(null)
  const [areaNames, setAreaNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", clinicId)
        .single()

      setClinic(clinicData)

      if (clinicData?.therapeutic_area_ids?.length) {
        const { data: areas } = await supabase
          .from("therapeutic_areas")
          .select("name")
          .in("id", clinicData.therapeutic_area_ids)
        setAreaNames((areas ?? []).map((a) => a.name))
      }

      setLoading(false)
    }
    load()
  }, [clinicId])
```

Replace with:
```tsx
  const [clinic, setClinic] = useState<Tables<"clinics"> | null>(null)
  const [areaNames, setAreaNames] = useState<string[]>([])
  const [windows, setWindows] = useState<(Tables<"clinic_availability"> & { slots_available: number | null })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", clinicId)
        .single()

      setClinic(clinicData)

      if (clinicData?.therapeutic_area_ids?.length) {
        const { data: areas } = await supabase
          .from("therapeutic_areas")
          .select("name")
          .in("id", clinicData.therapeutic_area_ids)
        setAreaNames((areas ?? []).map((a) => a.name))
      }

      const { data: availData } = await supabase
        .from("clinic_availability")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("start_date", { ascending: true })
      setWindows((availData ?? []) as (Tables<"clinic_availability"> & { slots_available: number | null })[])

      setLoading(false)
    }
    load()
  }, [clinicId])
```

- [ ] **Step 2: Add capacity and availability display to the modal body**

Find the section in the modal that renders `patient_capacity` (around line 133):
```tsx
              {clinic.patient_capacity && (
                <Caption>
                  <span className="text-secondary">Patient capacity: </span>
                  {clinic.patient_capacity}
                </Caption>
              )}
```

Replace with:
```tsx
              {clinic.patient_capacity && (
                <Caption>
                  <span className="text-secondary">Max capacity: </span>
                  {clinic.patient_capacity} patients
                </Caption>
              )}
              {windows.length > 0 && (
                <div>
                  <Caption className="text-secondary">Availability windows:</Caption>
                  <ul className="mt-1 space-y-1">
                    {windows.map((w) => (
                      <li key={w.id}>
                        <Caption>
                          {w.start_date} – {w.end_date}
                          {" · "}
                          <span className="capitalize">{w.type}</span>
                          {w.slots_available != null
                            ? ` · ${w.slots_available} slots`
                            : " · slots not specified"}
                        </Caption>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(sponsor\)/sponsor/projects/\[id\]/matches/components/MatchResultCard.tsx
git commit -m "feat(sponsor): show clinic availability windows and capacity in match preview modal"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `slots_available` on `clinic_availability` — Task 1 (types), Task 2 (form)
- ✅ `patient_capacity` on profile form — already done (pre-existing)
- ✅ Availability list shows slots or "not specified" — Task 1 step 2
- ✅ New scoring logic — Task 3
- ✅ Clinic preview modal shows capacity + windows — Task 4

**Placeholder scan:** None found.

**Type consistency:** `slots_available` accessed as `a.slots_available` after type regeneration in Tasks 1, 3, 4. Consistent throughout.
