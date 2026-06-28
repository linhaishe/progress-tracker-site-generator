# Progress Tracker Visualization Design

> Superseded by `docs/superpowers/specs/2026-06-28-progress-tracker-site-kit-design.md`.
> This earlier design describes a Next.js `/dev/progress` route and is retained only as historical source material. New implementation should follow the static HTML progress tracker site kit design.

## Summary

Create a read-only `/dev/progress` page that turns `context/progress-tracker.md` into a developer handoff cockpit. The page is not a product-facing customer support feature. It is a dev/AI continuity surface that helps the next agent or developer understand the current phase, next workflow, blockers, risks, assumptions, decisions, and verification state quickly.

## Goals

1. Help the next AI agent or developer understand the project state within 30 seconds.
2. Preserve `context/progress-tracker.md` as the source of truth.
3. Highlight action-oriented handoff information before historical details.
4. Keep the first version read-only and low-risk.
5. Avoid changing the existing `/` customer support workbench.

## Non-Goals

- Do not edit or write back to `context/progress-tracker.md` from the page.
- Do not introduce a database, persistence layer, or live collaboration model.
- Do not add live auto-refresh.
- Do not add auth or permissions beyond clearly naming this as a dev route.
- Do not add charts unless the tracker later contains structured numeric history.
- Do not attempt to parse arbitrary Markdown perfectly.

## User And Use Case

The primary user is the next AI agent or developer taking over the repository. The page should answer:

1. Where are we?
2. What should I do next?
3. What is blocked or risky?
4. Which decisions already constrain me?
5. Can I trust the current state?

The page should be especially useful after context compaction, handoff between agents, or returning to the repo after time away.

## Route

Use `/dev/progress`.

Rationale:

- It is inside the app, so it can reuse the project stack and visual language.
- The `/dev` prefix makes it clear that this is not a customer-facing product feature.
- It can be verified independently from the main `/` workbench.

## Information Architecture

The page should not mirror the Markdown order exactly. It should promote handoff-critical information first, then show the remaining record-oriented sections below.

### Top: Handoff Cockpit

The first viewport should include:

- Header:
  - Page title: `Project Progress`
  - Source path: `context/progress-tracker.md`
  - Read-only badge
  - Last read/generated time when available
- Hero status block:
  - `Current Phase`
  - `Current Goal`
  - `Recommended Next Workflow`
- Signal cards:
  - `Next Up`
  - `Open Questions`
  - `Verification`
- Right rail or secondary column:
  - `Risks`
  - `Governance, Compliance, and Review Notes`
  - `Assumptions`

### Bottom: Structured Detail

Below the cockpit, show fuller sections:

- `Completed`
- `In Progress`
- `Architecture Decisions`
- `Session Notes`
- Full `Open Questions`, `Risks`, and `Assumptions` when the cockpit truncates them.
- `Other Notes` for unknown sections.

## Data Flow

1. `/dev/progress` reads `context/progress-tracker.md` on the server.
2. A small parser splits the file by level-two headings (`##`).
3. Known headings map to named page sections.
4. Unknown headings are preserved and rendered in `Other Notes`.
5. The page renders structured content read-only.

Known sections:

- `Current Phase`
- `Current Goal`
- `Completed`
- `In Progress`
- `Next Up`
- `Open Questions`
- `Assumptions`
- `Architecture Decisions`
- `Governance, Compliance, and Review Notes`
- `Risks`
- `Session Notes`
- `Verification`
- `Recommended Next Workflow`

## Missing And Empty Sections

Missing or empty sections are handoff information and should not silently disappear.

- Missing critical section: show a quiet warning card, for example `Missing Verification section in progress tracker.`
- Empty section: show an empty-state line, for example `No in-progress work recorded.`
- Missing file: show a page-level error with the expected path.
- Parse fallback: if section parsing fails, show a readable source preview and a warning that structured parsing failed.

## Visual Direction

Follow `context/design.md`:

- Warm paper-like surface.
- Dense operational dashboard layout.
- Crisp borders, modest radius, minimal shadow.
- Amber primary accents only where they help orientation.
- Serious tone for risks, governance, compliance, and verification.

The page should feel like a cockpit or status board, not a marketing page and not a customer support workflow.

## Components

Recommended component structure:

- `ProgressPage`
  - server page for `/dev/progress`
  - reads Markdown
  - passes parsed model into the view
- `parseProgressTracker`
  - pure parser for known sections and unknown fallback
  - can later receive unit tests
- `ProgressCockpit`
  - top handoff summary
- `SignalCard`
  - small cards for next-up, questions, verification, risks
- `SectionList`
  - repeated renderer for Markdown bullet sections
- `MissingSectionNotice`
  - quiet warning for missing expected sections

Keep the parser separate from visual components so it can be tested independently and changed without rewriting the page.

## Error Handling

- If the file cannot be read, render a dev-facing error page with:
  - expected file path
  - short explanation
  - no stack trace in the UI
- If a known section is missing, show a warning in that section slot.
- If a section is present but empty, show a neutral empty state.
- If unknown sections exist, preserve them under `Other Notes`.

## Testing And Verification

Implementation should verify:

- `/dev/progress` renders from the current `context/progress-tracker.md`.
- Missing or empty sections produce readable warnings or empty states.
- Unknown sections are not discarded.
- No horizontal overflow on mobile.
- The normal `/` customer support workbench remains unchanged.
- `npm run lint` passes.
- `npm run build` passes.

If test tooling is added later, add focused tests for `parseProgressTracker`.

## Scope Boundaries

MVP should not depend on:

- database access
- API routes
- browser-only Markdown parsing
- editing controls
- generated charts
- authentication changes
- changes to the current customer support workbench

## Open Questions

- Should a later version add a collapsible raw Markdown source view?
- Should `/dev/progress` eventually be hidden behind an environment flag in production?
- Should future trackers use frontmatter or structured metadata for stronger parsing?

## Approved Direction

The selected approach is the **Handoff Cockpit** layout:

- Read-only.
- Dev route at `/dev/progress`.
- Source-of-truth remains `context/progress-tracker.md`.
- First screen prioritizes next workflow, open questions, risks, and verification over historical detail.
