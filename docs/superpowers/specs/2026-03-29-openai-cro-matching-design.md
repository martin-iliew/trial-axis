# OpenAI CRO Matching Design

**Date:** 2026-03-29  
**Status:** Approved in conversation, ready for planning/implementation in a fresh context

## Goal

Add a real AI-assisted matching phase for CRO users where:

1. A CRO can enter free-text study/site requirements.
2. OpenAI converts that text into strict structured data.
3. The backend applies deterministic boolean filtering from the structured hard filters.
4. The backend ranks the surviving clinics deterministically from the structured soft preferences.

The model must not invent assumptions, thresholds, or final rankings.

## Product Boundaries

This phase is intentionally narrow.

The AI is responsible only for:

- extracting structured `hard_filters`
- extracting structured `soft_preferences`
- summarizing the parsed request
- surfacing anything ambiguous as `unmapped_requirements`

The AI is not responsible for:

- inventing missing thresholds
- inferring unspoken requirements
- excluding clinics on its own
- doing the final ranking
- replacing deterministic matching rules

If the CRO writes something ambiguous, the model must preserve it as unmapped rather than guessing.

## Recommended Approach

### Option 1: Structured extraction only

Use OpenAI only to parse freeform CRO input into strict JSON. Then run deterministic filtering and ranking in the app.

**Pros**

- safest and most explainable
- easiest to test
- matches the approved product direction
- keeps ranking stable and auditable

**Cons**

- requires a clear JSON schema
- does not add AI-driven reranking

### Option 2: Tool-calling extraction with vocabulary lookup

Let the model call app tools like therapeutic area lists or equipment vocabularies before producing structured output.

**Pros**

- better normalization against app data
- fewer off-vocabulary labels

**Cons**

- more moving parts
- slower
- more implementation cost

### Option 3: AI extraction plus AI reranking

Let the model both extract the request and help rank clinics.

**Pros**

- more flexible scoring

**Cons**

- less deterministic
- harder to defend to CRO users
- not aligned with the approved scope

### Decision

Use **Option 1** for this phase.

This codebase already has a deterministic match pipeline and a premium animated matching page. The next phase should strengthen the weakest part of the workflow: converting messy CRO input into usable structured filters and preferences.

## Current System Context

The current matching system already has:

- a deterministic `/api/match` endpoint
- a dedicated animated matching page
- deterministic score breakdown storage in `match_results`
- CRO routes and UI

This phase should not replace that foundation. It should insert a real AI parsing step ahead of the existing deterministic stages.

## Target User Flow

### CRO Flow

1. CRO opens the project matching experience.
2. CRO provides a free-text brief describing what kind of clinic is needed.
3. Backend sends the brief to OpenAI for strict structured extraction.
4. Backend validates the AI output against the app schema.
5. Backend applies boolean hard filters to remove impossible clinics.
6. Backend ranks the surviving clinics using weighted deterministic scoring from soft preferences.
7. UI shows:
   - interpreted requirements
   - exclusions from hard filtering
   - final ranked clinics
   - score reasons per clinic

### Failure Flow

If AI extraction fails, times out, or returns invalid schema output:

- the backend falls back to the current deterministic path
- the response should expose that fallback mode for internal observability
- the UI may continue the same animation flow, but with a fallback parse status

## OpenAI Integration Choice

Use the **Responses API** with **Structured Outputs** and strict JSON Schema.

Why:

- OpenAI recommends the Responses API for new builds.
- Structured Outputs with JSON Schema is the correct fit when the model must emit typed, validated data.
- Function calling is not required for this first phase because the model is not using application tools yet.

Official references:

- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript)
- [Responses API `text.format: json_schema`](https://platform.openai.com/docs/api-reference/responses/create?api-mode=responses)
- [Function calling](https://platform.openai.com/docs/guides/function-calling/function-calling-with-structured-outputs)

## Data Contract

The parser output contract should be:

```ts
type ParsedMatchRequest = {
  summary: string
  hard_filters: Array<
    | { type: "therapeutic_area"; therapeutic_area: string; source_text: string }
    | { type: "phase_experience"; phase: string; source_text: string }
    | { type: "equipment"; equipment: string; source_text: string }
    | { type: "certification"; certification: string; source_text: string }
    | { type: "geography"; countries?: string[]; cities?: string[]; source_text: string }
    | { type: "patient_capacity"; min_patients: number; source_text: string }
    | { type: "availability"; start_date?: string; end_date?: string; source_text: string }
  >
  soft_preferences: Array<
    | { type: "therapeutic_area"; therapeutic_area: string; weight: number; source_text: string }
    | { type: "phase_experience"; phase: string; weight: number; source_text: string }
    | { type: "equipment"; equipment: string; weight: number; source_text: string }
    | { type: "certification"; certification: string; weight: number; source_text: string }
    | { type: "geography"; countries?: string[]; cities?: string[]; weight: number; source_text: string }
    | { type: "patient_capacity"; min_patients: number; weight: number; source_text: string }
    | { type: "availability"; start_date?: string; end_date?: string; weight: number; source_text: string }
  >
  unmapped_requirements: Array<{
    text: string
    reason: string
  }>
}
```

## Contract Rules

- `hard_filters` means a clinic must satisfy the rule to remain in the pool.
- `soft_preferences` means a clinic scores higher when it satisfies the rule.
- `weight` should be normalized, for example `0.1` to `1.0`.
- Every structured item must include the exact originating `source_text`.
- Anything unsafe to infer must go into `unmapped_requirements`.
- The model must not create thresholds unless they appear explicitly in the CRO input.

## Architecture

Split the backend into three units plus the route orchestrator.

### 1. `parseMatchRequestWithAI()`

Responsibilities:

- accept CRO free-text and optional project metadata
- call OpenAI Responses API
- request strict JSON Schema output
- validate the returned object locally with Zod
- return parsed structured requirements

Output:

- `ParsedMatchRequest`
- parser metadata such as model name, duration, and success/fallback status

### 2. `applyHardFilters()`

Responsibilities:

- accept the parsed request and clinic dataset
- exclude clinics that fail any hard requirement
- return surviving clinics plus exclusion reasons

This must be pure deterministic application logic.

### 3. `rankClinicsFromPreferences()`

Responsibilities:

- accept surviving clinics and `soft_preferences`
- compute weighted deterministic scores
- generate an explainable score breakdown
- output a stable ranked list

This must also remain pure deterministic application logic.

### 4. `/api/match` orchestrator

Responsibilities:

- load project and clinic data
- call AI parser
- run hard filtering
- run deterministic ranking
- persist results
- return response payload for the animated UI

## Persistence

Preferred persisted data for observability:

- original CRO free-text
- parsed `ParsedMatchRequest`
- unmapped requirements
- parser mode: `ai` or `fallback`
- clinic exclusion reasons
- final per-clinic score breakdown

If schema changes are too large for the first implementation, the minimum acceptable version is:

- return the parsed payload in the API response
- persist final ranking only
- add persistence in a later follow-up phase

## UI Impact

The premium animated matching page should remain the main experience.

Its phases should map to real backend work:

1. interpreting requirements
2. filtering incompatible clinics
3. ranking best-fit clinics

The page should eventually display:

- parsed hard filters
- parsed soft preferences
- unmapped requirements
- how many clinics were excluded
- why each top clinic ranked well

This keeps the animation honest and makes the AI feel useful instead of decorative.

## Error Handling

### AI parsing failure

If OpenAI fails, times out, refuses, or returns invalid schema output:

- validate failure explicitly
- log parser failure metadata
- fall back to the current deterministic pipeline
- return a parse status such as `fallback`

### Partial extraction

If some CRO text cannot be safely mapped:

- keep valid extracted filters/preferences
- move the ambiguous fragments to `unmapped_requirements`
- do not block the match

### Empty survivors

If hard filters remove all clinics:

- return zero matches cleanly
- include exclusion reasons
- let UI present “no clinics met all required criteria”

## Security and Safety

- Do not send unnecessary clinic data into the parser request.
- The parser input should be the CRO free-text plus minimal project context only.
- Ranking and filtering should happen inside the app against trusted DB data.
- Do not let the model produce executable logic or SQL.
- Enforce local schema validation even if Structured Outputs is enabled.

## Testing Strategy

### Unit tests

Add tests for:

- parser schema validation
- invalid AI output fallback handling
- hard-filter behavior
- deterministic ranking behavior

### API tests

Add integration coverage for:

- valid AI parse
- invalid AI parse fallback
- zero surviving clinics after hard filters
- successful ranked output with explanations

### UI tests

Extend the matching flow checks so the CRO page can tolerate:

- parser success
- parser fallback
- zero-result scenarios

## Rollout Strategy

### Phase 1

- add free-text requirement input
- add AI parsing
- keep deterministic filtering and ranking
- keep current animation structure

### Phase 2

- normalize parsed values against app vocabularies
- persist parsed payloads and audit trail more fully
- improve CRO input UX and parsed review UI

### Not in Scope for This Phase

- AI-driven final ranking
- AI-generated threshold assumptions
- autonomous tool-calling against the full database
- clinician-facing AI workflows
- message drafting or inquiry generation by AI

## Implementation Readiness

This phase is ready to move into planning and implementation.

The next implementation should create:

- an OpenAI parser module
- Zod parser schemas
- deterministic hard-filter and ranking modules
- `/api/match` orchestration refactor
- tests for parser, filtering, ranking, and fallback behavior
