# TrialMatch MVP Requirements

## R1: Domain Model
- **R1.1** Define `ClinicalTrial` entity with: title, plainLanguageSummary, description, phase, status, conditions targeted, eligibility criteria (age range, gender), sponsor, location (text, e.g., "Sofia", "Berlin"), start/end dates
- **R1.2** Define `PatientProfile` entity linked to `User`: conditions, date of birth, gender, location (city text), medical history notes
- **R1.3** Define `Condition` entity (medical condition catalog) used by both trials and patient profiles
- **R1.4** Define `TrialRequest` entity linking a patient to a trial: status (Pending/Approved/Declined), doctorId (nullable -- null for direct requests), doctorNote, declineReason, createdAt
- **R1.5** Define `ContactInquiry` entity for non-logged-in users: name, email, condition (free text), trialId, createdAt
- **R1.6** Define `DoctorProfile` entity linked to `User` (doctor role): clinicName, specialization, city

## R2: Trial Data & Seeding
- **R2.1** Seed database with 15-20 realistic clinical trials across various conditions (diabetes, hypertension, asthma, oncology, cardiology, etc.)
- **R2.2** Seed a condition catalog (simplified list)
- **R2.3** Trials must have varied eligibility criteria to demonstrate meaningful matching
- **R2.4** Each trial must have a plain-language summary and "You may qualify if..." eligibility text (pre-written in seed data)
- **R2.5** Seed 2-3 doctor accounts for demo purposes

## R3: Patient Profile
- **R3.1** Authenticated user can create/update their patient profile
- **R3.2** Profile form captures: conditions (multi-select from catalog), date of birth, gender, location (city text)
- **R3.3** Profile data persists and is editable
- **R3.4** Backend validates profile completeness before allowing requests

## R4: Trial Browsing & Search
- **R4.1** List all active clinical trials with pagination
- **R4.2** Filter trials by condition, phase, and status
- **R4.3** Smart keyword search with condition autocomplete (search by title, description, condition names)
- **R4.4** View full trial details on a dedicated page: plain-language summary, eligibility criteria, location (text), phase, sponsor, status
- **R4.5** Trial detail page shows action buttons based on auth state:
  - Logged in (patient): "Apply to This Trial" + "Send to My Doctor" + "Download PDF"
  - Not logged in: "Interested? Contact Us" (contact form)

## R5: Participation Requests (Logged-in Patients)
- **R5.1** Patient can submit a participation request for a trial (direct request -- no doctor involved)
- **R5.2** Patient can send a trial to a doctor: search for registered doctors by name/clinic, select one, submit request linked to that doctor
- **R5.3** Request captures: patient profile snapshot, trial reference, preferred site (if multiple), optional notes
- **R5.4** Request status flow: Pending → Approved / Declined
- **R5.5** Patient can view all their submitted requests with status badges on a "My Requests" page

## R6: Contact Form (Non-logged-in Visitors)
- **R6.1** Visitors can fill out a contact form on the trial detail page
- **R6.2** Form captures: name, email, condition (free text), trial reference
- **R6.3** Submission is stored as a `ContactInquiry` -- no status tracking, no login required
- **R6.4** Show confirmation message after submission

## R7: Doctor Role
- **R7.1** Doctors register with doctor role and create a doctor profile (clinic name, specialization, city)
- **R7.2** Doctor profile is searchable by patients when sending a trial to a doctor
- **R7.3** Doctor has a request inbox showing all requests sent to them
- **R7.4** Request inbox has tabs: Pending, Approved, Declined, All
- **R7.5** Doctor can view full request details: patient info, trial info, patient notes
- **R7.6** Doctor can approve a request (with optional note to patient)
- **R7.7** Doctor can decline a request (with required reason)
- **R7.8** Patient is notified of status change (visible on their "My Requests" page)

## R8: Send to GP / PDF Generation
- **R8.1** "Send to My Doctor" button on trial detail page opens doctor search + sends request to selected doctor
- **R8.2** "Download PDF" button generates a one-page trial summary PDF: trial title, plain-language summary, eligibility criteria, location, sponsor, PI contact info
- **R8.3** PDF is downloadable by the patient to bring to an in-person appointment

## R9: Shared Contracts
- **R9.1** Add trial-related API types to `shared/api-types` (Trial, Condition, PatientProfile, TrialRequest, ContactInquiry, DoctorProfile)
- **R9.2** Add all endpoint routes to `shared/constants`
- **R9.3** Add service wrappers to `shared/services` for all new endpoints
