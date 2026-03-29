# TrialAxis Reset Password Design

**Date:** 2026-03-29
**Status:** Approved

## Goal

Add a password recovery flow that starts from `/login`, emails a Supabase recovery link, and lets the user set a new password inside TrialAxis on a dedicated reset page.

---

## Scope

In scope:

- Add a "Forgot password?" entry point on the login screen
- Add a guest-facing `/forgot-password` page
- Add a guest-facing `/reset-password` page
- Validate both forms with Zod and `react-hook-form`
- Use Supabase Auth for reset email delivery and password update
- Keep all UI inside the existing auth shell and design-token system

Out of scope:

- Authenticated in-app password change
- Custom email templates
- Extra account settings pages

---

## Flow

1. User opens `/login` and follows "Forgot password?"
2. `/forgot-password` accepts an email address and calls `supabase.auth.resetPasswordForEmail`
3. The reset email points back to `/reset-password`
4. `/reset-password` reads the recovery tokens from the URL, exchanges them for a recovery session, then shows a new password form
5. User submits a new password and the page calls `supabase.auth.updateUser({ password })`
6. On success, the page returns the user to `/login`

---

## Architecture

### Routes

- `src/app/(auth)/forgot-password/page.tsx`
  - Client page with one email field
  - Uses existing `AuthFormShell`
- `src/app/(auth)/reset-password/page.tsx`
  - Server wrapper page that renders a client reset form component
  - Dedicated route to receive Supabase recovery redirects

Each route also gets matching `loading.tsx` and `error.tsx` files to stay aligned with the project routing conventions.

### Auth Logic

- Extend `src/features/auth/schemas.ts` with:
  - `forgotPasswordSchema`
  - `resetPasswordSchema`
- Add a small auth helper for deriving the browser redirect URL and normalizing recovery parameters so the reset page can handle the link reliably.

### UI

- Reuse `AuthFormShell`, `Input`, `Button`, and typography primitives
- Use semantic tokens only
- Keep the login page focused on sign-in and use a simple link for password recovery rather than mixing multiple forms on one screen

---

## Error Handling

- Invalid email or short passwords are blocked client-side by Zod
- Supabase request failures surface as toast errors
- Missing or invalid recovery parameters on `/reset-password` show a clear inline error and route users back to `/forgot-password`
- Successful submission shows a confirmation toast and redirects to `/login`

---

## Testing

- Add focused unit tests for auth schemas and recovery URL helpers
- Verify the red-green cycle with `tsx --test`
- Run targeted lint/build-level verification after implementation
