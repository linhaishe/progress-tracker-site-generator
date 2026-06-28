# Progress Tracker Site Kit Design

## Purpose

Create a reusable way to install a read-only project tracking site in any project that follows, or wants to adopt, the AI project context package conventions.

The tracking site should answer two questions:

- Where is the whole project in the development lifecycle?
- What does the next agent or developer need to know right now?

This design turns the current progress visualization idea into a static, installable member of an AI Project Kit. It must support installation during project kickoff and later installation after a user initially skipped the option.

## Product Shape

The system is a kit with two related but separately owned capabilities:

- `ai-project-kickoff`: generates the durable project context package.
- `progress-tracker-site`: installs the read-only project tracking site.

`ai-project-kickoff` may offer to install the tracking site, but it does not own the tracking site implementation. It delegates to the generator. This keeps the tracking site usable for existing projects and lets it evolve independently from the kickoff workflow.

## Installation Paths

The tracking site must support three entry points:

1. Kickoff-time install:
   - The kickoff workflow offers the tracking site after generating the context package.
   - If accepted, it invokes the tracking site generator.

2. Later install:
   - A user can run the generator after initially skipping the option.
   - Example: `npx progress-tracker-site init`.

3. Agent-driven later install:
   - A user can ask an agent or skill to add the tracking site to an existing project.
   - The agent invokes the same generator instead of reimplementing file writes.

## Data Sources

The installed site reads two standard markdown files:

- `context/progress-tracker.md`
  - Current handoff state.
  - Current phase, current goal, next workflow, next up, open questions, risks, assumptions, governance notes, session notes, and verification.

- `context/milestone-tracker.md`
  - Overall development progress.
  - Current stage, MVP readiness, release confidence, milestone timeline, current milestone exit criteria, MVP scope checklist, and blockers.

These files have different responsibilities. `progress-tracker.md` is the handoff ledger. `milestone-tracker.md` is the lifecycle and milestone ledger.

## Tracker Sync Policy

`context/milestone-tracker.md` is not automatically generated from `context/progress-tracker.md`.

The progress tracker site reads both files, but v1 does not write either file and does not sync them automatically.

Every workflow that updates `context/progress-tracker.md` must review whether `context/milestone-tracker.md` also needs an update.

Update `context/milestone-tracker.md` when the progress change affects lifecycle state, including:

- Current stage.
- MVP readiness.
- Release confidence.
- Milestone completion.
- Current milestone exit criteria.
- MVP scope.
- Blockers that affect overall delivery.

Do not update `context/milestone-tracker.md` for progress-only changes that do not affect lifecycle state, such as:

- Session notes.
- Command verification notes.
- Local handoff details.
- Open questions that do not affect milestone exit criteria.

The intended behavior is review-triggered synchronization, not automatic synchronization. If a milestone update is skipped after a relevant progress change, record the reason in `context/progress-tracker.md`.

## Generated Site Behavior

The site is read-only in v1.

It must not:

- Write markdown files.
- Create databases.
- Create server or API endpoints for editing.
- Create authentication.
- Send data to external services.
- Infer fake precision such as automatic percent complete unless a future explicit data source supports it.

The site may show checklist counts such as `2 / 7 milestones complete`, but it should avoid implying a precise delivery percentage.

## Project Detection

The generator detects only enough project shape to choose a conservative static output location:

- If the project has a `docs/` directory, generate `docs/progress-tracker.html`.
- Otherwise generate `progress-tracker.html` at the project root.
- If the user passes an explicit output path, use that path.

The generator must not inspect framework dependencies in order to install framework-specific routes. The progress tracker site is a standalone static HTML page, not a Next.js route or app runtime.

## Static HTML Template

Generate one of:

```text
progress-tracker.html
docs/progress-tracker.html
```

Prefer `docs/progress-tracker.html` when the project already has a `docs/` directory.

The static HTML page should:

- Be self-contained.
- Include an embedded snapshot from tracker markdown at generation time when available.
- Use `context/design.md` as the styling source when it exists, translating its tokens, typography, spacing, density, and component conventions into static CSS.
- Fall back to a conservative readable default style only when `context/design.md` is missing or does not define enough visual guidance.
- Allow a user to manually load or paste updated tracker markdown.
- Remain read-only.
- Avoid build tooling.
- Avoid framework dependencies.
- Work by opening the generated HTML file directly in a browser.

## Tracker Skeletons

If `context/progress-tracker.md` is missing, generate the standard progress tracker skeleton.

If `context/milestone-tracker.md` is missing, generate a milestone skeleton with:

```md
# Milestone Tracker

## Overall Status

- Current Stage: Project Kickoff
- MVP Readiness: Not Ready
- Release Confidence: Low
- Last Updated: 2026-06-28

## Milestones

- [x] Project Kickoff
- [ ] Feature Specification
- [ ] Implementation Planning
- [ ] MVP Implementation
- [ ] Verification
- [ ] Review
- [ ] Release Preparation

## Current Milestone

- Name: Project Kickoff
- Status: In Progress
- Exit Criteria:
  - [ ] Context package generated
  - [ ] Context package reviewed
  - [ ] First MVP slice selected

## MVP Scope

- [ ] Agent workbench shell
- [ ] Service case queue
- [ ] AI draft review
- [ ] Supervisor review
- [ ] Audit trail basics

## Blockers

- No blockers recorded.
```

The skeleton is intentionally generic. Users and agents should edit it to match the actual project.

## Conflict and Upgrade Rules

Default behavior is conservative:

- Create missing files.
- Preserve existing tracker files.
- Preserve existing `progress-tracker.html` or `docs/progress-tracker.html` if it was not generated by this tool.
- Skip files with unknown ownership and report conflicts.
- Use generator markers in generated files to identify upgrade-safe files.
- Require `--force` to overwrite generated files.
- Support `--dry-run` to report intended actions without writing files.

