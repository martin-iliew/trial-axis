# Web App Guide

## Purpose

This file is for AI agents starting a new web project from this template.

The goal is not just to understand the current auth demo. The goal is to understand:
- the expected folder structure
- the preferred libraries
- the UI component strategy
- the design-token rules
- where new code should go

If you are doing frontend work in `apps/web`, read this file first, then read `DESIGN-SYSTEM.md` in the same folder before creating UI.

---

## Default Stack

Treat this as the default web stack for new work in this template:

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Routing**: `react-router-dom`
- **Server state**: `@tanstack/react-query`
- **Forms**: `react-hook-form`
- **Validation**: `zod`
- **Form validation bridge**: `@hookform/resolvers`
- **HTTP client**: `axios`
- **Styling direction**: Tailwind CSS v4 style token usage
- **Component strategy**: shadcn/ui conventions for base UI primitives
- **Shared code**: `@shared/*` path alias + `@shared/design-tokens`

Important:
- `zod` is the default schema and validation library.
- `@tanstack/react-query` is the default async server-state layer.
- `react-hook-form` is the default form state layer.
- `axios` should go through shared client/service abstractions when possible.
- `shadcn/ui` is the expected base-component pattern for reusable primitives in `src/components/ui/`.

Current repo note:
- The project already has `src/components/ui/`, but it does not currently include generated shadcn/ui components.
- When a new UI-heavy project starts from this template, prefer adding or generating shadcn-style primitives in `src/components/ui/` instead of inventing a separate component system.
- If Tailwind CSS or shadcn/ui are not yet installed in the fresh project copy, install and initialize them before building new UI primitives.

---

## Must-Read Token File

Before writing UI, read:

- `apps/web/DESIGN-SYSTEM.md`

That file defines how semantic tokens must be used in Tailwind classes and how semantic tokens must be authored.

Non-negotiable token rule:
- use semantic tokens in app code
- never use primitive tokens directly in components
- never put raw color values inside semantic tokens
- semantic tokens must always reference primitives

---

## Folder Structure

Use this structure as the default organization target:

```
apps/web/
├── CLAUDE.md
├── DESIGN-SYSTEM.md
├── package.json
├── vite.config.ts
├── index.html
├── public/
└── src/
    ├── main.tsx                        ← app entry
    ├── App.tsx                         ← provider and router composition
    ├── index.css                       ← global styles and token imports
    ├── assets/                         ← static images, icons, illustrations
    ├── components/
    │   ├── ui/                         ← base reusable UI primitives, shadcn-style
    │   ├── shared/                     ← cross-feature composed components
    │   └── layout/                     ← nav, shell, header, sidebar, footer
    ├── config/                         ← environment-aware runtime config
    ├── context/                        ← auth or app-wide React context
    ├── guards/                         ← route guards
    ├── hooks/                          ← reusable React hooks
    ├── lib/                            ← query client, utility adapters, setup
    ├── pages/                          ← route-level pages
    ├── features/                       ← feature-scoped UI + hooks + service glue
    ├── services/                       ← app-specific service wrappers if needed
    ├── types/                          ← local app-only types
    └── utils/                          ← app-only helpers
```

Notes:
- `components/ui/` is for reusable primitives like button, dialog, input, badge, sheet, dropdown.
- `components/shared/` is for higher-level reusable compositions used across multiple features.
- `features/` is the preferred place for feature-scoped UI, hooks, mutations, selectors, and page sections.
- If logic is shared between web and mobile, move it to `shared/`, not `apps/web/src/utils`.

---

## App Architecture

Current app boot flow:

1. `main.tsx` mounts the app.
2. `App.tsx` composes `QueryClientProvider`, `AuthProvider`, and `BrowserRouter`.
3. `AuthProvider` configures the shared API client for `web` mode.
4. On load, `AuthProvider` attempts `webAuthApi.refresh()` to restore the session from the refresh-token cookie.
5. Guards decide whether the user can access guest or authenticated routes.

Use this as the pattern for future features:
- providers at the top
- route definitions in one place
- server state via React Query
- validation via Zod
- forms via React Hook Form

---

## Library Rules

### `@tanstack/react-query`
Use it for:
- fetching backend data
- caching server responses
- mutations
- invalidation and refetch behavior
- async loading and error states tied to server data

Do not use plain `useEffect` + `fetch` for normal server-state flows when React Query fits.

### `zod`
Use it for:
- form schema validation
- request payload validation on the client
- parsing untrusted external data when needed
- defining input contracts for reusable forms

Do not duplicate validation rules across ad hoc `if` statements when a schema should exist.

### `react-hook-form`
Use it for:
- form state
- field registration
- submit lifecycle
- integration with Zod via resolvers

### `shadcn/ui`
Use shadcn/ui conventions for:
- buttons
- inputs
- form primitives
- dialogs
- popovers
- dropdowns
- sheets
- tables
- tabs
- badges

