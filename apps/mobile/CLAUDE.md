# Mobile App Guide

## Tech Stack
- **Runtime**: Expo
- **UI**: React Native
- **Routing**: Expo Router
- **Auth storage**: `expo-secure-store` on native, `localStorage` fallback on web
- **Shared integration**: `@shared/*` path alias + `@shared/design-tokens`

---

## Purpose

`apps/mobile/` is the native-first client for the same backend auth contract.

Current active responsibilities:
- mobile login and register flow
- secure refresh-token persistence
- startup session restoration
- route-group redirects between auth and app tabs
- native-specific app shell and screens

The mobile app differs from web primarily in refresh-token transport and storage strategy.

---

## Current Structure

```
apps/mobile/
├── CLAUDE.md
├── app.json
├── package.json
├── metro.config.js
├── app/
│   ├── _layout.tsx
│   ├── modal.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       └── explore.tsx
├── components/
├── config/
├── constants/
├── context/
├── hooks/
├── assets/
└── scripts/
```

---

## App Architecture

Current boot flow:

1. `app/_layout.tsx` wraps the app in `AuthProvider`.
2. `AuthProvider` configures the shared API client for `mobile` mode.
3. The provider restores the refresh token from secure storage.
4. If a token exists, it calls the mobile refresh endpoint, stores rotated tokens, then fetches `/api/auth/me`.
5. `app/_layout.tsx` redirects between `(auth)` and `(tabs)` based on auth state.

This app should treat secure token persistence as a first-class concern.

---

## Routing Conventions

Current route groups:
- `(auth)` for login and register
- `(tabs)` for authenticated screens
- `modal` for modal presentation

Rules:
- Let the root layout own auth redirects.
- Keep screen files focused on UI and screen-level interactions.
- Avoid duplicating auth gate logic in every screen.

---

## Auth Rules

- Configure the shared API client with `authMode: "mobile"`.
- Mobile login and refresh responses may contain the raw refresh token in the response body.
- Persist refresh tokens through secure storage on native platforms.
- Keep access tokens ephemeral in memory through the shared token helper.
- On auth failure, clear secure storage and in-memory auth state together.

Do not copy the web cookie-based auth assumptions into mobile screens or providers.

---

## Platform Rules

- Use `Platform.OS` checks only where platform-specific behavior is unavoidable.
- Keep native and browser divergence localized to config or storage helpers.
- Prefer Expo Router navigation patterns already present in the app over introducing a parallel navigation system.

---

## Shared Boundary

Use `shared/` for:
- endpoint paths
- auth service calls
- shared API types
- role and permission checks
- token helper primitives

Keep in mobile only:
- Expo Router screens and navigation
- secure storage integration
- React Native styling and components
- native runtime configuration

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Screen file | route-based filename | `login.tsx`, `index.tsx` |
| Reusable component | `PascalCase.tsx` | `ThemedView.tsx` |
| Context or provider file | `PascalCase.tsx` or `PascalCase.ts` | `AuthProvider.tsx` |
| Config or helper file | `camelCase.ts` | `api.ts` |
| Route group | parenthesized folder | `(auth)`, `(tabs)` |

---

## What Goes Where

| Need to... | Put it in |
|---|---|
| Add a screen | `app/` in the correct route group |
| Change auth redirects | `app/_layout.tsx` |
| Change token persistence or session restore | `context/AuthProvider.tsx` |
| Change API base URL defaults | `config/api.ts` |
| Add reusable native UI | `components/` |
| Add theme or device helpers | `hooks/` or `constants/` |

---

## Practical Rules

- Update `shared/` first when backend contracts change.
- Keep secure-storage behavior centralized; do not scatter token reads and writes across screens.
- Use the current auth provider as the single source of truth for session lifecycle.
- If a new flow is mobile-only, keep it local to this app instead of stretching `shared/` into app-specific behavior.