Example marker:

```ts
// Generated by progress-tracker-site. Edit with care.
```

## CLI Interface

Primary command:

```bash
npx progress-tracker-site init
```

Useful flags:

```bash
npx progress-tracker-site init --dry-run
npx progress-tracker-site init --force
npx progress-tracker-site init --output docs/progress-tracker.html
npx progress-tracker-site init --root .
```

The command reports:

- Detected project type.
- Created files.
- Existing files.
- Skipped conflicts.
- How to open the generated HTML page.

Example output:

```text
Progress tracker site installed.

Created:
- context/milestone-tracker.md
- docs/progress-tracker.html

Existing:
- context/progress-tracker.md

Open:
docs/progress-tracker.html
```

## AI Project Kit Maintenance Model

Maintain the generator and kickoff workflow as members of one kit rather than fully separate projects.

The current repository should evolve from a single published skill repository into an AI Project Kit repository. The existing skill remains installable and stable, while the progress tracker site becomes a separately owned package inside the same repo.

```text
ai-project-kit/
├─ .claude-plugin/
│  └─ plugin.json
├─ .codex-plugin/
│  └─ plugin.json
├─ skills/
│  └─ ai-project-kickoff/
│     ├─ SKILL.md
│     └─ references/
│        ├─ project-overview.md
│        ├─ architecture-context.md
│        ├─ design.md
│        ├─ progress-tracker.md
│        ├─ milestone-tracker.md
│        ├─ implementation-rules.md
│        ├─ wireframes.md
│        ├─ user-flow.md
│        ├─ screen.md
│        ├─ governance.md
│        ├─ compliance.md
│        ├─ adr-template.md
│        └─ agents.md
├─ packages/
│  └─ progress-tracker-site/
│     ├─ package.json
│     ├─ bin/
│     │  └─ progress-tracker-site.js
│     └─ src/
│        ├─ cli.ts
│        ├─ detect-output-path.ts
│        ├─ install-static.ts
│        ├─ tracker-skeletons.ts
│        └─ file-plan.ts
├─ templates/
│  ├─ context/
│  │  └─ milestone-tracker.md
│  └─ static-progress-page/
│     └─ progress-tracker.html
├─ scripts/
│  ├─ check-release.sh
│  └─ list-skills.sh
└─ docs/
```

The shared contract is the context file convention, not a shared app runtime.

`ai-project-kickoff` integrates with `progress-tracker-site` by invoking it, offering it, and validating that it does not create feature specs, implementation plans, databases, auth, CI, production integrations, or PR artifacts unless separately requested.

## Repository Architecture Adjustment

### Current Published Surface

The repository must continue to publish `ai-project-kickoff` as an installable skill:

- `.claude-plugin/plugin.json` lists `./skills/ai-project-kickoff`.
- `.codex-plugin/plugin.json` exposes `./skills/`.
- `skills/ai-project-kickoff/SKILL.md` remains the model-invoked skill entry point.
- `skills/ai-project-kickoff/references/` remains the only runtime reference directory for kickoff.

This preserves the existing install command:

```bash
npx skills@latest add linhaishe/ai-project-kickoff
```

### New Package Boundary

Add `packages/progress-tracker-site/` as the owner of the site generator. The package owns:

- CLI argument parsing.
- Static output path detection.
- File planning and conflict handling.
- Reading `context/design.md` and translating applicable design rules into static page styling.
- Static HTML fallback installation.
- Generated file markers.
- `--dry-run` and `--force` behavior.

The package must not own kickoff document generation. It consumes the context file convention produced by `ai-project-kickoff`.

### Template Boundary

Add `templates/` as the source of generated files:

- `templates/context/milestone-tracker.md` is the standard milestone tracker skeleton.
- `templates/static-progress-page/` contains the static progress tracker page.
  The static page template must be style-token friendly so the generator can apply `context/design.md` without framework dependencies.

Templates are package inputs, not skill references. The kickoff skill may mention the generator, but should not copy template content into `skills/ai-project-kickoff/references/`.

### Kickoff Skill Integration

Update `ai-project-kickoff` in a narrow way:

- Add `context/milestone-tracker.md` as a conditional output when progress visualization is selected or strict lifecycle tracking is requested.
- Offer the progress tracker site after the context package is generated.
- If the user accepts, instruct the agent to run `npx progress-tracker-site init` or the local package equivalent.
- Do not inline the generator implementation into `SKILL.md`.
- Do not make progress tracker site installation required for ordinary kickoff success.

### Release and Validation

Extend release checks so publishing fails when:

- The skill manifest no longer points to `skills/ai-project-kickoff`.
- Required runtime references are missing.
- `templates/context/milestone-tracker.md` is missing.
- `packages/progress-tracker-site/package.json` is missing after the generator package exists.
- Generated templates contain old project facts.
- `.DS_Store` or local build artifacts enter the package.

The release package may initially remain skill-only until the generator package is implemented. Once `packages/progress-tracker-site/` exists, it should have its own package checks.

## Success Criteria

- A user can skip tracking site installation during kickoff and add it later.
- A user can install the tracking site in an existing project without rerunning kickoff.
- Any project can get a usable static HTML progress tracker page.
- The site displays both current handoff state and overall milestone progress.
- Installation is read-only with respect to runtime behavior.
- Existing project files are not overwritten by default.
- The generated instructions make clear that the page is static and can be opened directly in a browser.

## Non-Goals

- Editable tracker UI.
- GitHub issue synchronization.
- Database-backed project management.
- Automatic release percentage calculation.
- Production deployment of the tracking page.
- Authentication and access control.
- Replacing the durable context package.