If the primitive does not exist yet:
- add it under `src/components/ui/`
- keep the API close to shadcn/ui conventions
- theme it with semantic tokens only
- treat the generated file as a scaffold, not as finished design-system code
- after every `npx shadcn add <component>`, immediately replace generated shadcn theme classes and tokens such as `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`, and `chart-*` with local semantic token classes before the component is used or committed

Do not build a second design system next to `components/ui/`.

---

## Styling Rules

- Import the generated token CSS before global app styling.
- Use Tailwind-style semantic token utilities for new UI work.
- Keep global CSS small and structural.
- Put reusable styling decisions into components and tokenized utilities, not one-off page CSS.
- Prefer semantic classes like `bg-default`, `text-primary`, `border-primary`, `text-icon-secondary`.
- Avoid raw hex, raw rgb, and raw oklch values in app component code.
- Avoid using primitive tokens like `neutral-200` or `primary-500` directly in UI code.
- Do not keep stock shadcn registry theme utilities in checked-in components. Remap them to this repo's tokens first.
- Do not keep stock shadcn theme variable definitions like `--background`, `--foreground`, `--card`, `--popover`, `--sidebar-*`, or `--chart-*` in app code. This repo's semantic token system is the only theme source of truth.

Frontend enforcement for AI edits in `apps/web`:
- never use the `any` type
- use Tailwind utility classes instead of bespoke semantic CSS classes like `nav-right`, `nav-user`, `btn`, or similar
- componentize repeated UI first, then compose pages from those primitives or composed shared components
- keep `index.css` limited to token imports and base/global structural rules, not page-specific styling blocks
- use `@/*` for app-local imports from `src/` and keep `@shared/*` for shared code
- use typography primitives from `src/components/ui/typography.tsx` for UI copy and headings
- do not write raw `h1`-`h6`, `p`, `label`, or `code` tags in app UI files unless you are editing the typography primitive module itself

If a semantic token is missing:
- add or update the semantic token definition
- make it reference primitives
- do not bypass the token system with a raw color
- if a freshly generated shadcn component needs a semantic treatment that does not exist yet, extend the design-system tokens first and then remap the component to those tokens

Typography contract for AI edits:
- `TitlePage`, `DisplayPage`, `SubTitlePage`, and `SectionTitle` are the primary page typography primitives
- `BodyBase` and `CodeSnippet` are the shared supporting typography primitives
- keep typography size tokens in `src/styles/tokens.css`
- keep leading, tracking, case, weight, and family decisions in `src/components/ui/typography.tsx`
- if the design needs a new text treatment, extend the size tokens and typography primitives instead of hardcoding one-off text utilities in feature files

---

## Routing Rules

- guest-only routes belong under auth-focused pages
- authenticated routes should be protected by `AuthGuard`
- routes that should disappear after login should be protected by `GuestGuard`
- route protection belongs in guards and app shell wiring, not scattered across page bodies

---

## Shared Boundary

Use `shared/` for:
- endpoint paths
- shared API types
- shared auth service calls
- shared role and permission logic
- design-token packages and generated token artifacts

Keep in web only:
- React components
- browser-only side effects
- page composition
- route guards
- web-specific query behavior

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Page | `PascalCase.tsx` | `DashboardPage.tsx` |
| Base UI primitive | lowercase file name or shadcn-style naming if adopted consistently | `button.tsx`, `dialog.tsx` |
| Reusable composed component | `PascalCase.tsx` | `UserMenu.tsx` |
| Hook | `useX.ts` | `useCurrentUser.ts` |
| Feature folder | `kebab-case` or consistent feature naming | `auth`, `dashboard`, `notes` |
| Utility file | `camelCase.ts` | `formatCurrency.ts` |

Pick one naming convention for shadcn-generated files and keep it consistent inside `components/ui/`.

---

## What Goes Where

| Need to... | Put it in |
|---|---|
| Add a route page | `src/pages/` |
| Add a feature-scoped route section | `src/features/{feature}/` |
| Add a base reusable primitive | `src/components/ui/` |
| Add a shared composed component | `src/components/shared/` |
| Add a shell component | `src/components/layout/` |
| Add auth bootstrapping or session logic | `src/context/` |
| Add route protection | `src/guards/` |
| Add query-client or setup helpers | `src/lib/` |
| Add browser runtime config | `src/config/` |
| Add cross-platform logic | `shared/` |

---

## Practical Rules

- Start with the existing stack before introducing new libraries.
- Prefer React Query over custom request state.
- Prefer Zod over handwritten validation.
- Prefer React Hook Form over ad hoc controlled-form state for non-trivial forms.
- Prefer shadcn/ui-style primitives over bespoke one-off controls.
- Use only semantic design tokens in UI code.
- Read `DESIGN-SYSTEM.md` before editing tokenized UI.

If backend payloads change:
- update `shared/` first
- then update the web consumer

If a new visual pattern is introduced:
- see whether it belongs in `components/ui/`
- otherwise place it in `components/shared/`
- do not duplicate similar primitives across pages
