# TrialAxis MVP Roadmap

**Stack**: Next.js 16 (App Router) + Supabase + Tailwind + shadcn/ui

---

## Phase 1: Project Setup & Database Schema ✅

**Goal**: Initialize Next.js + Supabase, define all tables, seed demo data

### Tasks

- [x] 1.1 Initialize Next.js 16 project (App Router, TypeScript, Tailwind CSS v4, shadcn/ui)
- [x] 1.2 Supabase cloud project initialized and linked
- [x] 1.3 `@supabase/ssr` and `@supabase/supabase-js` installed
- [x] 1.4 `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` created
- [x] 1.5 Full DB schema applied via Supabase MCP migrations:
  - `profiles` (id, role, first_name, last_name, full_name, organization_id) — auto-created by trigger on `auth.users` insert
  - `organizations` (id, name, type, website, description)
  - `therapeutic_areas` (id, name, description) — seeded with 10 areas
  - `clinics` (id, organization_id, name, status, address, city, country, lat/lng, capacity, phase_experience, therapeutic_area_ids)
  - `clinic_equipment` (id, clinic_id, name, category, model, manufacturer, quantity)
  - `clinic_availability` (id, clinic_id, type, start_date, end_date)
  - `trial_projects` (id, organization_id, title, description, status, phase, therapeutic_area_id, target_enrollment, dates)
  - `project_requirements` (id, project_id, type, label, value jsonb, weight, is_hard_filter)
  - `match_results` (id, project_id, clinic_id, status, overall_score, score_breakdown jsonb, algorithm_version)
  - `inquiries` (id, match_result_id, status, subject, created_by)
  - `inquiry_messages` (id, inquiry_id, sender_id, type, content, metadata)
  - `audit_log` (id, user_id, action, table_name, record_id, old/new values)
- [x] 1.6 RLS enabled on all tables with role-appropriate policies
- [x] 1.7 `updated_at` auto-triggers on all mutable tables
- [x] 1.8 TypeScript types in `src/types/`

**Covers**: R1, R2, R9

---

## Phase 2: Auth & Role-Based Routing ✅

**Goal**: Supabase Auth with role selection at registration, protected routes

### Tasks

- [x] 2.1 Register page: email, password, first name, last name, role picker (Sponsor / Clinic Admin)
- [x] 2.2 On register: `supabase.auth.signUp()` with role/name in `user_metadata`; profile auto-created by DB trigger
- [x] 2.3 Login page: `supabase.auth.signInWithPassword()`
- [x] 2.4 `middleware.ts`: redirect unauthenticated → `/login`, wrong-role access redirects to role home
- [x] 2.5 Route groups: `(auth)` guest-only, `(sponsor)` sponsor-only, `(clinic)` clinic_admin-only
- [x] 2.6 Root layout with `QueryClientProvider`, `<Toaster />`, role-aware `Navbar`

**Covers**: R9

---

## Phase 3: Clinic Profile Management ✅

**Goal**: Clinic admin can build and manage their full profile

### Tasks

- [x] 3.1 Clinic profile form: name, city, address, contact info
- [x] 3.2 Therapeutic area multi-select (fetched from `therapeutic_areas`)
- [x] 3.3 Equipment management: add/remove, category, quantity
- [x] 3.4 Certifications page
- [x] 3.5 Availability settings: date range, availability type
- [x] 3.6 Server Actions for all mutations
- [ ] 3.7 Profile completion indicator — deferred to Phase 8 polish

**Covers**: R3

---

## Phase 4: Trial Project Management ✅

**Goal**: Sponsor can create trial projects and define matching requirements

### Tasks

- [x] 4.1 Trial project creation form: title, description, therapeutic area, phase, patient count, timeline, geographic preference
- [x] 4.2 Requirements builder: type, label, value (JSONB), weight, hard filter toggle
- [x] 4.3 My projects list page (`/sponsor/projects`)
- [x] 4.4 Project detail page showing requirements and match status

**Covers**: R4

---

## Phase 5: Matching Algorithm ✅

**Goal**: Rule-based scoring engine that ranks clinics against trial requirements

### Tasks

- [x] 5.1 `src/app/api/match/route.ts` (POST endpoint, takes `trial_project_id`)
- [x] 5.2 Load trial project + requirements from DB
- [x] 5.3 Load all clinics with equipment, availability, therapeutic areas
- [x] 5.4 Hard filter: clinics missing any `is_hard_filter=true` requirement are excluded
- [x] 5.5 Score remaining clinics across 5 dimensions:
  - Therapeutic area match: 30 pts
  - Equipment match: 25 pts
  - Certification/experience: 20 pts
  - Capacity/availability overlap: 15 pts
  - Geographic match: 10 pts
- [x] 5.6 Delete existing `match_results` for project before inserting new ranked rows with `score_breakdown` JSONB
- [x] 5.7 Return ranked list; project status → `active` on success, remains `draft` on zero results

**Covers**: R5

---

## Phase 6: Match Results UI + Partnership Inquiries ✅

**Goal**: Sponsor views ranked matches and contacts clinics; clinics respond

### Tasks

- [x] 6.1 Match results page: ranked clinic cards with overall score + dimension breakdown
- [x] 6.2 Clinic profile preview from match results
- [x] 6.3 "Send Inquiry" form → inserts into `inquiries` + `inquiry_messages`
- [x] 6.4 Clinic admin inquiry inbox (`/clinic/inquiries`)
- [x] 6.5 Accept / Decline actions with messaging
- [x] 6.6 Sponsor sees inquiry status on project page

**Covers**: R5 (frontend), R6

---

## Phase 7: Landing Page & Public Pages ✅

**Goal**: Visitor-facing pages

### Tasks

- [x] 7.1 Landing page: value proposition, how it works, dual CTA (sign up as sponsor or clinic)
- [x] 7.2 Public clinic browse (`/clinics`) — limited view: name, city, specializations only
- [ ] 7.3 ~~Contact form (`/contact`)~~ — **deferred to post-MVP**. Visitor CTA goes directly to `/register`. No `contact_inquiries` table used in MVP.
- [x] 7.4 Role-aware navbar across all pages

> **Note:** R7 (Contact Form) is post-MVP. All "Get in Touch" references in the nav/footer should link to `/register` instead.

---

## Phase 8: Polish & Demo Prep 🔄

**Goal**: E2E flow works, looks good, demo-ready

### Tasks

- [ ] 8.1 E2E: Sponsor registers → creates project → adds requirements → runs match → views results → sends inquiry → clinic accepts
- [ ] 8.2 E2E: Clinic admin registers → fills profile → receives inquiry → responds
- [ ] 8.3 Loading states and error handling across all pages
- [ ] 8.4 Responsive layout (mobile-friendly enough for demo)
- [ ] 8.5 Seed data: realistic clinics, meaningful match variance across trial projects
- [ ] 8.6 Deploy to Vercel + Supabase cloud (cloud project already live)
