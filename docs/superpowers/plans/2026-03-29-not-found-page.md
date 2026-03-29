# Not Found Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tokenized custom 404 page that matches the auth-screen design language.

**Architecture:** Implement a single root-level `src/app/not-found.tsx` server component using existing `Card`, `Button`, and typography primitives. Cover it with one focused Playwright assertion in the navigation suite so the route behavior is locked before UI changes.

**Tech Stack:** Next.js App Router, Playwright, existing UI primitives, Tailwind semantic tokens, typography components

---

### Task 1: Add failing route coverage

**Files:**
- Modify: `e2e/navigation.spec.ts`

- [ ] **Step 1: Write the failing test**

Add a test that opens a missing route and checks for:
- `Page not found`
- `Go home`
- `Back to login`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/navigation.spec.ts -g "custom 404"`
Expected: FAIL because the app still uses the default Next.js not-found screen.

### Task 2: Implement the custom page

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Build the minimal page**

Render a centered card with:
- `Badge`
- `Heading4`
- `Body`
- two action buttons linking to `/` and `/login`

- [ ] **Step 2: Keep styling token-compliant**

Use `bg-default`, `bg-surface-level-1`, `border-primary`, `text-primary`, and `text-secondary`.

- [ ] **Step 3: Run the targeted test**

Run: `npx playwright test e2e/navigation.spec.ts -g "custom 404"`
Expected: PASS

### Task 3: Verify

**Files:**
- Verify only

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: PASS with no new errors.
