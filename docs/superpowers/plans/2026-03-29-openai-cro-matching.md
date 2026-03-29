# OpenAI CRO Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real OpenAI-assisted CRO matching flow where a saved free-text study brief is parsed into strict structured filters/preferences, then applied through deterministic clinic filtering and ranking.

**Architecture:** Keep `/api/match` as the authenticated entrypoint, but move the real work into focused modules under `src/features/matching`: parser contract and OpenAI client seam, deterministic fallback conversion from saved requirements, pure hard-filter and ranking functions, a dedicated matching snapshot loader, and one orchestration layer that returns parse-aware UI payloads. Persist the CRO free-text brief on `trial_projects`, keep `match_results` as the final ranking store, explicitly normalize legacy `project_requirements.value` shapes during fallback, and extend the animated matching/results UI to show parser success, fallback provenance, exclusion reasons, and zero-result outcomes.

**Tech Stack:** Next.js App Router, TypeScript, Zod, Supabase, OpenAI Responses API, Tailwind v4 semantic tokens, GSAP, Node test runner via `tsx --test`, Playwright

---

### Task 1: Add the CRO matching brief data contract

**Files:**
- Create: `src/supabase/migrations/20260329000003_add_trial_project_matching_brief.sql`
- Create: `src/features/projects/schemas.ts`
- Modify: `src/types/supabase.ts`
- Modify: `src/features/projects/actions.ts`
- Modify: `src/app/(cro)/cro/projects/[id]/page.tsx`
- Create: `src/app/(cro)/cro/projects/[id]/components/MatchingBriefSection.tsx`
- Create: `tests/matching/matching-brief-schema.test.ts`

- [ ] **Step 1: Write the failing test** for a `matchingBriefSchema` that accepts a non-empty study brief, trims whitespace, and rejects oversized/empty submissions.
- [ ] **Step 2: Run `pnpm exec tsx --test tests/matching/matching-brief-schema.test.ts`** and verify it fails because the schema/module does not exist yet.
- [ ] **Step 3: Add the `trial_projects.matching_brief` migration** and align `src/types/supabase.ts` to the new column so project reads/writes expose the saved brief.
- [ ] **Step 4: Add `matchingBriefSchema` and a server action** in `src/features/projects/actions.ts` to save the brief for the current CRO-owned project.
- [ ] **Step 5: Add `MatchingBriefSection.tsx` to the project detail page** so CRO users can edit/save the free-text brief before running a match.
- [ ] **Step 6: Re-run `pnpm exec tsx --test tests/matching/matching-brief-schema.test.ts`** and verify pass.

### Task 2: Define the parsed match request contract

**Files:**
- Create: `src/features/matching/types.ts`
- Create: `src/features/matching/schemas.ts`
- Create: `src/features/matching/contracts.ts`
- Create: `tests/matching/parsed-match-request.test.ts`

- [ ] **Step 1: Write the failing test** for the `ParsedMatchRequest` schema:
  - accepts `summary`, `hard_filters`, `soft_preferences`, and `unmapped_requirements`
  - preserves `source_text` on every mapped item
  - rejects weights outside the normalized range
  - rejects unsupported filter types or invented fields
- [ ] **Step 2: Run `pnpm exec tsx --test tests/matching/parsed-match-request.test.ts`** and verify it fails because the contract does not exist.
- [ ] **Step 3: Implement the shared TypeScript types and Zod schemas** for parser output, parser metadata, exclusion reasons, ranked-clinic result payloads, and the `/api/match` response contract under `src/features/matching/`.
- [ ] **Step 4: Re-run `pnpm exec tsx --test tests/matching/parsed-match-request.test.ts`** and verify pass.

### Task 3: Add the OpenAI parser seam and deterministic fallback parser mode

