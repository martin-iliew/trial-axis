# TrialMatch MVP Roadmap

## Phase 1: Domain & Persistence
**Goal**: Rename project to TrialMatch, define all entities, DB schema, seed clinic and trial data

### Tasks
- [ ] 1.1 Rename all projects from ECommerceWebsite.* to TrialMatch.* (folders, .csproj, namespaces, solution file)
- [ ] 1.2 Update UserRole enum: remove Customer, add Sponsor and ClinicAdmin roles
- [ ] 1.3 Add FirstName and LastName to User entity
- [ ] 1.4 Create `TherapeuticArea` entity (id, name, description)
- [ ] 1.5 Create `Clinic` entity (id, userId, name, city, address, description, contactEmail, contactPhone, website)
- [ ] 1.6 Create `ClinicSpecialization` join entity linking clinics to therapeutic areas
- [ ] 1.7 Create `Equipment` entity (id, clinicId, equipmentType, name, quantity, isAvailable)
- [ ] 1.8 Create `Certification` entity (id, clinicId, certificationName, issuedBy, validUntil)
- [ ] 1.9 Create `ClinicAvailability` entity (id, clinicId, availableFrom, availableTo, maxConcurrentTrials, currentTrialCount)
- [ ] 1.10 Create `TrialProject` entity (id, sponsorUserId, title, description, therapeuticArea, phase, requiredPatientCount, startDate, endDate, geographicPreference, status)
- [ ] 1.11 Create `TrialRequirement` entity (id, trialProjectId, requirementType, description, value, priority)
- [ ] 1.12 Create `MatchResult` entity (id, trialProjectId, clinicId, overallScore, breakdown, matchedAt, status)
- [ ] 1.13 Create `PartnershipInquiry` entity (id, matchResultId, senderUserId, message, status, responseMessage, createdAt, respondedAt)
- [ ] 1.14 Create `ContactInquiry` entity (id, name, email, organizationType, message, createdAt)
- [ ] 1.15 Add repository interfaces for all new entities
- [ ] 1.16 Add EF Core configurations for all entities
- [ ] 1.17 Implement repositories in Infrastructure
- [ ] 1.18 Create and run fresh EF migration
- [ ] 1.19 Build seed data: therapeutic area catalog (~15 areas)
- [ ] 1.20 Build seed data: 10-15 clinics with specializations, equipment, certifications, availability
- [ ] 1.21 Build seed data: 3-5 sample trial projects with requirements
- [ ] 1.22 Build seed data: demo sponsor/CRO and clinic admin accounts
- [ ] 1.23 Update shared TypeScript contracts (roles, user types)

**Covers**: R1, R2, R9

---

## Phase 2: Backend Use Cases -- Clinic Profile
**Goal**: Implement API endpoints for clinic profile management

