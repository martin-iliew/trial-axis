# TrialMatch UI Mocks — Design Spec

**Date**: 2026-03-28
**Scope**: All 14 screens, layout + components
**Style**: Modern startup (card-based, bold typography, vibrant accents)
**Stack**: Next.js 15, Tailwind CSS v4, shadcn/ui

---

## Design System

### Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary surface / text | `#0F172A` deep navy | Navbar, headings, body text |
| Brand accent | `#6366F1` electric indigo | Buttons, active states, links |
| Background | `#F8FAFC` cool white | Page background |
| Secondary text | Slate grays | Metadata, labels, muted copy |
| Success | Green | Accepted status, high match score |
| Warning | Amber | Pending status, mid match score |
| Error | Red | Declined status, low match score, errors |

### Typography
- **Font**: Inter or Geist (single sans-serif)
- `text-4xl font-bold` — page heroes
- `text-xl font-semibold` — section headings
- `text-sm` — labels, metadata

### Layout
- Full-width top navbar, sticky on scroll
- Content max-width `1280px`, centered
- `24px` page padding
- Cards: white background, `p-6`, `rounded-2xl`, subtle shadow, hover shadow lift

### Status Badges
Pill-shaped, color-coded:
| Status | Color |
|--------|-------|
| Draft | Slate |
| Searching | Indigo |
| Pending | Amber |
| Accepted | Green |
| Declined | Red |

### Buttons
- **Primary**: filled indigo, `rounded-lg`
- **Secondary**: outlined, `rounded-lg`
- **Destructive**: red, `rounded-lg`

### Navbar
Logo left · Role-aware nav links center/right · CTA button right ("Get in Touch" or "Sign Out")

---

## Public Screens

### Screen 1 — Landing Page
**Route**: `/`

**Layout**: Full-width sections stacked vertically.

| Section | Description |
|---------|-------------|
| Hero | Centered. Large headline: "Match the right clinics to your clinical trial — in minutes." Subheadline with EUR 8M/day stat. Two CTA buttons side by side: "Join as Sponsor" (filled indigo) + "Register Your Clinic" (outlined). |
| How It Works | 3-step horizontal strip. Each step: icon + number + short description. Steps: "Define Requirements → Run Matching → Contact Clinics". |
| Stats Bar | 3 metrics in a row: "EUR 8M/day in enrollment delays", "19–25% of EU trial slots go unfilled", "Site selection adds weeks to timelines". |
| Footer | Logo, tagline, "Get in Touch" link. |

**Components**: `Button` (2 variants), `StepCard` (icon + number + label), `StatBlock` (number + description), `Footer`

---

### Screen 2 — Public Clinic Browse
**Route**: `/clinics`

**Layout**: Full-width page with navbar. 3-column responsive grid below header.

| Section | Description |
|---------|-------------|
| Page Header | "Registered Clinics" heading. Subtext: "Browse our network of research sites." |
| Clinic Grid | 3-column responsive grid of `ClinicCard` components. |
| ClinicCard | Clinic name (bold), city + country (muted), top 3 specialization pills. Click opens `LimitedProfileModal`. |
| LimitedProfileModal | Shows name, city, address, specializations only. Equipment and availability are hidden (requires login). |
| Navbar | "Get in Touch" link visible to all users. |

**Components**: `ClinicCard`, `SpecializationPill`, `PageHeader`, `LimitedProfileModal`

---

### Screen 3 — Contact Form
**Route**: `/contact`

**Layout**: Centered single-column form, max-width `480px`, vertically centered on page.

| Section | Description |
|---------|-------------|
| Heading | "Get in Touch". Subtext: "Interested in joining as a clinic or sponsor? Tell us about yourself." |
| Form | Name (text input), Email (email input), Organization Type (radio or segmented: Clinic / Sponsor / Other), Message (textarea, 4 rows). |
| Submit | Full-width "Send Message" button. |
| Success State | Replaces form with checkmark icon + "Thank you — we'll be in touch." |

