# TrialMatch — User Journeys & Application Flows

**Core Functionalities | Hackathon MVP | Final Version**

March 2026

*Three user types: Visitor, Patient, Doctor | React + C# Stack | 36-Hour Build*

---

## Table of Contents

1. User Roles Overview
2. Visitor Journeys (Not Logged In)
   - 2.1 Browse & Search Trials
   - 2.2 View Trial Details
   - 2.3 Contact Form (Lead Capture)
3. Patient Journeys (Logged In)
   - 3.1 Create / Edit Patient Profile
   - 3.2 Submit Participation Request (Direct)
   - 3.3 Send Trial to Doctor
   - 3.4 Download Trial PDF
   - 3.5 Track Request Status
4. Doctor Journeys (Logged In)
   - 4.1 Doctor Registration & Profile
   - 4.2 Request Inbox & Approval Workflow
5. Screen Inventory
6. Hackathon Build Plan

---

## 1. User Roles Overview

| Role | Primary Goal | Core Actions |
|------|-------------|--------------|
| **Visitor** | Discover clinical trials and express interest without creating an account | Browse/search trials · View trial details · Submit contact form (lead capture) |
| **Patient** | Find relevant trials, apply directly or send to a doctor, and track request outcomes | All visitor actions, plus: Create/edit patient profile · Submit participation request · Send trial to a doctor · Download trial PDF · Track request status |
| **Doctor** | Review and act on patient trial requests | View request inbox · Review request details · Approve or decline requests |

---

## 2. Visitor Journeys (Not Logged In)

### 2.1 Browse & Search Trials

Any visitor can browse and search trials without an account.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Home / Trials | Visitor opens TrialMatch | Display list of all open trials as cards showing: title, condition(s), location (text), phase, status badge |
| 2 | Home / Trials | Visitor uses the search bar with keyword input | Smart keyword search with condition autocomplete. As user types, matching condition names appear as suggestions. Results filter in real time. |
| 3 | Home / Trials | Visitor applies filters: condition dropdown, phase selector, status toggle | Trial list updates; result count shown |
| 4 | Home / Trials | Visitor clicks a trial card | Navigate to Trial Detail page (see 2.2) |

*Preconditions: None. Public access, no login required.*

### 2.2 View Trial Details

Visitor views full trial information including plain-language eligibility criteria.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Trial Detail | Visitor arrives from trial list | Display: plain-language title, summary, eligibility criteria ("You may qualify if..."), phase, sponsor, location (text, e.g., "Sofia"), status, start/end dates |
| 2 | Trial Detail | Visitor sees action buttons | Not logged in: show "Interested? Contact Us" button and a prompt to register for full features |
| 3 | Trial Detail | Visitor clicks "Interested? Contact Us" | Open contact form modal (see 2.3) |

*Preconditions: None. Trial detail is publicly accessible.*

### 2.3 Contact Form (Lead Capture)

A non-logged-in visitor expresses interest in a trial by filling out a simple contact form. This is a lead capture — no account, no status tracking.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Contact Modal | Visitor clicks "Interested? Contact Us" on a trial detail page | Modal opens with form: Name, Email, Condition (free text input), and the trial name pre-filled (read-only) |
| 2 | Contact Modal | Visitor fills in name, email, and describes their condition | Basic validation: name required, email format check, condition text required |
| 3 | Contact Modal | Visitor clicks Submit | Form submits to POST /api/contact. Stored as ContactInquiry in database. |
| 4 | Confirmation | System confirms submission | Success message: "Thank you for your interest. A trial coordinator will review your inquiry." Modal closes. No further tracking available to the visitor. |

*Preconditions: None. Postconditions: ContactInquiry record created. No status tracking for the visitor.*

---

## 3. Patient Journeys (Logged In)

### 3.1 Create / Edit Patient Profile