### Tasks
- [ ] 2.1 Create `CreateClinicProfileCommand` (validate + persist clinic)
- [ ] 2.2 Create `UpdateClinicProfileCommand`
- [ ] 2.3 Create `GetClinicProfileQuery` (current user's clinic)
- [ ] 2.4 Create `AddEquipmentCommand` / `RemoveEquipmentCommand` / `UpdateEquipmentCommand`
- [ ] 2.5 Create `AddCertificationCommand` / `RemoveCertificationCommand`
- [ ] 2.6 Create `SetClinicAvailabilityCommand`
- [ ] 2.7 Create `GetTherapeuticAreasQuery` (list all for multi-select)
- [ ] 2.8 Create `ClinicController` with endpoints
- [ ] 2.9 Add request/response DTOs and validators

**Covers**: R3

---

## Phase 3: Backend Use Cases -- Trial Projects
**Goal**: Implement API endpoints for trial project creation and management

### Tasks
- [ ] 3.1 Create `CreateTrialProjectCommand` (validate + persist)
- [ ] 3.2 Create `UpdateTrialProjectCommand`
- [ ] 3.3 Create `GetTrialProjectQuery` (single project with requirements)
- [ ] 3.4 Create `GetMyTrialProjectsQuery` (sponsor's projects list)
- [ ] 3.5 Create `AddTrialRequirementCommand` / `RemoveTrialRequirementCommand`
- [ ] 3.6 Create `TrialProjectsController` with endpoints
- [ ] 3.7 Add request/response DTOs and validators

**Covers**: R4

---

## Phase 4: Matching Algorithm
**Goal**: Implement the rule-based matching engine

### Tasks
- [ ] 4.1 Create `IMatchingService` interface in Application layer
- [ ] 4.2 Implement `MatchingService` with weighted scoring:
  - Therapeutic area match (hard filter + score)
  - Equipment availability (Required = hard filter, Preferred/NiceToHave = weighted)
  - Certification compliance (Required = hard filter)
  - Capacity and availability window overlap
  - Geographic preference (city text match)
- [ ] 4.3 Create `RunMatchingCommand` (takes trialProjectId, runs algorithm, persists results)
- [ ] 4.4 Create `GetMatchResultsQuery` (ranked results for a trial project)
- [ ] 4.5 Create `GetMatchResultDetailQuery` (single match with clinic profile and score breakdown)
- [ ] 4.6 Create `MatchingController` with endpoints
- [ ] 4.7 Add DTOs for match results with score breakdown

**Covers**: R5

---

## Phase 5: Backend Use Cases -- Partnership Inquiries & Contact
**Goal**: Implement inquiry workflow between sponsors and clinics

### Tasks
- [ ] 5.1 Create `SendPartnershipInquiryCommand` (sponsor sends to clinic from match result)
- [ ] 5.2 Create `GetClinicInquiriesQuery` (clinic's incoming inquiries)
- [ ] 5.3 Create `GetSponsorInquiriesQuery` (sponsor's outgoing inquiries for a trial)
- [ ] 5.4 Create `AcceptInquiryCommand` (clinic accepts with optional message)
- [ ] 5.5 Create `DeclineInquiryCommand` (clinic declines with reason)
- [ ] 5.6 Create `SubmitContactInquiryCommand` (visitor contact form)
- [ ] 5.7 Create `InquiriesController` and `ContactController` with endpoints
- [ ] 5.8 Add DTOs and validators

**Covers**: R6, R7

---

## Phase 6: Shared Contracts
**Goal**: Add TypeScript types, routes, and services for all endpoints

### Tasks
- [ ] 6.1 Add all entity types to `shared/api-types`
- [ ] 6.2 Add all endpoint routes to `shared/constants`
- [ ] 6.3 Add service wrappers for clinic, trial project, matching, inquiry, and contact endpoints

**Covers**: R8

---

## Phase 7: Web -- Clinic Admin Views
**Goal**: Build clinic profile management UI

### Tasks
- [ ] 7.1 Create clinic profile page at `/clinic/profile`
- [ ] 7.2 Clinic profile form (name, city, address, contact info, description)
- [ ] 7.3 Specialization multi-select (therapeutic areas)
- [ ] 7.4 Equipment inventory management (add/remove/toggle availability)
- [ ] 7.5 Certification management (add/remove)
- [ ] 7.6 Availability and capacity settings
- [ ] 7.7 Clinic inquiry inbox at `/clinic/inquiries`
- [ ] 7.8 Accept/decline inquiry workflow

**Covers**: R3 (frontend), R6 (frontend)

---

## Phase 8: Web -- Sponsor/CRO Views
**Goal**: Build trial project creation and match results UI

### Tasks
- [ ] 8.1 Create trial project form at `/projects/new`
- [ ] 8.2 Project detail page at `/projects/:id` with requirements management
- [ ] 8.3 "Find Matching Clinics" button triggers matching algorithm
- [ ] 8.4 Match results page showing ranked clinics with scores and breakdowns
- [ ] 8.5 Clinic profile preview from match results
- [ ] 8.6 "Send Inquiry" button from match results
- [ ] 8.7 My projects list at `/projects`
- [ ] 8.8 Inquiry status tracking on project page

**Covers**: R4 (frontend), R5 (frontend), R6 (frontend)

---

## Phase 9: Web -- Landing & Public Pages
**Goal**: Build landing page and visitor contact form

### Tasks
- [ ] 9.1 Landing page explaining the platform value proposition
- [ ] 9.2 Browse clinics page (limited public view)
- [ ] 9.3 Contact form for visitors interested in joining
- [ ] 9.4 Role-aware navigation (Sponsor vs ClinicAdmin vs visitor)

**Covers**: R7 (frontend)

---

## Phase 10: Polish & Demo Prep
**Goal**: Final integration, visual polish, demo readiness

### Tasks
- [ ] 10.1 E2E flow: Sponsor creates project -> adds requirements -> runs matching -> views results -> sends inquiry -> clinic accepts
- [ ] 10.2 E2E flow: Clinic admin registers -> fills profile -> adds equipment/certs -> receives and responds to inquiry
- [ ] 10.3 E2E flow: Visitor browses clinics -> submits contact form
- [ ] 10.4 Navigation refinement (role-aware nav, active states)
- [ ] 10.5 Loading states and error handling
- [ ] 10.6 Responsive layout check
- [ ] 10.7 Demo seed data validation