**Components**: `Input`, `Textarea`, `RadioGroup` or `SegmentedControl`, `Button`, `SuccessState`

---

## Auth Screens

### Screen 4 — Register
**Route**: `/register`

**Layout**: Centered card, max-width `480px`, vertically centered on page.

| Section | Description |
|---------|-------------|
| Header | TrialMatch logo. "Create your account" heading. "Already have an account? Sign in" link. |
| Role Picker | Two large toggle cards side by side: "Sponsor / CRO" (briefcase icon, "Find clinics for your trial") and "Clinic Admin" (hospital icon, "Register your research site"). Selected card: indigo border + background tint. |
| Form | First name, Last name, Email, Password (with show/hide toggle). |
| Submit | Full-width "Create Account" button. |
| Footer | Terms/privacy note in small muted text. |

**Components**: `RolePickerCard` (×2), `Input`, `PasswordInput`, `Button`

---

### Screen 5 — Login
**Route**: `/login`

**Layout**: Centered card, max-width `480px`, vertically centered on page.

| Section | Description |
|---------|-------------|
| Header | "Welcome back" heading. "Don't have an account? Sign up" link. |
| Form | Email (email input), Password (with show/hide toggle). |
| Submit | Full-width "Sign In" button. |
| Error State | Inline `AlertBanner` below form: "Invalid email or password." (red). |

**Components**: `Input`, `PasswordInput`, `Button`, `AlertBanner` (error variant)

---

## Sponsor Screens

### Screen 6 — My Projects
**Route**: `/sponsor/projects`

**Layout**: Full-width page with navbar. Content max-width centered.

| Section | Description |
|---------|-------------|
| Page Header | "My Trial Projects" heading. "New Trial Project" button (filled indigo, top right). |
| Project List | Vertical stack of `ProjectCard` components. |
| ProjectCard | Title (bold), therapeutic area pill, phase badge (Phase 1–4), status badge (Draft / Searching), required patient count + geographic preference as muted metadata row, "View" chevron right. |
| Empty State | Centered illustration placeholder + "No projects yet. Create your first trial project." |

**Components**: `ProjectCard`, `StatusBadge`, `Button`, `EmptyState`

---

### Screen 7 — Project Detail
**Route**: `/sponsor/projects/:id`

**Layout**: Two-column on desktop (2/3 + 1/3), single-column on mobile.

**Left column:**

| Section | Description |
|---------|-------------|
| Project Header | Title, status badge, therapeutic area pill, Edit button (shown only for Draft status). |
| Project Metadata | Phase, patient count, timeline (start–end dates), geographic preference. Displayed as `MetadataGrid` (label + value pairs). |
| Requirements | "Requirements" heading + "Add Requirement" button. List of `RequirementRow`: type badge (Equipment / Certification / Specialization / Capacity), value text, priority badge (Required / Preferred / Nice to Have). |

**Right column:**

| Section | Description |
|---------|-------------|
| Match Status Card | "Find Matching Clinics" button (primary, full-width). If previously run: "Last run [date]" + "View Results" link. |
| Inquiry Status | "Outreach" heading. List of `InquiryStatusRow`: clinic name, sent date, status badge. Accepted: green badge + acceptance message below. Declined: red badge + decline reason below. |

**Components**: `MetadataGrid`, `RequirementRow`, `PriorityBadge`, `InquiryStatusRow`, `StatusBadge`, `Button`

---

### Screen 8 — Match Results
**Route**: `/sponsor/projects/:id/matches`

**Layout**: Full-width page. Back link to project detail at top.

