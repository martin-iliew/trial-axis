# TrialMatch

## Vision
A patient-to-clinical-trial matching platform that helps patients and doctors discover relevant clinical trials based on medical conditions, demographics, and eligibility criteria. Doctors can review and approve/decline patient trial requests.

## Context
- **Event**: AUBG Hackathon 2026
- **Scope**: MVP demo -- core flow only, enough to demonstrate the concept end-to-end
- **Platforms**: Web (React 19 + Vite) + Backend (ASP.NET Core 8)
- **Existing foundation**: Auth system (JWT login, register, refresh, logout, user lookup) is fully built across backend, web, shared, and mobile

## What Already Exists
- ASP.NET Core 8 backend with Clean Architecture (Domain, Application, Infrastructure, API layers)
- MediatR + FluentValidation pipeline
- EF Core + SQL Server persistence
- JWT auth with rotating refresh tokens
- React 19 web app with Tailwind CSS, shadcn/ui, React Query, React Hook Form, Zod
- Shared TypeScript contracts layer
- Mobile app (Expo) -- out of scope for MVP

## MVP Demo Goal

### Patient (logged in) can:
1. Log in (existing)
2. Fill out a patient profile (conditions, age, location)
3. Browse available clinical trials with filters and keyword search
4. View trial details (plain-language summary, eligibility, location text)
5. Submit a participation request for a trial
6. Track request status (Pending / Approved / Declined)
7. Send a trial to a doctor ("Send to My GP") -- search for a doctor by name/clinic, generates a referral that appears in the doctor's request queue
8. Download a one-page PDF summary of a trial to bring to a GP appointment

### Visitor (not logged in) can:
1. Browse and search clinical trials
2. View trial details
3. Fill out a contact form (name, email, condition) to express interest in a trial -- lead capture, no status tracking

### Doctor (logged in) can:
1. Log in (existing auth, doctor role)
2. View a request inbox with all patient requests sent to them
3. Review request details (patient info + trial info)
4. Approve or decline requests (with required reason for decline)

## Key Constraints
- Hackathon timeline -- speed over perfection
- Seed data for trials (no admin CRUD needed for MVP)
- No map UI or distance calculations -- trial location is displayed as text (e.g., "Sofia", "Berlin")
- No real-time messaging between patients and doctors
- No language toggle -- English only
- No match scoring dashboard -- patients browse/search and request directly
- Web + Backend only (skip mobile for MVP)
- AI search is smart keyword search with condition autocomplete (no LLM dependency)
- PDF generation for "Send to My GP" feature