**Files:**
- Modify: `package.json`
- Create: `src/config/openai.ts`
- Create: `src/features/matching/runtime.ts`
- Create: `src/features/matching/openai/prompt.ts`
- Create: `src/features/matching/openai/client.ts`
- Create: `src/features/matching/openai/parseMatchRequest.ts`
- Create: `src/features/matching/fallback.ts`
- Create: `tests/matching/parse-match-request.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Write the failing parser tests** for:
  - valid OpenAI structured output -> `mode: "ai"`
  - invalid schema output/refusal/timeout -> `mode: "fallback"`
  - missing `matching_brief` -> direct deterministic fallback without calling OpenAI
- [ ] **Step 2: Run `pnpm exec tsx --test tests/matching/parse-match-request.test.ts`** and verify failure.
- [ ] **Step 3: Add the OpenAI runtime seam**:
  - add the `openai` dependency
  - create an env accessor in `src/config/openai.ts` that reads `OPENAI_API_KEY` lazily
  - add a small client factory/module so tests can inject a stub instead of mocking global fetch
  - add a non-production parser-mode override in `src/features/matching/runtime.ts` so Playwright/API tests can force `ai` or `fallback` without calling the real API
- [ ] **Step 4: Implement `parseMatchRequestWithAI()`** with Responses API structured outputs, local Zod validation, parser metadata, and no DB access.
- [ ] **Step 5: Implement `buildFallbackParsedRequest()`** that converts existing `project_requirements` plus key project fields into the same parsed contract when AI is unavailable, including normalization of the legacy JSON value shapes already stored/seeded in the repo.
- [ ] **Step 6: Document the new `OPENAI_API_KEY` requirement in `README.md`** so local setup is explicit.
- [ ] **Step 7: Re-run `pnpm exec tsx --test tests/matching/parse-match-request.test.ts`** and verify pass.

### Task 4: Extract deterministic hard-filtering and ranking into pure modules

**Files:**
- Create: `src/features/matching/filters.ts`
- Create: `src/features/matching/ranking.ts`
- Create: `tests/matching/filters.test.ts`
- Create: `tests/matching/ranking.test.ts`

- [ ] **Step 1: Write the failing hard-filter tests** for therapeutic area, phase experience, equipment, certification, geography, patient capacity, and availability overlap.
- [ ] **Step 2: Write the failing ranking tests** for weighted soft preferences, stable score ordering, and explainable per-dimension score output.
- [ ] **Step 3: Run `pnpm exec tsx --test tests/matching/filters.test.ts tests/matching/ranking.test.ts`** and verify failure.
- [ ] **Step 4: Implement `applyHardFilters()`** as a pure function that returns survivors plus exclusion reasons grouped by clinic.
- [ ] **Step 5: Implement `rankClinicsFromPreferences()`** as a pure function that:
  - consumes only survivor data plus parsed preferences
  - produces deterministic numeric scores
  - returns a richer `score_breakdown` JSON shape that still fits `match_results.score_breakdown`
- [ ] **Step 6: Re-run `pnpm exec tsx --test tests/matching/filters.test.ts tests/matching/ranking.test.ts`** and verify pass.

### Task 5: Refactor `/api/match` into a parse-aware orchestrator

**Files:**
- Create: `src/features/matching/queries.ts`
- Create: `src/features/matching/orchestrator.ts`
- Modify: `src/app/api/match/route.ts`
- Modify: `src/features/projects/queries.ts`
- Create: `tests/matching/run-match.test.ts`

- [ ] **Step 1: Write the failing orchestration tests** for:
  - AI parse success returning `parse_status: "ai"`
  - parser fallback returning `parse_status: "fallback"`
  - zero surviving clinics returning exclusion metadata without crashing
  - persisted `match_results` rows keeping final deterministic rank output
- [ ] **Step 2: Run `pnpm exec tsx --test tests/matching/run-match.test.ts`** and verify failure.
- [ ] **Step 3: Create `src/features/matching/queries.ts`** so project context and clinic snapshots are loaded in one matching-specific place instead of being scattered across route code.
- [ ] **Step 4: Create `runMatch()` inside `src/features/matching/orchestrator.ts`** to own the full server workflow:
  - load project, requirements, and clinic-side matching data
  - parse or fallback into a `ParsedMatchRequest`
  - apply hard filters
  - rank survivors
  - replace old `match_results`
  - update project status/algorithm version
  - log parser failure metadata for fallback observability
  - return the shared `/api/match` response contract with `parse_status`, parsed summary, exclusion counts/reasons, and ranked results
- [ ] **Step 5: Slim `src/app/api/match/route.ts` down** to auth, request validation, and a call into the orchestrator.
- [ ] **Step 6: Update `getMatchResults()`** only as needed so the results page can read the richer `score_breakdown` JSON safely.
- [ ] **Step 7: Re-run `pnpm exec tsx --test tests/matching/run-match.test.ts`** and verify pass.

### Task 6: Make the animated matching page reflect real parser states

**Files:**
- Modify: `src/features/matching/presentation.ts`
- Modify: `tests/matching/presentation.test.ts`
- Modify: `src/app/(cro)/cro/projects/[id]/matching/page.tsx`
- Modify: `src/app/(cro)/cro/projects/[id]/matching/components/MatchingExperience.tsx`
- Modify: `src/app/(cro)/cro/projects/[id]/matching/components/MatchingStageCard.tsx`
- Modify: `src/app/(cro)/cro/projects/[id]/components/RunMatchButton.tsx`

- [ ] **Step 1: Write or extend failing presentation tests** so helper output covers parser-aware chips/stage labels and zero-result messaging instead of only decorative criteria chips.
- [ ] **Step 2: Run `pnpm exec tsx --test tests/matching/presentation.test.ts`** and verify failure for the new helper behavior.
- [ ] **Step 3: Update the matching route and client component** so `/api/match` response data drives explicit states:
  - `parsing`
  - `parse_success`
  - `parse_fallback`
  - `hard_filter_zero`
  - `ranking_complete`
  - `request_failed`
- [ ] **Step 4: Show parsed summary, hard filters, soft preferences, and unmapped requirements** on the matching page using existing semantic-token primitives.
- [ ] **Step 5: Replace the generic zero-result terminal message** with a dedicated outcome panel that includes exclusion counts/reasons and a CTA back to the project brief/requirements.
- [ ] **Step 6: Keep the animation cinematic but honest** by mapping stage labels/copy to actual backend phases instead of implying parser work that does not exist.
- [ ] **Step 7: Re-run `pnpm exec tsx --test tests/matching/presentation.test.ts`** and verify pass.

### Task 7: Update the results page and add matching flow coverage

**Files:**
- Modify: `src/app/(cro)/cro/projects/[id]/matches/page.tsx`
- Modify: `src/app/(cro)/cro/projects/[id]/matches/components/MatchResultCard.tsx`
- Modify: `e2e/api.spec.ts`
- Create: `e2e/matching.spec.ts`

- [ ] **Step 1: Add the failing API/e2e coverage** for:
  - authenticated match run success
  - parse fallback response shape
  - zero-result journey staying on the matching page
  - successful ranked journey redirecting to `/matches`
- [ ] **Step 2: Run `pnpm exec playwright test e2e/api.spec.ts e2e/matching.spec.ts`** and verify failure.
- [ ] **Step 3: Update the results page and cards** so they can render the richer `score_breakdown` shape and expose why a clinic ranked well, not just raw bars.
- [ ] **Step 4: Extend `e2e/api.spec.ts`** so it stops relying on loose “not 200” assertions for `/api/match` request-shape regressions.
- [ ] **Step 5: Implement `e2e/matching.spec.ts`** to cover the CRO brief -> animated page -> results/zero-results path with seeded auth, using the non-production parser-mode override to force `ai` and `fallback` deterministically.
- [ ] **Step 6: Re-run `pnpm exec playwright test e2e/api.spec.ts e2e/matching.spec.ts`** and verify pass.

### Task 8: Final verification and stabilization

**Files:**
- Test: `pnpm test:unit`
- Test: `pnpm build`
- Test: `pnpm exec playwright test e2e/api.spec.ts e2e/matching.spec.ts`

- [ ] **Step 1: Run `pnpm test:unit`** and verify the full matching unit suite passes together with the existing repo tests.
- [ ] **Step 2: Run `pnpm build`** and verify the App Router routes, server actions, and type generation still build cleanly.
- [ ] **Step 3: Run `pnpm exec playwright test e2e/api.spec.ts e2e/matching.spec.ts`** and verify the new matching flow passes end to end.
- [ ] **Step 4: Fix any typing drift, stale imports, or response-shape mismatches** before handing off implementation as complete.
