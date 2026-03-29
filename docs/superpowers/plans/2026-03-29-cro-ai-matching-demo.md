# CRO AI Matching Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the sponsor experience to Contract Research Organization and add a dedicated premium AI-style matching page that runs deterministic clinic ranking before redirecting to simplified results.

**Architecture:** Keep the existing deterministic match engine as the source of truth, then wrap it in a new client-facing matching pipeline made of tested pure helpers plus a dedicated animated route. Route protection, redirects, and user-facing copy move from `/sponsor` to `/cro`, while the ranking page uses seeded clinic previews and real API completion state to drive the cinematic sequence.

**Tech Stack:** Next.js App Router, TypeScript, Supabase, Tailwind v4 semantic tokens, GSAP, shadcn-style UI primitives, tsx test runner

---

### Task 1: Define deterministic matching presentation helpers

**Files:**
- Create: `src/features/matching/presentation.ts`
- Create: `tests/matching/presentation.test.ts`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run `npx tsx --test tests/matching/presentation.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal helpers for criteria extraction, stage labels, shortlist sampling, and duration rules**
- [ ] **Step 4: Re-run `npx tsx --test tests/matching/presentation.test.ts` and verify pass**

### Task 2: Rename the sponsor-facing app surface to CRO

**Files:**
- Modify: `middleware.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/features/auth/schemas.ts`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/features/projects/actions.ts`
- Modify: `src/features/projects/queries.ts`
- Modify: `src/features/inquiries/actions.ts`
- Modify: `src/features/inquiries/queries.ts`
- Move: `src/app/(sponsor)/sponsor/*` to `src/app/(sponsor)/cro/*`
- Modify: renamed CRO route files to use `/cro/...` links and CRO wording

- [ ] **Step 1: Update route protection and redirects to `/cro`**
- [ ] **Step 2: Update auth forms, navigation, landing copy, and project/inquiry copy to say `Contract Research Organization` / `CRO`**
- [ ] **Step 3: Update project and inquiry route links plus server revalidation paths**
- [ ] **Step 4: Keep technical role compatibility where necessary, but remove sponsor wording from app UX**

### Task 3: Build the dedicated AI matching page

**Files:**
- Create: `src/app/(sponsor)/cro/projects/[id]/matching/page.tsx`
- Create: `src/app/(sponsor)/cro/projects/[id]/matching/loading.tsx`
- Create: `src/app/(sponsor)/cro/projects/[id]/matching/error.tsx`
- Create: `src/app/(sponsor)/cro/projects/[id]/matching/components/MatchingExperience.tsx`
- Create: `src/app/(sponsor)/cro/projects/[id]/matching/components/MatchingStageCard.tsx`
- Modify: `src/app/(sponsor)/cro/projects/[id]/components/RunMatchButton.tsx`

- [ ] **Step 1: Add the new matching route and pass project + clinic preview data into the client**
- [ ] **Step 2: Build the animated ranking experience with GSAP and semantic-token UI**
- [ ] **Step 3: Trigger `/api/match` from the dedicated page and redirect to `/cro/projects/[id]/matches` only after the animation and request both finish**
- [ ] **Step 4: Update the run-match CTA to navigate to the dedicated page**

### Task 4: Expand the match results presentation lightly

**Files:**
- Modify: `src/app/api/match/route.ts`
- Modify: `src/app/(sponsor)/cro/projects/[id]/matches/page.tsx`
- Modify: `src/app/(sponsor)/cro/projects/[id]/matches/components/MatchResultCard.tsx`

- [ ] **Step 1: Ensure the API returns enough lightweight metadata for the matching page timing and results redirect**
- [ ] **Step 2: Keep the results page simple while aligning language and links with CRO naming**
- [ ] **Step 3: Preserve the current inquiry flow as the post-match action**

### Task 5: Add demo-friendly seed growth

**Files:**
- Modify: `src/supabase/seed.sql`
- Modify: `src/supabase/seed-auth.ts`

- [ ] **Step 1: Add more clinic records or SQL-generated clinics to create a denser matching pool**
- [ ] **Step 2: Keep the added records plausible and varied enough for ranking visuals**
- [ ] **Step 3: Update demo account copy from sponsor to CRO**

### Task 6: Verify and stabilize

**Files:**
- Test: `tests/matching/presentation.test.ts`
- Test: app-level checks through build/lint as supported by the repo

- [ ] **Step 1: Run focused unit tests for the presentation helpers**
- [ ] **Step 2: Run the most relevant app verification command(s)**
- [ ] **Step 3: Fix any regressions from route renaming or typing drift**