The patient creates a profile so the system knows their conditions, age, and location. Required before submitting participation requests.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Profile Page | Patient navigates to "/profile" (or is prompted when trying to submit a request without a profile) | If no profile exists: show empty form. If profile exists: show pre-filled form for editing. |
| 2 | Profile Form | Patient fills in: date of birth, gender, city (text), medical notes (optional) | Form validates with Zod: DOB required, gender required, city required |
| 3 | Profile Form | Patient selects conditions from multi-select dropdown (fetched from /api/conditions) | Condition catalog loaded. Patient can select multiple conditions (e.g., Type 2 Diabetes, Hypertension). |
| 4 | Profile Form | Patient clicks Save | Profile created/updated via API. Success toast shown. Patient can now submit requests. |

*Preconditions: Patient logged in. Postconditions: PatientProfile created/updated. Profile is required before submitting trial requests.*

### 3.2 Submit Participation Request (Direct)

The patient applies directly to a trial without involving a doctor. The request is stored with Pending status.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Trial Detail | Patient clicks "Apply to This Trial" button | If no profile exists: redirect to /profile with message "Please complete your profile first." If profile exists: open request form modal. |
| 2 | Request Modal | Patient fills in: optional notes ("I was diagnosed 2 years ago"), preferred site (if trial has multiple locations) | Form pre-fills patient name and condition from profile. Shows trial name (read-only). Disclaimer shown: "TrialMatch does not provide medical advice." |
| 3 | Request Modal | Patient clicks Submit | Request created via POST /api/requests (no doctorId). Status set to Pending. Confirmation: "Your request has been submitted." |

*Preconditions: Patient logged in, profile complete. Postconditions: TrialRequest created with status=Pending, doctorId=null.*

### 3.3 Send Trial to Doctor

The patient sends a trial to a registered doctor for review. The doctor receives the request in their inbox and can approve or decline.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Trial Detail | Patient clicks "Send to My Doctor" button | If no profile exists: redirect to /profile. If profile exists: open doctor search modal. |
| 2 | Doctor Search | Patient types a doctor's name or clinic name in the search field | Live search against GET /api/doctors/search?q=. Results show: doctor name, clinic name, specialization, city. |
| 3 | Doctor Search | Patient selects a doctor from the results | Selected doctor highlighted. Optional notes field appears ("Any additional context for your doctor"). |
| 4 | Doctor Search | Patient clicks Send | Request created via POST /api/requests (with doctorId). Status set to Pending. Confirmation: "Trial details have been sent to Dr. [Name]. You can track the status in My Requests." |

*Preconditions: Patient logged in, profile complete, doctor must be registered on TrialMatch. Postconditions: TrialRequest created with status=Pending, doctorId set. Request appears in doctor's inbox.*

### 3.4 Download Trial PDF

The patient downloads a one-page PDF summary of a trial to bring to an in-person GP appointment.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Trial Detail | Patient clicks "Download PDF" button | Browser fetches GET /api/trials/{id}/pdf. Server generates a one-page PDF. |
| 2 | Browser | PDF downloads automatically | PDF contains: trial title, plain-language summary, eligibility criteria, location, sponsor, contact information. Professional layout suitable for printing. |

*Preconditions: Patient logged in. Postconditions: PDF file downloaded to patient's device.*

### 3.5 Track Request Status

The patient views all their submitted requests and their current status.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | My Requests | Patient navigates to "/requests" | Display list of all submitted requests |
| 2 | My Requests | Patient views request list | Each request shows: trial name, date submitted, status badge (Pending / Approved / Declined), doctor name (if sent to doctor, otherwise "Direct Request") |
| 3 | My Requests | Patient clicks a request | Expanded detail: full trial info, current status, doctor's note (if approved) or decline reason (if declined) |

*Preconditions: Patient logged in with at least one submitted request.*

---

## 4. Doctor Journeys (Logged In)

### 4.1 Doctor Registration & Profile

Doctors register on TrialMatch with a doctor role and create a profile that patients can search for.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Register | Doctor registers and selects "Doctor" role | Account created with doctor role. Redirect to doctor profile setup. |
| 2 | Doctor Profile | Doctor fills in: clinic name, specialization, city | Profile saved. Doctor is now searchable by patients. |

*Preconditions: None. Postconditions: Doctor account created, DoctorProfile saved, doctor is searchable by patients. Note: For demo, 2–3 doctor accounts are pre-seeded.*

### 4.2 Request Inbox & Approval Workflow