| Section | Description |
|---------|-------------|
| Page Header | "Match Results for [Trial Name]". Muted subtitle: "X clinics matched · Ranked by compatibility score". |
| Results List | Vertical stack of `MatchResultCard` components, ordered by score descending. |
| MatchResultCard | Overall score as large number, color-coded (green ≥70, amber 40–69, red <40) with circular/pill indicator. Clinic name + city. 5 score breakdown bars labeled: Therapeutic Area, Equipment, Certifications, Capacity, Geography. "Send Inquiry" button (or status badge if already contacted). Clicking card body opens `ClinicProfileModal`. |
| Zero-Results Empty State | "No clinics currently meet your required criteria." + "Edit Requirements" link. |

**Components**: `MatchResultCard`, `ScoreIndicator`, `ScoreBreakdownBar` (×5), `StatusBadge`, `Button`, `EmptyState`

---

### Screen 9 — Clinic Profile Modal
**Route**: Overlay on `/sponsor/projects/:id/matches`

**Layout**: Sheet or centered modal, max-width `640px`, scrollable.

| Section | Description |
|---------|-------------|
| Modal Header | Clinic name, city, close button (×). |
| Profile | Description, contact email, phone, website as metadata rows. |
| Specializations | Pill list of therapeutic areas. |
| Equipment | Table or list: equipment type, name, quantity, availability badge (Available / Unavailable). |
| Certifications | List: certification name, issued by, valid until. |
| Availability | Available from/to dates, max concurrent trials, current trial count. |
| Modal Footer | "Send Inquiry" button or status badge. |

**Components**: `Modal` / `Sheet`, `MetadataRow`, `SpecializationPill`, `EquipmentTable`, `CertificationRow`, `AvailabilityBlock`, `Button`

---

### Screen 10 — Send Inquiry Form
**Route**: Modal or slide-over on `/sponsor/projects/:id/matches`

**Layout**: Modal or slide-over, max-width `560px`.

| Section | Description |
|---------|-------------|
| Header | "Send Inquiry to [Clinic Name]", close button. |
| Read-Only Pre-fills | Trial name, proposed timeline (start–end), required patient count. Displayed as locked `MetadataRow` items (no input styling). |
| Editable Fields | Message (textarea, required, 5 rows), Notes (textarea, optional, 3 rows). |
| Footer Actions | "Cancel" (outlined) + "Send Inquiry" (filled indigo). |
| Post-Send | Modal closes. Toast bottom-right: "Inquiry sent to [Clinic Name]." |

**Components**: `Modal`, `MetadataRow` (read-only), `Textarea`, `Button`, `Toast`

---

## Clinic Admin Screens

### Screen 11 — Clinic Profile
**Route**: `/clinic/profile` (Profile tab)

**Layout**: Full-width page with navbar. Tabbed layout below header.

| Section | Description |
|---------|-------------|
| Page Header | "Clinic Profile" heading. Profile completion indicator: horizontal progress bar + percentage + hint "Add equipment and certifications to improve your match score." |
| Tabs | "Profile", "Equipment", "Certifications & Availability". Active tab underlined in indigo. |
| Profile Form | Clinic Name, City, Address, Description (textarea), Contact Email, Contact Phone, Website. "Save Profile" button at bottom. |
| Specializations | Multi-select below form fields. Pill-style chips for selected areas, searchable dropdown to add more. At least one required (inline validation error on save if empty). |

**Components**: `ProgressBar`, `Tabs`, `Input`, `Textarea`, `MultiSelect`, `SpecializationPill`, `Button`

---

### Screen 12 — Equipment Tab
**Route**: `/clinic/profile` (Equipment tab)

**Layout**: Same tabbed page as Screen 11, Equipment tab active.

| Section | Description |
|---------|-------------|
| Section Header | "Equipment Inventory" heading. "Add Equipment" button (top right). |
| Equipment List | Table or card list. Each row: equipment type (muted label), name (bold), quantity, availability `Switch` (green = available), delete icon (trash) right-aligned with confirmation prompt on click. |
| Add Equipment Form | Appears above list on "Add Equipment" click. Fields: equipment type (text), name (text), quantity (number), availability toggle. "Save" + "Cancel" buttons. |
| Empty State | "No equipment added yet." centered placeholder. |

