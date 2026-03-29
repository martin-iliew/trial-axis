# Clinic Patient Slots Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let clinic admins declare how many patient slots are available per availability window, surface that data to sponsors, and use it as a soft scoring signal in the match algorithm.

---

## Problem

Sponsors have no way to know how many patients a clinic can take on for a new trial. `clinics.patient_capacity` (the infrastructure ceiling) exists in the DB but is not shown in the profile form. `clinic_availability` has date ranges and status but no patient count. The match algorithm awards 5 flat points for `patient_capacity > 0` — a weak signal.

---

## Data Model

### `clinic_availability` — add `slots_available`

```sql
ALTER TABLE public.clinic_availability
  ADD COLUMN IF NOT EXISTS slots_available integer;
```

Nullable. A clinic may declare availability without specifying slots. NULL means "available but count unknown."

### `clinics.patient_capacity`

Already exists (`integer`, nullable). No schema change. Only needs to be surfaced in the profile form and clinic preview modal.

### TypeScript types

Regenerate after migration:
```bash
npx supabase gen types typescript --local --workdir src/supabase > src/types/supabase.ts
```

---

## Scoring — Availability dimension (15 pts total)

Replaces the current split of 10 pts (date overlap) + 5 pts (capacity > 0).

| Condition | Points |
|---|---|
| Trial has no start/end date | 15 |
| Date overlap + `slots_available >= target_enrollment` | 15 |
| Date overlap + `slots_available < target_enrollment` | `round((slots / target) * 15)`, minimum 3 |
| Date overlap + `slots_available` is null | 8 |
| No date overlap with any available window | 0 |

`target_enrollment` comes from `trial_projects.target_enrollment`. If null, treat the same as "no target" and award full points when overlap exists.

The `patient_capacity` field is no longer used in scoring — its role is purely informational for sponsors via the clinic preview modal.

---

## UI Changes

### 1. Clinic profile — Profile tab

Add **"Total patient capacity"** number input (`patient_capacity`) to the profile form, after the website field. Optional. Represents the clinic's physical ceiling (infrastructure max), not current openings.

- Form schema: `patient_capacity: z.number().int().min(1).optional()`
- `upsertClinic` action accepts and saves `patient_capacity`
- `defaultValues` pre-populates from `clinic?.patient_capacity`

### 2. Clinic profile — Certs & Availability tab

**Availability window form** — add optional "Patient slots available" number input (`slots_available`).

- Schema: `slots_available: z.number().int().min(1).optional()`
- `addAvailability` action accepts and saves `slots_available`
- Optimistic item includes `slots_available`

**Availability list** — each row shows slots inline:
- If set: `available · 20 patient slots · notes`
- If null: `available · slots not specified · notes`

### 3. Sponsor — Clinic preview modal (`MatchResultCard.tsx`)

Add two new info lines to the clinic detail modal:

- **Max capacity**: `clinic.patient_capacity` → "Max capacity: 50 patients" or hidden if null
- **Availability windows**: list each window with date range, type, and slots. Format: `Jun 2026 – Dec 2026 · available · 20 slots` or `· slots not specified`

The modal already fetches the full clinic row. Availability windows need a second query: `supabase.from("clinic_availability").select("*").eq("clinic_id", clinicId)`.

---

## Files Changed

| File | Change |
|---|---|
| `src/features/clinics/actions.ts` | Add `patient_capacity` to `upsertClinicSchema` + function signature; add `slots_available` to `upsertAvailabilitySchema` + `addAvailability` signature |
| `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx` | Add `patient_capacity` field to profile form; add `slots_available` field to availability form; update list display |
| `src/app/api/match/route.ts` | Replace `scoreAvailability` with new slot-aware 15-pt logic |
| `src/app/(sponsor)/sponsor/projects/[id]/matches/components/MatchResultCard.tsx` | Add availability windows query + display in `ClinicPreviewModal` |
| `src/types/supabase.ts` | Regenerate after migration |

---

## Out of Scope

- Editing existing availability windows (current UX is add/delete only — no change)
- Unarchiving projects
- Any change to other scoring dimensions