The doctor's primary screen. Shows all patient requests sent to them, with the ability to approve or decline.

| Step | Screen | User Action | System Response |
|------|--------|-------------|-----------------|
| 1 | Doctor Inbox | Doctor logs in | Redirect to /doctor/requests. Display tabbed view: Pending (default, highlighted if count > 0), Approved, Declined, All. |
| 2 | Doctor Inbox | Doctor views Pending tab | List of pending requests showing: patient name, trial name, condition, date submitted. Sorted newest first. |
| 3 | Request Detail | Doctor clicks a pending request | Full detail view: patient demographics (from profile), patient conditions, medical notes, trial details (summary, eligibility, location), patient's notes. |
| 4a | Request Detail | Doctor clicks "Approve" | Optional note field (e.g., "I recommend proceeding with this trial"). Status changes to Approved. Patient sees updated status on their My Requests page. |
| 4b | Request Detail | Doctor clicks "Decline" | Required reason field (e.g., "Your current medication conflicts with the trial protocol"). Status changes to Declined. Patient sees decline reason on their My Requests page. |
| 5 | Doctor Inbox | Doctor returns to inbox | Pending count decremented. Processed request moves to Approved or Declined tab. |

*Preconditions: Doctor logged in. Requests exist from patients. Status flow: Pending → Approved / Declined.*

---

## 5. Screen Inventory

| Role | Screen | Key Components | Roadmap Phase |
|------|--------|---------------|---------------|
| Public | Home / Trial List | Trial cards, filters, keyword search with autocomplete, pagination | Phase 7 |
| Public | Trial Detail | Summary, eligibility, location text, role-aware action buttons | Phase 7 |
| Public | Register | Email, password, role selector (Patient/Doctor) | Existing + extend |
| Public | Login | Email, password | Existing |
| Patient | Profile (/profile) | DOB, gender, city, condition multi-select, save button | Phase 6 |
| Patient | Request Modal | Notes, preferred site, submit button | Phase 8 |
| Patient | Doctor Search Modal | Search input, doctor result cards, select + send | Phase 8 |
| Patient | Contact Form Modal | Name, email, condition text, trial pre-filled | Phase 7 |
| Patient | My Requests (/requests) | Request list with status badges, click to expand | Phase 8 |
| Doctor | Doctor Profile Setup | Clinic name, specialization, city | Phase 6 |
| Doctor | Request Inbox (/doctor/requests) | Tabbed list: Pending/Approved/Declined/All | Phase 9 |
| Doctor | Request Detail | Patient + trial info, approve/decline buttons | Phase 9 |

**Total: 12 screens (4 public, 5 patient, 3 doctor). Includes 3 modals (request, doctor search, contact form).**

---

## 6. Hackathon Build Plan

Aligned with ROADMAP.md phases. The demo story: a patient finds a trial, sends it to a doctor, and the doctor approves it.

### Phases 1–4: Backend (~16 hours)

1. Phase 1: Domain entities, DB schema, seed data (trials, conditions, doctor accounts)
2. Phase 2: API endpoints for trials, profiles, conditions, doctor search
3. Phase 3: Request submission, doctor inbox, approve/decline, contact form
4. Phase 4: PDF generation for trial summaries

### Phase 5: Shared Contracts (~2 hours)

1. TypeScript types, route constants, and service wrappers for all new endpoints

### Phases 6–9: Frontend (~14 hours)

1. Phase 6: Patient profile form + doctor profile setup
2. Phase 7: Trial list (search + filters), trial detail page, contact form modal
3. Phase 8: Request submission, doctor search modal, My Requests page
4. Phase 9: Doctor inbox with tabs, request detail with approve/decline

### Phase 10: Polish & Demo Prep (~4 hours)

1. End-to-end testing of all three flows (visitor, patient, doctor)
2. Loading states, error handling, responsive check
3. Demo seed data validation
4. Rehearse demo: search → trial detail → send to doctor → doctor approves

---

*This document is aligned with PROJECT.md, REQUIREMENTS.md, ROADMAP.md, and STATE.md as of March 2026. All features described here have corresponding requirements and roadmap tasks.*