**Components**: `Table` or `EquipmentRow`, `Switch`, `IconButton` (delete), `InlineForm`, `EmptyState`

---

### Screen 13 — Certifications & Availability Tab
**Route**: `/clinic/profile` (Certifications & Availability tab)

**Layout**: Same tabbed page. Two sub-sections stacked vertically.

**Certifications sub-section:**

| Section | Description |
|---------|-------------|
| Header | "Certifications" heading. "Add Certification" button. |
| Certification List | Rows: certification name (bold), issued by (muted), valid until date. Delete icon right-aligned. |
| Add Certification Form | Inline: certification name (text), issued by (text), valid until (date picker). "Save" + "Cancel". |

**Availability sub-section:**

| Section | Description |
|---------|-------------|
| Header | "Availability Window" heading. |
| Availability Form | Available From (date picker), Available To (date picker), Max Concurrent Trials (number input), Current Trial Count (number input). "Save Availability" button. |

**Components**: `CertificationRow`, `DatePicker`, `NumberInput`, `InlineForm`, `IconButton` (delete), `Button`

---

### Screen 14 — Inquiry Inbox
**Route**: `/clinic/inquiries`

**Layout**: Two-panel on desktop (list 1/3 left, detail 2/3 right). Single-column on mobile (list → detail navigation).

**Left panel — Inquiry list:**

| Section | Description |
|---------|-------------|
| Header | "Inquiries" heading + count badge. |
| InquiryListItem | Sponsor name, trial name (muted), sent date, status badge (Pending / Accepted / Declined). Active item: indigo left border highlight. |

**Right panel — Inquiry detail:**

| Section | Description |
|---------|-------------|
| Trial Info | Trial title, therapeutic area pill, phase, proposed timeline, required patient count as `MetadataGrid`. |
| Sponsor Message | "Message from [Sponsor Name]" label. Message body in lightly tinted block. Notes field below (if present). |
| Requirements | Collapsible section: trial requirements list (type, value, priority badge). |
| Action Footer (Pending) | "Accept" (green filled) + "Decline" (red outlined). Accept: optional message textarea inline + Confirm/Cancel. Decline: required reason textarea inline + Confirm/Cancel. |
| Responded State | Accepted: green `AlertBanner` "You accepted this inquiry" + acceptance message. Declined: red `AlertBanner` "You declined this inquiry" + reason. |

**Components**: `InquiryListItem`, `StatusBadge`, `MetadataGrid`, `MessageBlock`, `RequirementRow`, `Button`, `Textarea`, `AlertBanner`

---

## Screen Inventory Summary

| # | Role | Screen | Route |
|---|------|--------|-------|
| 1 | Public | Landing Page | `/` |
| 2 | Public | Clinic Browse | `/clinics` |
| 3 | Public | Contact Form | `/contact` |
| 4 | Auth | Register | `/register` |
| 5 | Auth | Login | `/login` |
| 6 | Sponsor | My Projects | `/sponsor/projects` |
| 7 | Sponsor | Project Detail | `/sponsor/projects/:id` |
| 8 | Sponsor | Match Results | `/sponsor/projects/:id/matches` |
| 9 | Sponsor | Clinic Profile Modal | *(overlay on match results)* |
| 10 | Sponsor | Send Inquiry Form | *(modal on match results)* |
| 11 | Clinic | Clinic Profile (Profile tab) | `/clinic/profile` |
| 12 | Clinic | Equipment Tab | `/clinic/profile` |
| 13 | Clinic | Certifications & Availability Tab | `/clinic/profile` |
| 14 | Clinic | Inquiry Inbox | `/clinic/inquiries` |

**Total: 14 screens (3 public, 2 auth, 5 sponsor, 4 clinic). Includes 2 modals (Screens 9 and 10).**
