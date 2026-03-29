# Reset Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase-backed password recovery flow from `/login` through `/forgot-password` and `/reset-password`.

**Architecture:** Keep auth pages as App Router routes under `src/app/(auth)`, validate form input in `src/features/auth/schemas.ts`, and isolate recovery-link parsing in a small auth helper. The reset page will exchange recovery tokens client-side, then update the password through the existing browser Supabase client.

**Tech Stack:** Next.js App Router, React Hook Form, Zod, Supabase Auth, Sonner, Tailwind semantic tokens, `tsx --test`

---

### Task 1: Add failing auth schema and helper tests

**Files:**
- Create: `tests/auth/reset-password.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing tests**

Add tests that assert:
- valid forgot-password emails pass schema validation
- reset-password rejects mismatched confirmation
- reset-password rejects short passwords
- the helper builds `/reset-password` URLs from the current origin
- the helper recognizes Supabase recovery parameters

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/auth/reset-password.test.ts`
Expected: FAIL because the new schemas/helper do not exist yet.

- [ ] **Step 3: Add minimal test script support**

Add a reusable `test:unit` script if needed so the test command is stable.

- [ ] **Step 4: Run test to verify it still fails for the missing implementation**

Run: `npx tsx --test tests/auth/reset-password.test.ts`
Expected: FAIL on missing exports or incorrect behavior.

### Task 2: Implement auth schemas and helper

**Files:**
- Modify: `src/features/auth/schemas.ts`
- Create: `src/features/auth/resetPassword.ts`

- [ ] **Step 1: Implement the smallest schema additions**

Add:
- `forgotPasswordSchema`
- `ForgotPasswordValues`
- `resetPasswordSchema`
- `ResetPasswordValues`

- [ ] **Step 2: Implement the smallest helper**

Add helper functions for:
- building the reset redirect URL from `window.location.origin`
- identifying/extracting recovery link parameters

- [ ] **Step 3: Run the unit test**

Run: `npx tsx --test tests/auth/reset-password.test.ts`
Expected: PASS

### Task 3: Add forgot-password route

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/forgot-password/loading.tsx`
- Create: `src/app/(auth)/forgot-password/error.tsx`

- [ ] **Step 1: Add the login entry point**

Add a tokenized link from the login page to `/forgot-password`.

- [ ] **Step 2: Build the forgot-password form**

Implement a client page using `AuthFormShell`, RHF, Zod, Sonner, and `supabase.auth.resetPasswordForEmail`.

- [ ] **Step 3: Add route loading and error boundaries**

Keep them consistent with existing auth routes.

### Task 4: Add reset-password route

**Files:**
- Create: `src/app/(auth)/reset-password/page.tsx`
- Create: `src/app/(auth)/reset-password/loading.tsx`
- Create: `src/app/(auth)/reset-password/error.tsx`
- Create: `src/app/(auth)/reset-password/components/ResetPasswordForm.tsx`

- [ ] **Step 1: Render a dedicated reset page**

Use a server page wrapper and keep interactive logic in a leaf client component.

- [ ] **Step 2: Handle recovery-link setup**

Exchange the recovery code/tokens on mount, show inline guidance if the link is invalid, and prevent password submission until recovery mode is ready.

- [ ] **Step 3: Update the password**

Submit the new password with `supabase.auth.updateUser({ password })`, toast success, and redirect to `/login`.

- [ ] **Step 4: Add route loading and error boundaries**

Keep them consistent with existing auth routes.

### Task 5: Verify behavior

**Files:**
- Verify only

- [ ] **Step 1: Run unit tests**

Run: `npx tsx --test tests/auth/reset-password.test.ts`
Expected: PASS

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Run targeted Playwright auth coverage if practical**

Run: `npx playwright test e2e/auth.spec.ts`
Expected: Existing auth coverage still passes.
