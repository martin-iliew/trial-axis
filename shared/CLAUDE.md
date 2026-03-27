# Shared Package Guide

## Purpose

`shared/` is the contract and utility layer consumed by the active frontend and backend-facing tooling.

This folder owns:
- API route constants
- shared request and response types
- auth service wrappers
- API client configuration primitives
- role and permission definitions
- validation helpers
- formatting and small utility helpers
- design-token source files and generated outputs

It should stay framework-light and portable.

---

## Current Structure

```
shared/
├── CLAUDE.md
├── index.ts
├── package.json
├── api/
├── api-types/
├── constants/
├── design-tokens/
├── services/
├── tests/
├── types/
└── utils/
```

---

## Design Goal

This package exists to stop callers from inventing separate auth contracts.

The right use of `shared/` is:
- define the backend contract once
- define route names once
- reuse the same role and permission model everywhere it is needed

The wrong use of `shared/` is:
- placing React components here
- placing React Native UI here
- coupling utilities to browser-only or native-only APIs without an explicit abstraction
- hiding app-specific workflow inside generic helpers

---

## Auth Model

`shared/` currently models the web auth flow only:

- refresh token is handled through cookies
- refresh and logout calls do not send a body token

If a mobile app is intentionally added later, add a separate mobile contract only in the same change that introduces that app. If there is no mobile app in scope, skip mobile-specific shared abstractions.

---

## Module Responsibilities

### `api/`
- Keep axios/client setup, auth-mode route selection, and payload normalization here.
- Cross-cutting client concerns belong here before they belong in an app.

### `api-types/`
- Use this for types that mirror backend request and response payloads.
- If the backend contract changes, update these types first.

### `constants/`
- Store stable values like endpoint paths, API error shapes, roles, and permissions.
- Avoid placing mutable runtime configuration here.

### `services/`
- Compose `api/` and `api-types/` into high-level service calls like auth workflows.
- Services should still be app-agnostic.

### `utils/`
- Keep helpers small, predictable, and side-effect-light.
- If a helper starts encoding app workflow, it probably belongs somewhere else.

### `design-tokens/`
- This is a shared asset pipeline, not just static JSON.
- The active frontend depends on its outputs.
- Respect the existing consumer hooks that build tokens before app startup or build.

---

## Rules

- Do not import from `apps/web` or any future app package.
- Do not import React, Expo, or React Router into generic shared modules.
- Prefer pure TypeScript modules with explicit inputs and outputs.
- Keep public exports discoverable through `index.ts` and subfolder barrels.
- If you add a backend endpoint consumed by both apps, add route constants and shared types in the same change.
- If a helper depends on browser or native storage, isolate that dependency behind a function contract instead of hardcoding the environment into a generic module.

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| API type | descriptive `PascalCase` type alias or interface | `User`, `LoginRequest` |
| Constant map | `UPPER_SNAKE_CASE` or `PascalCase` object | `API_ROUTES`, `UserRole` |
| Utility file | `camelCase.ts` | `tokenStorage.ts` |
| Service file | `{domain}Service.ts` | `authService.ts` |
| Barrel | `index.ts` | `api/index.ts` |

---

## What Goes Where

| Need to... | Put it in |
|---|---|
| Add a backend DTO mirror | `api-types/` |
| Add or update endpoint paths | `constants/endpoints.ts` |
| Add API-client request or response normalization | `api/` |
| Add a cross-app service wrapper | `services/` |
| Add role or permission mapping | `constants/roles.ts` or `utils/permissions.ts` |
| Add token-build source or output rules | `design-tokens/` |
| Add a reusable helper | `utils/` |

---

## Practical Rules

- Change `shared/` first when a backend contract changes, then adapt active consumers.
- Keep shared APIs explicit and boring; this package should reduce surprises, not hide them.
- Avoid adding large abstractions for one caller. If only web needs something, keep it in web.
- If a future mobile app is added, introduce its shared contract deliberately instead of prebuilding it.
