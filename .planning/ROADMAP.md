# TrialMatch MVP Roadmap

**Stack**: Next.js 15 (App Router) + Supabase + Tailwind + shadcn/ui

---

## Phase 1: Project Setup & Database Schema
**Goal**: Initialize Next.js + Supabase, define all tables, seed demo data

### Tasks
- [ ] 1.1 Initialize Next.js 15 project in `web/` (App Router, TypeScript, Tailwind, shadcn/ui)
- [ ] 1.2 Initialize Supabase project (local dev with Supabase CLI)
- [ ] 1.3 Install `@supabase/ssr`, `@supabase/supabase-js`
- [ ] 1.4 Create `lib/supabase/client.ts` and `lib/supabase/server.ts`
- [ ] 1.5 Define full DB schema in `supabase/schema.sql`:
  - `profiles` (extends auth.users: role, first_name, last_name)
  - `therapeutic_areas` (id, name, description)
  - `clinics` (id, user_id, name, city, address, description, contact_email, contact_phone, website)
  - `clinic_specializations` (clinic_id, therapeutic_area_id) — join table
  - `equipment` (id, clinic_id, equipment_type, name, quantity, is_available)
  - `certifications` (id, clinic_id, certification_name, issued_by, valid_until)
  - `clinic_availability` (id, clinic_id, available_from, available_to, max_concurrent_trials, current_trial_count)
  - `trial_projects` (id, sponsor_user_id, title, description, therapeutic_area_id, phase, required_patient_count, start_date, end_date, geographic_preference, status)
  - `trial_requirements` (id, trial_project_id, requirement_type, description, value, priority)
  - `match_results` (id, trial_project_id, clinic_id, overall_score, breakdown jsonb, matched_at, status)
  - `partnership_inquiries` (id, match_result_id, sender_user_id, message, status, response_message, created_at, responded_at)
  - `contact_inquiries` (id, name, email, organization_type, message, created_at)
- [ ] 1.6 Apply schema: `npx supabase db reset`
- [ ] 1.7 Generate TypeScript types: `npx supabase gen types typescript --local > types/supabase.ts`
- [ ] 1.8 Write `supabase/seed.sql`:
  - ~15 therapeutic areas
  - 10-15 clinics across Bulgarian cities with specializations, equipment, certifications, availability
  - 3-5 sample trial projects with requirements
  - Demo sponsor and clinic_admin accounts via `auth.users` + `profiles`
- [ ] 1.9 Apply seed: `npx supabase db reset` (runs schema + seed)

**Covers**: R1, R2, R9

---

## Phase 2: Auth & Role-Based Routing
**Goal**: Supabase Auth with role selection at registration, protected routes

### Tasks
- [ ] 2.1 Create register page: email, password, first name, last name, role picker (Sponsor / Clinic Admin)
- [ ] 2.2 On register: `supabase.auth.signUp()` + insert into `profiles` with selected role
- [ ] 2.3 Create login page: `supabase.auth.signInWithPassword()`
- [ ] 2.4 Create `middleware.ts`: redirect unauthenticated users to `/login`, redirect wrong-role access
- [ ] 2.5 Create route groups: `(auth)` guest-only, `(sponsor)` sponsor-only, `(clinic)` clinic_admin-only
- [ ] 2.6 Add root layout with session provider, role-aware navbar

**Covers**: R9

---

## Phase 3: Clinic Profile Management
**Goal**: Clinic admin can build and manage their full profile

### Tasks
- [ ] 3.1 Clinic profile form: name, city, address, description, contact info
- [ ] 3.2 Therapeutic area multi-select (fetched from `therapeutic_areas`)
- [ ] 3.3 Equipment management: add/remove/toggle availability
- [ ] 3.4 Certification management: add/remove
- [ ] 3.5 Availability settings: date range, max concurrent trials, current count
- [ ] 3.6 Server Actions for all mutations (insert/update via Supabase)
- [ ] 3.7 Profile completion indicator

**Covers**: R3

---

## Phase 4: Trial Project Management
**Goal**: Sponsor can create trial projects and define matching requirements

### Tasks
- [ ] 4.1 Trial project creation form: title, description, therapeutic area, phase, patient count, timeline, geographic preference
- [ ] 4.2 Requirements builder: add requirements with type (Equipment/Certification/Specialization/Capacity), value, priority (Required/Preferred/NiceToHave)
- [ ] 4.3 My projects list page
- [ ] 4.4 Project detail page showing requirements and match status

**Covers**: R4

---

## Phase 5: Matching Algorithm
**Goal**: Rule-based scoring engine that ranks clinics against trial requirements

### Tasks
- [ ] 5.1 Create `app/api/match/route.ts` (POST endpoint, takes `trial_project_id`)
- [ ] 5.2 Load trial requirements from DB
- [ ] 5.3 Load all clinics with their specializations, equipment, certifications, availability
- [ ] 5.4 Apply hard filters: clinics missing any `Required` criterion are excluded
- [ ] 5.5 Score remaining clinics:
  - Therapeutic area match: 30 points
  - Equipment match (Preferred): 25 points
  - Certification compliance: 20 points
  - Capacity / availability overlap: 15 points
  - Geographic preference match: 10 points
- [ ] 5.6 Persist ranked results to `match_results` table with JSON breakdown
- [ ] 5.7 Return ranked list

**Covers**: R5

---

## Phase 6: Match Results UI + Partnership Inquiries
**Goal**: Sponsor views ranked matches and contacts clinics; clinics respond

### Tasks
- [ ] 6.1 Match results page: ranked clinic cards with overall score + dimension breakdown
- [ ] 6.2 Clinic profile preview modal from match results
- [ ] 6.3 "Send Inquiry" form (message) → inserts into `partnership_inquiries`
- [ ] 6.4 Clinic admin inquiry inbox: list incoming inquiries with trial + sponsor info
- [ ] 6.5 Accept inquiry (optional message) / Decline inquiry (reason required)
- [ ] 6.6 Sponsor sees inquiry status on their project page

**Covers**: R5 (frontend), R6

---

## Phase 7: Landing Page & Public Pages
**Goal**: Visitor-facing pages and contact form

### Tasks
- [ ] 7.1 Landing page: value proposition, how it works, call to action (sign up as sponsor or clinic)
- [ ] 7.2 Public clinic browse (limited view — name, city, specializations only)
- [ ] 7.3 Contact form for visitors (name, email, org type, message → `contact_inquiries`)
- [ ] 7.4 Role-aware navbar across all pages

**Covers**: R7

---

## Phase 8: Polish & Demo Prep
**Goal**: E2E flow works, looks good, demo-ready

### Tasks
- [ ] 8.1 E2E: Sponsor registers → creates project → adds requirements → runs match → views results → sends inquiry → clinic accepts
- [ ] 8.2 E2E: Clinic admin registers → fills profile → receives inquiry → responds
- [ ] 8.3 Loading states and error handling across all pages
- [ ] 8.4 Responsive layout (mobile-friendly enough for demo)
- [ ] 8.5 Seed data validation: clinics look realistic, matches are meaningful
- [ ] 8.6 Deploy to Vercel + Supabase cloud
