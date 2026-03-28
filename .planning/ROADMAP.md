# TrialMatch MVP Roadmap

## Phase 1: Domain & Persistence
**Goal**: Define all entities, DB schema, seed trial data and doctor accounts

### Tasks
- [ ] 1.1 Create `Condition` entity in Domain (id, name, category)
- [ ] 1.2 Create `ClinicalTrial` entity in Domain (title, plainLanguageSummary, description, phase, status, sponsor, start/end dates, minAge, maxAge, gender, location as text string)
- [ ] 1.3 Create `TrialCondition` join entity linking trials to conditions
- [ ] 1.4 Create `PatientProfile` entity in Domain (userId, dateOfBirth, gender, city, medicalNotes)
- [ ] 1.5 Create `PatientCondition` join entity linking patient profiles to conditions
- [ ] 1.6 Create `DoctorProfile` entity in Domain (userId, clinicName, specialization, city)
- [ ] 1.7 Create `TrialRequest` entity in Domain (patientId, trialId, doctorId nullable, status enum Pending/Approved/Declined, patientNotes, doctorNote, declineReason, createdAt, updatedAt)
- [ ] 1.8 Create `ContactInquiry` entity in Domain (name, email, conditionText, trialId, createdAt)
- [ ] 1.9 Add repository interfaces: `ITrialRepository`, `IConditionRepository`, `IPatientProfileRepository`, `IDoctorProfileRepository`, `ITrialRequestRepository`, `IContactInquiryRepository`
- [ ] 1.10 Add EF Core configurations for all new entities
- [ ] 1.11 Implement repositories in Infrastructure
- [ ] 1.12 Create and run EF migration
- [ ] 1.13 Build seed data: condition catalog (~30 conditions)
- [ ] 1.14 Build seed data: 15-20 clinical trials with plain-language summaries and eligibility text
- [ ] 1.15 Build seed data: 2-3 doctor accounts with profiles

**Covers**: R1, R2

---

## Phase 2: Backend Use Cases — Trials & Profiles
**Goal**: Implement API endpoints for profiles, trials, conditions, and doctor profiles

