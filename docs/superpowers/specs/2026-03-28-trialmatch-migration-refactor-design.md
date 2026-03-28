# TrialMatch — Migration & Refactor Design
**Date:** 2026-03-28
**Status:** Approved

## Goal

Migrate all feature implementations from `TrialMatch - Copy/web` into the canonical `TrialMatch` project, rewriting every file from scratch to comply fully with CLAUDE.md conventions. Preserve all existing functionality — this is a quality pass plus migration, not a feature change.

---

## Context

The current `TrialMatch` project has the correct skeleton (design tokens, fonts, Supabase clients, middleware, `src/` layout) but empty feature pages. The old copy (`TrialMatch - Copy/web`) has complete feature code but violates CLAUDE.md in multiple ways. The old copy serves as a feature specification only — no code is copied verbatim.

---

## Architecture

### Folder Structure

```
src/
├── app/
│   ├── globals.css                   (no changes)
│   ├── layout.tsx                    (add Providers + Toaster)
│   ├── page.tsx                      (no changes)
│   ├── (auth)/
│   │   ├── layout.tsx                (no changes)
│   │   ├── login/page.tsx            (rewrite — currently empty)
│   │   └── register/page.tsx         (rewrite — currently empty)
│   ├── (sponsor)/
│   │   ├── layout.tsx                (NEW: shell with Navbar)
│   │   └── sponsor/
│   │       └── projects/
│   │           ├── page.tsx          (NEW: project list)
│   │           ├── new/page.tsx      (NEW: create project)
│   │           └── [id]/
│   │               ├── page.tsx      (NEW: project detail)
│   │               ├── components/
│   │               │   ├── RequirementsSection.tsx
│   │               │   └── RunMatchButton.tsx
│   │               └── matches/
│   │                   ├── page.tsx  (NEW: match results)
│   │                   └── components/
│   │                       └── MatchResultCard.tsx
│   ├── (clinic)/
│   │   ├── layout.tsx                (NEW: shell with Navbar)
│   │   └── clinic/
│   │       ├── profile/page.tsx      (NEW: clinic profile tabs)
│   │       └── inquiries/
│   │           ├── page.tsx          (NEW: inquiry list)
│   │           └── [id]/
│   │               ├── page.tsx      (NEW: inquiry detail)
│   │               └── components/
│   │                   └── InquiryResponseForm.tsx
│   └── api/
│       └── match/route.ts            (NEW: match algorithm)
├── components/
│   ├── ui/
│   │   ├── button.tsx                (fix bad import path)
│   │   ├── input.tsx                 (NEW)
│   │   ├── card.tsx                  (NEW)
│   │   ├── badge.tsx                 (NEW)
│   │   └── textarea.tsx              (NEW)
│   ├── common/
│   │   ├── smooth-scrolling.tsx      (no changes)
│   │   └── AuthFormShell.tsx         (NEW)
│   └── layout/
│       └── Navbar.tsx                (NEW)
├── features/
│   ├── auth/                         (schemas for forms)
│   ├── projects/
│   │   ├── queries.ts
│   │   └── actions.ts
│   ├── clinics/
│   │   ├── queries.ts
│   │   └── actions.ts
│   └── inquiries/
│       ├── queries.ts
│       └── actions.ts
└── lib/
    ├── providers.tsx                 (no changes)
    ├── utils.ts                      (no changes)
    └── supabase/                     (no changes)
```

---

## Token & Convention Mapping

Every file applies these substitutions — no exceptions:

| Old pattern | Canonical replacement |
|---|---|
| `bg-background` | `bg-default` |
| `text-foreground` | `text-primary` |
| `text-muted-foreground` | `text-secondary` |
| `bg-muted` | `bg-subtle` |
| `border-border` | `border-primary` |
| `hover:bg-accent` | `hover:bg-subtle` |
| `bg-primary` (button fill) | `bg-brand` |
| `text-primary-foreground` | `text-on-brand` |
| `bg-green-100 text-green-800` | `bg-surface-status-success text-icon-status-success` |
| `bg-yellow-100 text-yellow-800` | `bg-surface-status-warning text-icon-status-warning` |
| `bg-blue-100 text-blue-800` | `bg-surface-status-info text-icon-status-info` |
| `bg-red-100 / text-red-500` | `bg-surface-status-danger text-icon-status-danger` |
| Raw `<h1>`, `<h3>`, `<p>`, `<label>` in UI | Typography primitives from `@/components/ui/typography` |
| `import { cn } from "@/lib/cn"` | `import { cn } from "@/lib/utils"` |
| `@/src/lib/utils` | `@/lib/utils` |
| `useEffect + fetch` for data | Server Component `async/await` or React Query |
| Raw `<form>` without RHF | `react-hook-form` + zod resolver |

**Button `default` variant:** remap from shadcn stock to `bg-brand text-on-brand hover:bg-brand-hover`.

---

## Data Fetching Patterns

### Server pages
- Async Server Components by default
- `await createServerClient()` then feature query functions
- Auth guard: `getUser()` + `redirect('/login')`
- No `useEffect`, no client-side fetch in page files

### Feature queries (`src/features/{feature}/queries.ts`)
- Pure async functions, return `{ data, error }`
- Create their own supabase client internally
- Table names follow actual DB schema: `trial_requirements`, `partnership_inquiries`, `equipment`, `certifications`

### Feature actions (`src/features/{feature}/actions.ts`)
- `"use server"` directive at top
- Always call `getUser()` first
- Validate ownership before any mutation
- Call `revalidatePath()` after success
- Return `{ data }` or `{ error: string }`

### Client forms
- `"use client"` leaf components only
- `react-hook-form` + `zodResolver`
- Call Server Actions directly (no fetch wrapper)
- Feedback via `sonner` toast

### New Project form (specific fix)
- Old: `useEffect + fetch` for therapeutic areas
- New: areas loaded server-side in page, passed as props to `"use client"` form component

---

## Route Layout Pattern

```tsx
// (sponsor)/layout.tsx
import Navbar from "@/components/layout/Navbar"

export default function SponsorLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
```

- Auth enforcement stays in `middleware.ts` — not duplicated in layouts
- Same pattern for `(clinic)/layout.tsx`

---

## Navbar

- Async Server Component
- Reads user + role via `createServerClient()`
- Shows role-appropriate nav links
- Logout is an inline Server Action (`"use server"`)

---

## Root Layout Change

Add `<Providers>` wrapping children and `<Toaster richColors position="top-right" />` after children. Keep existing font variables and `<SmoothScrolling>`.

---

## DB Schema Reference (actual tables)

Tables used by feature code (from `src/types/index.ts`):
- `trial_projects`, `trial_requirements`
- `clinics`, `equipment`, `certifications`, `clinic_availability`, `clinic_specializations`
- `match_results`
- `partnership_inquiries`
- `therapeutic_areas`
- `profiles`

---

## Out of Scope

- Landing page redesign
- New features beyond what exists in old copy
- Loading/error boundary files (deferred)
- Testing
