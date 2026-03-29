# Mobile Nav Drawer & List Item Truncation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hamburger/drawer mobile nav to Navbar and fix overflowing text in equipment, certification, and availability list rows.

**Architecture:** The Navbar stays a Server Component; a new `MobileMenu` client component receives `role`, `isLoggedIn`, and the `logout` server action as props and manages open/close state locally. Desktop links are hidden on mobile via `hidden sm:flex`; the hamburger button is hidden on desktop via `sm:hidden`. List item fixes add `min-w-0 flex-1` to text containers and `shrink-0` to Remove buttons.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, `cn()` from `@/lib/utils`, existing `Button` component, Node.js built-in test runner (`tsx --test`).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/layout/MobileMenu.tsx` | Client component: hamburger button, overlay, right-side slide drawer with role-based links |
| Modify | `src/components/layout/Navbar.tsx` | Hide desktop links on mobile; render `<MobileMenu>` |
| Modify | `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx` | Fix `min-w-0` / `truncate` / `shrink-0` in equipment, cert, availability rows |
| Create | `tests/ui/mobile-nav.test.ts` | Static analysis tests for MobileMenu patterns and list truncation |

---

## Task 1: Static analysis tests (write failing first)

**Files:**
- Create: `tests/ui/mobile-nav.test.ts`

- [ ] **Step 1: Write the test file**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

async function readProjectFile(relativePath: string) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

test("MobileMenu is a client component", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /'use client'/);
});

test("MobileMenu hamburger button is hidden on desktop", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /sm:hidden/);
  assert.match(src, /aria-label/);
});

test("MobileMenu drawer has role=dialog and aria-modal", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /role="dialog"/);
  assert.match(src, /aria-modal="true"/);
});

test("MobileMenu drawer slides in from the right", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /translate-x-full/);
  assert.match(src, /translate-x-0/);
});

test("Navbar delegates mobile nav to MobileMenu", async () => {
  const src = await readProjectFile("src/components/layout/Navbar.tsx");
  assert.match(src, /MobileMenu/);
  assert.match(src, /hidden sm:flex/);
});

test("ClinicProfileTabs list rows have min-w-0 on text containers", async () => {
  const src = await readProjectFile(
    "src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx"
  );
  const count = (src.match(/min-w-0/g) ?? []).length;
  assert.ok(count >= 3, `Expected ≥3 min-w-0 instances (equipment + cert + availability), got ${count}`);
});

test("ClinicProfileTabs Remove buttons are shrink-0", async () => {
  const src = await readProjectFile(
    "src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx"
  );
  const count = (src.match(/shrink-0/g) ?? []).length;
  assert.ok(count >= 3, `Expected ≥3 shrink-0 Remove buttons, got ${count}`);
});
```

- [ ] **Step 2: Run tests and verify they all fail**

```bash
npm run test:unit -- tests/ui/mobile-nav.test.ts
```

Expected: all 7 tests fail — `MobileMenu.tsx` does not exist yet, `min-w-0` and `shrink-0` are not in `ClinicProfileTabs.tsx` yet.

---

## Task 2: Create MobileMenu client component

