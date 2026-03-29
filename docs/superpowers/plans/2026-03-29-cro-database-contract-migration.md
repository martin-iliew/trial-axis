# CRO Database Contract Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining database/auth contract usage of `sponsor` with `cro`, regenerate the Supabase TypeScript contract, and remove legacy app fallbacks that only exist because the database enums still expose `sponsor`.

**Architecture:** Add a forward-only Supabase migration that renames enum values and rewrites stored metadata from `sponsor` to `cro` in the current organizations/profiles/auth contract. Then align generated types, seed/auth scripts, and runtime role checks to the new enum values so the app, tests, and database contract all agree on `cro`.

**Tech Stack:** Supabase SQL migrations, generated TypeScript database types, Next.js App Router, tsx tests, Playwright

---

### Task 1: Add a CRO contract regression test

**Files:**
- Create: `tests/auth/cro-contract.test.ts`
- Modify: `tests/auth/reset-password.test.ts` only if shared helpers are needed

- [ ] **Step 1: Write a failing test** that reads `src/types/supabase.ts` and asserts:
  - `user_role` contains `"cro"` and not `"sponsor"`
  - `organization_type` contains `"cro"` and not `"sponsor"`
  - `src/supabase/seed-auth.ts` no longer seeds users with `role: 'sponsor'`
- [ ] **Step 2: Run `npx tsx --test tests/auth/cro-contract.test.ts` and verify it fails for the expected contract drift**
- [ ] **Step 3: Keep the test narrow** to the migration contract only; do not assert unrelated UI strings

### Task 2: Add the forward SQL migration

**Files:**
- Create: `src/supabase/migrations/20260329000002_rename_sponsor_to_cro.sql`

- [ ] **Step 1: Write a migration that renames enum values**
  - `user_role`: `sponsor` → `cro`
  - `organization_type`: `sponsor` → `cro`
- [ ] **Step 2: Update persisted data in-place**
  - `profiles.role`
  - `organizations.type`
  - `auth.users.raw_user_meta_data->'role'`
  - any text role fields that are part of the current auth/signup contract
- [ ] **Step 3: Make the migration idempotent enough for local resets**
  - guard enum renames with `pg_enum` checks
  - guard data updates with `WHERE` clauses

### Task 3: Regenerate and align the app contract

**Files:**
- Modify: `src/types/supabase.ts`
- Modify: `src/types/index.ts` if required by regenerated output
- Modify: `src/supabase/seed-auth.ts`
- Modify: `src/supabase/assert_seed.sql`
- Modify: `middleware.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `e2e/auth.setup.ts`
- Modify: `e2e/sponsor.spec.ts`

- [ ] **Step 1: Regenerate Supabase types** from the local database if tooling is available; otherwise update `src/types/supabase.ts` to the exact post-migration enum values
- [ ] **Step 2: Replace runtime fallbacks** that still accept `sponsor` in auth/nav/middleware helpers so the app trusts only `cro`
- [ ] **Step 3: Update seed/auth scripts**
  - seed users with `role: 'cro'`
  - update seed assertions that validate allowed roles
  - keep demo emails and CRO wording consistent
- [ ] **Step 4: Update E2E storage-state naming** if it still encodes sponsor-only semantics and can be changed safely

### Task 4: Verify the migration end to end

**Files:**
- Test: `tests/auth/cro-contract.test.ts`
- Test: `npx tsx --test`
- Test: `npm run build`
- Test: `npx playwright test e2e/auth.spec.ts e2e/middleware.spec.ts e2e/sponsor.spec.ts e2e/navigation.spec.ts e2e/landing.spec.ts`

- [ ] **Step 1: Run the new focused CRO contract test**
- [ ] **Step 2: Run the full unit suite**
- [ ] **Step 3: Run the production build**
- [ ] **Step 4: Run the CRO-focused Playwright slice**
- [ ] **Step 5: Fix any remaining contract mismatches until all four checks pass**
