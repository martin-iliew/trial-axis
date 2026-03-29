# Mobile Nav Drawer & List Item Truncation

**Date:** 2026-03-29
**Scope:** Navbar mobile hamburger drawer + equipment/cert/availability list item text truncation

---

## Problem

1. **Navbar** — on screens narrower than ~380px, inline nav buttons (e.g. "My Profile", "Inquiries", "Log out") overflow the navbar with no wrapping and no hamburger fallback.
2. **List items** — `flex justify-between` rows in the equipment, certifications, and availability lists have no `min-w-0` on the text container, so long names cannot shrink and break the layout.

---

## Design

### 1. Navbar

#### Architecture

| File | Role | Change |
|------|------|--------|
| `src/components/layout/Navbar.tsx` | Server component | Pass `role` + `isLoggedIn` to `MobileMenu`; wrap desktop links in `hidden sm:flex` |
| `src/components/layout/MobileMenu.tsx` | New client component | Hamburger button + drawer + overlay |

#### `Navbar.tsx` changes
- Existing desktop nav links wrapped in `hidden sm:flex items-center gap-1 sm:gap-2`.
- Add `<MobileMenu role={role} isLoggedIn={!!user} />` rendered only on mobile (`sm:hidden` on the wrapper is handled inside `MobileMenu`).
- Log out server action stays in `Navbar.tsx`; `MobileMenu` receives `isLoggedIn` and renders a log-out `<form>` that reuses the same action (passed as a prop).

#### `MobileMenu.tsx`
- `'use client'` component.
- Props: `role: string | undefined`, `isLoggedIn: boolean`, `logoutAction: () => Promise<void>`.
- State: `open: boolean`.
- Renders:
  - Hamburger button (`☰` / `✕`) — `sm:hidden`, `aria-label="Open menu"`.
  - Fixed full-screen overlay (`inset-0 bg-black/40`) — visible when `open`, closes drawer on click, `z-40`.
  - Right-side drawer panel — fixed, `top-0 right-0 h-full w-64`, slides with `translate-x-full` → `translate-x-0` transition, `z-50`.
  - Drawer header: "TrialAxis" brand + close button.
  - Drawer body: role-based nav links as full-width `<Link>` rows using `Button variant="ghost"`.
  - Drawer footer: log out `<form>` if `isLoggedIn`.

#### Behavior
- Drawer closes on: overlay click, close button click, nav link click.
- No new dependencies — uses existing `Button`, `cn`, `Link`.
- Accessibility: `role="dialog"`, `aria-modal="true"`, focus trap is out of scope for MVP.

---

### 2. List Item Truncation

**File:** `src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx`

Three list types share the same broken pattern:

```tsx
// Before
<li className="flex items-center justify-between ...">
  <div>
    <BodySmall>{name}</BodySmall>
    <Caption>{subtitle}</Caption>
  </div>
  <button>Remove</button>
</li>

// After
<li className="flex items-center justify-between ...">
  <div className="min-w-0 flex-1 pr-3">
    <BodySmall className="truncate">{name}</BodySmall>
    <Caption className="truncate">{subtitle}</Caption>
  </div>
  <button className="shrink-0">Remove</button>
</li>
```

Applied to:
- **Equipment** — truncate `name`, subtitle `category · qty N`
- **Certifications** — truncate `certification_name`, subtitle `Issued by {issued_by}`
- **Availability** — truncate date range `BodySmall`, truncate notes `Caption`

---

## Out of Scope

- Focus trap inside drawer
- Animated backdrop fade (can be added later)
- Bottom navigation bar variant
- Any other pages beyond Navbar and ClinicProfileTabs
