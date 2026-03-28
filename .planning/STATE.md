# TrialMatch Project State

## Current Phase
Phase 1: Domain & Persistence (not started)

## Completed Phases
- (none yet -- auth foundation exists from template)

## Decisions
- MVP scope: web + backend only, skip mobile
- Two roles: Patient and Doctor (doctor has approve/decline inbox only)
- Trials are seeded with pre-written plain-language summaries, not admin-managed
- Conditions use a simplified catalog (not full ICD codes)
- No match scoring dashboard -- patients browse/search and request directly
- No real-time messaging -- doctor communicates via approve/decline notes
- No map UI or distance calculations -- trial location is text only (e.g., "Sofia", "Berlin")
- No language toggle -- English only for MVP
- AI search = smart keyword search with condition autocomplete (no LLM dependency)
- Non-logged-in visitors can submit a contact form (lead capture) but have no status tracking
- Logged-in patients can submit direct requests OR send trials to a doctor
- Doctors register on TrialMatch; patients find them by name/clinic when sending a trial
- PDF generation for trial summaries (one-page downloadable PDF)

## Blockers
- (none)

## Notes
- Auth system is fully built and working (login, register, refresh, logout, /me)
- Auth needs extension: add role field (Patient/Doctor) to registration flow
- Clean Architecture patterns established -- follow for all new features
- Shared contracts layer must be updated alongside backend changes
- Doctor role is intentionally minimal for MVP: inbox + approve/decline only