### Tasks
- [ ] 2.1 Create `GetTrialsQuery` (list with pagination, filtering by condition/phase/status, keyword search with condition autocomplete support)
- [ ] 2.2 Create `GetTrialByIdQuery` (single trial with conditions and plain-language summary)
- [ ] 2.3 Create `SearchConditionsQuery` (autocomplete search for condition names)
- [ ] 2.4 Create `CreatePatientProfileCommand` (validate + persist profile)
- [ ] 2.5 Create `UpdatePatientProfileCommand` (update existing profile)
- [ ] 2.6 Create `GetPatientProfileQuery` (fetch current user's profile)
- [ ] 2.7 Create `GetConditionsQuery` (list all conditions for multi-select)
- [ ] 2.8 Create `CreateDoctorProfileCommand` (validate + persist doctor profile on registration)
- [ ] 2.9 Create `SearchDoctorsQuery` (search doctors by name/clinic for "Send to GP" feature)
- [ ] 2.10 Add request DTOs and validators for all commands
- [ ] 2.11 Add response DTOs for trials, profiles, conditions, doctors
- [ ] 2.12 Create `TrialsController` with endpoints: GET /api/trials, GET /api/trials/{id}
- [ ] 2.13 Create `ProfileController` with endpoints: GET/POST/PUT /api/profile
- [ ] 2.14 Create `ConditionsController` with endpoints: GET /api/conditions, GET /api/conditions/search?q=
- [ ] 2.15 Create `DoctorsController` with endpoint: GET /api/doctors/search?q=
- [ ] 2.16 Register all new services in DI

**Covers**: R3 (backend), R4 (backend), R7.1, R7.2

---

## Phase 3: Backend Use Cases — Requests & Contact
**Goal**: Implement participation requests, doctor approval workflow, and contact form

### Tasks
- [ ] 3.1 Create `SubmitTrialRequestCommand` (patient submits request, optionally linked to a doctor)
- [ ] 3.2 Create `GetPatientRequestsQuery` (patient's own requests with status)
- [ ] 3.3 Create `GetDoctorRequestsQuery` (all requests sent to a doctor, filterable by status)
- [ ] 3.4 Create `GetRequestByIdQuery` (full request detail with patient + trial info)
- [ ] 3.5 Create `ApproveRequestCommand` (doctor approves, optional note)
- [ ] 3.6 Create `DeclineRequestCommand` (doctor declines, required reason)
- [ ] 3.7 Create `SubmitContactInquiryCommand` (non-logged-in contact form submission)
- [ ] 3.8 Add request DTOs and validators
- [ ] 3.9 Add response DTOs for requests and contact inquiries
- [ ] 3.10 Create `RequestsController` with endpoints:
  - POST /api/requests (submit)
  - GET /api/requests/mine (patient's requests)
  - GET /api/requests/inbox (doctor's requests)
  - GET /api/requests/{id} (detail)
  - PUT /api/requests/{id}/approve
  - PUT /api/requests/{id}/decline
- [ ] 3.11 Create `ContactController` with endpoint: POST /api/contact
- [ ] 3.12 Register all new services in DI

**Covers**: R5, R6, R7.3–R7.8

---

## Phase 4: Backend — PDF Generation
**Goal**: Generate downloadable one-page trial summary PDF

### Tasks
- [ ] 4.1 Add PDF generation library (e.g., QuestPDF or iTextSharp)
- [ ] 4.2 Create `GenerateTrialPdfQuery` (takes trialId, returns PDF bytes)
- [ ] 4.3 PDF layout: trial title, plain-language summary, eligibility criteria, location, sponsor, contact info
- [ ] 4.4 Add endpoint to `TrialsController`: GET /api/trials/{id}/pdf
- [ ] 4.5 Test PDF output with seed data

**Covers**: R8

---

## Phase 5: Shared Contracts
**Goal**: Add TypeScript types, routes, and services for all endpoints

### Tasks
- [ ] 5.1 Add trial-related types to `shared/api-types` (Trial, Condition, PatientProfile, DoctorProfile, TrialRequest, ContactInquiry)
- [ ] 5.2 Add all endpoint routes to `shared/constants`
- [ ] 5.3 Add `trialService` to `shared/services` (getTrials, getTrialById, getConditions, searchConditions, downloadTrialPdf)
- [ ] 5.4 Add `profileService` to `shared/services` (getProfile, createProfile, updateProfile)
- [ ] 5.5 Add `doctorService` to `shared/services` (searchDoctors)
- [ ] 5.6 Add `requestService` to `shared/services` (submitRequest, getMyRequests, getDoctorInbox, getRequestById, approveRequest, declineRequest)
- [ ] 5.7 Add `contactService` to `shared/services` (submitInquiry)

**Covers**: R9

---

## Phase 6: Web — Patient Profile
**Goal**: Build the patient profile creation/edit form

### Tasks
- [ ] 6.1 Create profile page at `/profile`
- [ ] 6.2 Build profile form with React Hook Form + Zod validation
- [ ] 6.3 Condition multi-select component (fetches from /api/conditions)
- [ ] 6.4 Date of birth, gender, and city (text input) fields
- [ ] 6.5 React Query mutations for create/update profile
- [ ] 6.6 Show success/error feedback
- [ ] 6.7 Add profile link to navigation/layout

**Covers**: R3 (frontend)

---

## Phase 7: Web — Trial Browsing & Detail
**Goal**: Build trial listing and detail pages with role-aware actions

### Tasks
- [ ] 7.1 Create trials listing page at `/trials`
- [ ] 7.2 Trial card component showing title, phase, status, conditions, location, age range
- [ ] 7.3 Filter bar: condition dropdown, phase selector, status toggle
- [ ] 7.4 Smart keyword search input with condition autocomplete
- [ ] 7.5 Pagination controls
- [ ] 7.6 Create trial detail page at `/trials/:id`
- [ ] 7.7 Detail page shows: plain-language summary, eligibility criteria ("You may qualify if..."), location text, phase, sponsor, status
- [ ] 7.8 Action buttons (logged-in patient): "Apply to This Trial", "Send to My Doctor", "Download PDF"
- [ ] 7.9 Action buttons (not logged in): "Interested? Contact Us" → contact form modal
- [ ] 7.10 Contact form modal: name, email, condition (free text), submit → POST /api/contact
- [ ] 7.11 "Download PDF" button → fetches /api/trials/{id}/pdf and triggers browser download
- [ ] 7.12 Add trials link to navigation

**Covers**: R4 (frontend), R6 (frontend), R8 (frontend)

---

## Phase 8: Web — Requests & Send to Doctor
**Goal**: Build request submission, doctor search, and patient request tracking

### Tasks
- [ ] 8.1 "Apply to This Trial" button → request form modal (preferred site, notes) → POST /api/requests (no doctorId)
- [ ] 8.2 "Send to My Doctor" button → doctor search modal (search by name/clinic) → select doctor → POST /api/requests (with doctorId)
- [ ] 8.3 Create "My Requests" page at `/requests` for patients
- [ ] 8.4 Request list with status badges (Pending / Approved / Declined)
- [ ] 8.5 Click request → expanded detail showing trial info, status, doctor notes/decline reason
- [ ] 8.6 Add "My Requests" link to patient navigation

**Covers**: R5 (frontend)

---

## Phase 9: Web — Doctor Views
**Goal**: Build doctor request inbox with approve/decline workflow

### Tasks
- [ ] 9.1 Add doctor role guard / route protection
- [ ] 9.2 Create doctor request inbox at `/doctor/requests`
- [ ] 9.3 Tabbed view: Pending (default), Approved, Declined, All
- [ ] 9.4 Request list showing: patient name, trial name, condition, date submitted
- [ ] 9.5 Click request → full detail: patient info, trial info, patient notes, eligibility summary
- [ ] 9.6 "Approve" button with optional note field
- [ ] 9.7 "Decline" button with required reason field
- [ ] 9.8 Status update reflects immediately in the list
- [ ] 9.9 Add doctor navigation (inbox link with pending count badge)

**Covers**: R7 (frontend)

---

## Phase 10: Polish & Demo Prep
**Goal**: Final integration, visual polish, demo readiness

### Tasks
- [ ] 10.1 End-to-end flow test: register → profile → browse → trial detail → apply → doctor approves
- [ ] 10.2 End-to-end flow test: visitor → browse → contact form
- [ ] 10.3 End-to-end flow test: patient → send to doctor → doctor approves/declines
- [ ] 10.4 Navigation refinement (role-aware nav, active states)
- [ ] 10.5 Loading states and skeleton screens
- [ ] 10.6 Error handling for API failures
- [ ] 10.7 Responsive layout check
- [ ] 10.8 Demo seed data validation (realistic and diverse)
- [ ] 10.9 PDF output review