**Files:**
- Create: `src/components/layout/MobileMenu.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Props = {
  role: string | undefined
  isLoggedIn: boolean
  logoutAction: () => Promise<void>
}

export default function MobileMenu({ role, isLoggedIn, logoutAction }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="sm:hidden rounded-md p-2 text-primary hover:bg-surface-level-2 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-64 bg-surface-level-1 border-l border-primary shadow-xl transition-transform duration-300 sm:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-primary px-4 py-4 shrink-0">
          <span className="heading-7 text-primary">TrialAxis</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1 text-secondary hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {role === "cro" && (
            <>
              <Link href="/cro/projects" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Study Portfolio
                </Button>
              </Link>
              <Link href="/cro/projects/new" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  New Study
                </Button>
              </Link>
            </>
          )}
          {role === "clinic_admin" && (
            <>
              <Link href="/clinic/profile" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  My Profile
                </Button>
              </Link>
              <Link href="/clinic/inquiries" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Inquiries
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Log out */}
        {isLoggedIn && (
          <div className="shrink-0 border-t border-primary p-3">
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit" className="w-full">
                Log out
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Run the first 4 tests and verify they pass**

```bash
npm run test:unit -- tests/ui/mobile-nav.test.ts
```

Expected: first 4 tests pass, last 3 still fail (Navbar and ClinicProfileTabs not updated yet).

---

## Task 3: Update Navbar to use MobileMenu

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/layout/MobileMenu";

async function logout() {
  "use server";
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}

export default async function Navbar() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user?.user_metadata.role as string | undefined;

  return (
    <nav className="border-b border-primary bg-surface-level-1 px-3 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="heading-7 text-primary">
          TrialAxis
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          {role === "cro" && (
            <>
              <Link href="/cro/projects">
                <Button variant="outline" size="sm">
                  Study Portfolio
                </Button>
              </Link>
              <Link href="/cro/projects/new">
                <Button variant="outline" size="sm">
                  New Study
                </Button>
              </Link>
            </>
          )}
          {role === "clinic_admin" && (
            <>
              <Link href="/clinic/profile">
                <Button variant="outline" size="sm">
                  My Profile
                </Button>
              </Link>
              <Link href="/clinic/inquiries">
                <Button variant="outline" size="sm">
                  Inquiries
                </Button>
              </Link>
            </>
          )}
          {user ? (
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Log out
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
          )}
        </div>

        {/* Mobile nav */}
        <MobileMenu role={role} isLoggedIn={!!user} logoutAction={logout} />
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Run tests — first 5 should pass**

```bash
npm run test:unit -- tests/ui/mobile-nav.test.ts
```

Expected: 5 pass, 2 fail (list truncation tests still pending).

---

## Task 4: Fix list item truncation in ClinicProfileTabs

**Files:**
- Modify: `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx`

Three list rows need the same fix: add `min-w-0 flex-1 pr-3` to the text `div`, `truncate` to the text elements, and `shrink-0` to the Remove button.

- [ ] **Step 1: Fix the equipment list row (around line 238)**

Replace:
```tsx
            <li key={eq.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
              <div>
                <BodySmall className="text-primary">{eq.name}</BodySmall>
                <Caption className="text-secondary">{eq.category} · qty {eq.quantity}</Caption>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                className="caption text-icon-status-danger hover:underline"
              >
                Remove
              </button>
            </li>
```

With:
```tsx
            <li key={eq.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
              <div className="min-w-0 flex-1 pr-3">
                <BodySmall className="truncate text-primary">{eq.name}</BodySmall>
                <Caption className="truncate text-secondary">{eq.category} · qty {eq.quantity}</Caption>
              </div>
              <button
                onClick={() => handleDelete(eq.id)}
                className="caption shrink-0 text-icon-status-danger hover:underline"
              >
                Remove
              </button>
            </li>
```

- [ ] **Step 2: Fix the certifications list row (around line 362)**

Replace:
```tsx
              <li key={cert.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div>
                  <BodySmall className="text-primary">{cert.certification_name}</BodySmall>
                  {cert.issued_by && <Caption className="text-secondary">Issued by {cert.issued_by}</Caption>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="caption text-icon-status-danger hover:underline"
                >
                  Remove
                </button>
              </li>
```

With:
```tsx
              <li key={cert.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div className="min-w-0 flex-1 pr-3">
                  <BodySmall className="truncate text-primary">{cert.certification_name}</BodySmall>
                  {cert.issued_by && <Caption className="truncate text-secondary">Issued by {cert.issued_by}</Caption>}
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="caption shrink-0 text-icon-status-danger hover:underline"
                >
                  Remove
                </button>
              </li>
```

- [ ] **Step 3: Fix the availability list row (around line 410)**

Replace:
```tsx
              <li key={a.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div>
                  <BodySmall className="text-primary">{a.start_date} → {a.end_date}</BodySmall>
                  <Caption className="text-secondary capitalize">{a.type}{a.notes ? ` · ${a.notes}` : ""}</Caption>
                </div>
                <button
                  onClick={() => handleDeleteAvailability(a.id)}
                  className="caption text-icon-status-danger hover:underline"
                >
                  Remove
                </button>
              </li>
```

With:
```tsx
              <li key={a.id} className="flex items-center justify-between rounded-xl border border-primary px-4 py-3">
                <div className="min-w-0 flex-1 pr-3">
                  <BodySmall className="truncate text-primary">{a.start_date} → {a.end_date}</BodySmall>
                  <Caption className="truncate text-secondary capitalize">{a.type}{a.notes ? ` · ${a.notes}` : ""}</Caption>
                </div>
                <button
                  onClick={() => handleDeleteAvailability(a.id)}
                  className="caption shrink-0 text-icon-status-danger hover:underline"
                >
                  Remove
                </button>
              </li>
```

- [ ] **Step 4: Run all tests and verify all 7 pass**

```bash
npm run test:unit -- tests/ui/mobile-nav.test.ts
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/MobileMenu.tsx src/components/layout/Navbar.tsx src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx tests/ui/mobile-nav.test.ts docs/superpowers/specs/2026-03-29-mobile-nav-and-list-truncation-design.md docs/superpowers/plans/2026-03-29-mobile-nav-and-list-truncation.md
git commit -m "feat: add mobile hamburger drawer nav and fix list item text truncation"
```
