# TrialMatch 404 Page Design
**Date:** 2026-03-29
**Status:** Approved

## Goal

Add a custom App Router `not-found` page for TrialMatch that matches the project’s existing auth-screen visual language while staying lightweight and token-compliant.

---

## Scope

In scope:
- Add `src/app/not-found.tsx`
- Use a centered standalone card on `bg-default`
- Use typography primitives only for all page copy
- Provide clear navigation actions back into the app
- Add focused browser coverage for the custom 404 page

Out of scope:
- Full `Navbar` / `Footer` chrome
- New primitives or global CSS
- Custom error handling for route groups beyond the root `not-found` page

---

## Design

The page will visually align with the auth screens:
- full-height centered layout
- `Card` with `bg-surface-level-1` and `border-primary`
- compact status cue using existing primitives
- headline, supporting copy, and 2 actions

Content:
- status label: `404`
- headline: `Page not found`
- body: `You seem to have reached a page that doesn't exist or may never exist.`
- primary action: `Go home`
- secondary action: `Back to login`

---

## Testing

Add a Playwright test that visits an unknown route and asserts:
- the custom message renders
- the `Go home` action is visible
- the `Back to login` action is visible
