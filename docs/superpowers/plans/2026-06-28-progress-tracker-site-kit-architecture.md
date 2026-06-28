# Progress Tracker Site Kit Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adjust this repository from a single skill source repo into an AI Project Kit repo that still publishes `ai-project-kickoff` while preparing a separately owned `progress-tracker-site` generator.

**Architecture:** Keep the skill stable under `skills/ai-project-kickoff/`. Add package and template boundaries for the future progress tracker site generator without moving runtime kickoff references into package code. The shared contract is the `context/*.md` convention, especially `progress-tracker.md` and `milestone-tracker.md`.

**Tech Stack:** Agent Skills manifest layout, shell release checks, Node package skeleton for the future CLI, Markdown templates.

---

## Scope

This plan implements the repository architecture adjustment only. It does not implement the full `progress-tracker-site` static page generator behavior yet.

Included:

- Add a milestone tracker blueprint to the kickoff skill.
- Update `ai-project-kickoff` outputs and steps to know about milestone tracking and optional progress site install.
- Add `packages/progress-tracker-site/` as a package skeleton.
- Add `templates/` as the generator template boundary.
- Extend release checks for the new architecture.
- Update README/maintenance docs to explain the kit structure.

Not included:

- Full static HTML generator implementation.
- npm publishing setup for `progress-tracker-site`.
- Automated tests for generator internals.
- Running generated site visual QA.

## File Structure

- Modify `skills/ai-project-kickoff/SKILL.md`
  - Add `context/milestone-tracker.md` as a conditional output.
  - Add optional progress tracker site offering after progress docs are created.
- Create `skills/ai-project-kickoff/references/milestone-tracker.md`
  - Runtime blueprint for `context/milestone-tracker.md`.
- Create `packages/progress-tracker-site/package.json`
  - Package identity and future CLI entry.
- Create `packages/progress-tracker-site/src/README.md`
  - Internal package boundary notes until implementation begins.
- Create `templates/context/milestone-tracker.md`
  - Generator-owned copy of the milestone tracker skeleton.
- Create `templates/static-progress-page/README.md`
  - Template boundary placeholder for the future static progress page.
- Modify `scripts/check-release.sh`
  - Require the milestone tracker blueprint and template.
  - Check package skeleton once the package directory exists.
- Modify `README.md`
  - Explain the AI Project Kit layout.
- Modify `CLAUDE.md`
  - Record ownership boundaries for `skills/`, `packages/`, and `templates/`.

## Context To Read Before Implementation

- `docs/superpowers/specs/2026-06-28-progress-tracker-site-kit-design.md`
- `skills/ai-project-kickoff/SKILL.md`
- `skills/ai-project-kickoff/references/progress-tracker.md`
- `scripts/check-release.sh`
- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `README.md`
- `CLAUDE.md`

## Task 1: Add Milestone Tracker Blueprint

**Files:**

- Create: `skills/ai-project-kickoff/references/milestone-tracker.md`

- [ ] **Step 1: Create the milestone tracker blueprint**

Create `skills/ai-project-kickoff/references/milestone-tracker.md` with this content:

````md
# Milestone Tracker Blueprint

Use this blueprint to create `context/milestone-tracker.md` when lifecycle progress tracking is requested, when strict mode needs milestone visibility, or when the progress tracker site is installed.
Replace every bracketed prompt with project-specific lifecycle state.
Do not copy milestones, feature names, dates, or readiness claims from previous projects.

```md
# Milestone Tracker

## Overall Status

- Current Stage: [Project Kickoff / Feature Specification / Implementation Planning / MVP Implementation / Verification / Review / Release Preparation]
- MVP Readiness: [Not Ready / Partially Ready / Ready for Verification / Ready for Release]
- Release Confidence: [Low / Medium / High]
- Last Updated: [YYYY-MM-DD]

## Milestones

- [x] Project Kickoff
- [ ] Feature Specification
- [ ] Implementation Planning
- [ ] MVP Implementation
- [ ] Verification
- [ ] Review
- [ ] Release Preparation

## Current Milestone

- Name: [Milestone name]
- Status: [Not Started / In Progress / Blocked / Complete]
- Exit Criteria:
  - [ ] [Concrete condition that proves this milestone is complete]
  - [ ] [Concrete condition that proves this milestone is complete]
  - [ ] [Concrete condition that proves this milestone is complete]

## MVP Scope

- [ ] [MVP capability, workflow, role, integration, or quality gate]
- [ ] [MVP capability, workflow, role, integration, or quality gate]
- [ ] [MVP capability, workflow, role, integration, or quality gate]

## Blockers

- [Blocker, owner, and what progress it blocks, or "No blockers recorded."]

## Milestone Notes

- [Decision, assumption, or lifecycle note that affects planning.]
```
````

- [ ] **Step 2: Verify the blueprint is discoverable**

Run:

```bash
test -f skills/ai-project-kickoff/references/milestone-tracker.md
```

Expected: exits `0`.

- [ ] **Step 3: Commit the blueprint**

Run:

```bash
git add skills/ai-project-kickoff/references/milestone-tracker.md
git commit -m "feat: add milestone tracker blueprint"
```

Expected: commit contains only the new milestone tracker blueprint.

## Task 2: Update Kickoff Skill Integration

**Files:**

- Modify: `skills/ai-project-kickoff/SKILL.md`

- [ ] **Step 1: Add milestone tracker to conditional outputs**

In `skills/ai-project-kickoff/SKILL.md`, under `Conditional output:`, add:

```md
- `context/milestone-tracker.md`: see `references/milestone-tracker.md`.
```

Expected nearby output block:

```md
Conditional output:

- `context/milestone-tracker.md`: see `references/milestone-tracker.md`.
- `prototypes/user-flow.md`: see `references/user-flow.md`.
- `prototypes/screens/*.md`: see `references/screen.md`.
- `context/governance.md`: see `references/governance.md`.
- `context/compliance.md`: see `references/compliance.md`.
- `context/adr/NNNN-short-title.md`: see `references/adr-template.md`.
```

- [ ] **Step 2: Load milestone blueprint when progress visualization is selected**

In Step 11, after `Read references/progress-tracker.md`, add:

```md
   - Read `references/milestone-tracker.md` when lifecycle progress tracking is requested, strict mode needs milestone visibility, or the user accepts progress tracker site installation.
```

- [ ] **Step 3: Add optional progress site offer**

After Step 11, add a new step:

```md
12. Offer progress tracker site installation
   - After progress docs are created, ask whether to install the optional read-only progress tracker site.
   - If accepted, invoke the external generator: `npx progress-tracker-site init`.
   - If skipped, record the skip decision in `context/progress-tracker.md`.
   - Do not treat site installation as required for kickoff success.
   - Done when the install choice is completed or recorded as skipped.
```

Then renumber the later review/output/transition steps.

- [ ] **Step 4: Update validation criteria**

In the validation step, add this check:

```md
   - Check missing milestone tracker when lifecycle progress tracking or progress site installation was selected.
```

- [ ] **Step 5: Verify internal references**

Run:

```bash
rg -n "milestone-tracker|progress tracker site|progress-tracker-site" skills/ai-project-kickoff/SKILL.md
```

Expected: output includes the conditional output, Step 11 milestone blueprint read, optional site install step, and validation check.

- [ ] **Step 6: Commit kickoff integration**

Run:

```bash
git add skills/ai-project-kickoff/SKILL.md
git commit -m "feat: integrate optional progress tracker site kickoff"
```

Expected: commit contains only `skills/ai-project-kickoff/SKILL.md`.

## Task 3: Add Generator Package Skeleton

**Files:**

- Create: `packages/progress-tracker-site/package.json`
- Create: `packages/progress-tracker-site/src/README.md`

- [ ] **Step 1: Create package manifest**

Create `packages/progress-tracker-site/package.json` with this content:

```json
{
  "name": "progress-tracker-site",
  "version": "0.1.0",
  "description": "Install a read-only project progress tracker site from standard context markdown files.",
  "license": "MIT",
  "private": true,
  "bin": {
    "progress-tracker-site": "./bin/progress-tracker-site.js"
  },
  "files": [
    "bin/",
    "src/"
  ],
  "scripts": {
    "check": "node -e \"console.log('progress-tracker-site package scaffold present')\""
  }
}
```

- [ ] **Step 2: Create package boundary README**

Create `packages/progress-tracker-site/src/README.md` with this content:

```md
# progress-tracker-site package

This package owns the future `progress-tracker-site` generator.

It will own:

- CLI argument parsing.
- Project detection.
- File planning and conflict handling.
- Static HTML progress page installation.
- `--dry-run` and `--force` behavior.

It consumes repo-level templates from:

- `templates/context/`
- `templates/static-progress-page/`

It does not own:

- `ai-project-kickoff` skill orchestration.
- Product context generation.
- Editing tracker markdown from the installed site.
- Databases, auth, production deployment, CI, or external service integrations.
```

- [ ] **Step 3: Verify package files**

Run:

```bash
test -f packages/progress-tracker-site/package.json
test -f packages/progress-tracker-site/src/README.md
```

Expected: both commands exit `0`.

- [ ] **Step 4: Commit package skeleton**

Run:

```bash
git add packages/progress-tracker-site
git commit -m "chore: add progress tracker site package skeleton"
```

Expected: commit contains only `packages/progress-tracker-site`.

## Task 4: Add Template Boundaries

**Files:**

- Create: `templates/context/milestone-tracker.md`
- Create: `templates/static-progress-page/README.md`

- [ ] **Step 1: Create generator milestone template**

Create `templates/context/milestone-tracker.md` with this content:

```md
# Milestone Tracker

## Overall Status

- Current Stage: Project Kickoff
- MVP Readiness: Not Ready
- Release Confidence: Low
- Last Updated: [YYYY-MM-DD]

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

- [ ] Primary user flow documented
- [ ] MVP feature scope confirmed
- [ ] Architecture boundaries documented
- [ ] Design direction documented
- [ ] Verification expectations documented

## Blockers

- No blockers recorded.

## Milestone Notes

- This skeleton is generic. Replace it with project-specific milestones before implementation planning.
```

- [ ] **Step 2: Create static page template README**

Create `templates/static-progress-page/README.md` with this content:

```md
# Static Progress Page Template

This directory will contain the generated static progress tracker page.

The generated HTML must be self-contained, read-only, usable without build tooling, and openable directly in a browser.
```

- [ ] **Step 3: Verify template files**

Run:

```bash
test -f templates/context/milestone-tracker.md
test -f templates/static-progress-page/README.md
```

Expected: all commands exit `0`.

- [ ] **Step 4: Commit templates**

Run:

```bash
git add templates
git commit -m "chore: add progress tracker site template boundaries"
```

Expected: commit contains only `templates`.

## Task 5: Extend Release Checks

**Files:**

- Modify: `scripts/check-release.sh`

- [ ] **Step 1: Add required architecture files**

In `scripts/check-release.sh`, add these paths to the `required` array:

```bash
  "skills/ai-project-kickoff/references/milestone-tracker.md"
  "templates/context/milestone-tracker.md"
  "templates/static-progress-page/README.md"
```

- [ ] **Step 2: Add conditional package skeleton check**

After the required file loop, add:

```bash
if [ -d "packages/progress-tracker-site" ]; then
  package_required=(
    "packages/progress-tracker-site/package.json"
    "packages/progress-tracker-site/src/README.md"
  )

  for file in "${package_required[@]}"; do
    if [ ! -f "$file" ]; then
      echo "missing progress tracker site package file: $file" >&2
      exit 1
    fi
  done
fi
```

- [ ] **Step 3: Extend old project keyword scan to templates**

Change:

```bash
if grep -R -n -E 'Ghost AI|Stripe|Feature 29|code-standards|ai-workflow-rules|working-issue' skills/ai-project-kickoff README.md; then
```

To:

```bash
if grep -R -n -E 'Ghost AI|Stripe|Feature 29|code-standards|ai-workflow-rules|working-issue' skills/ai-project-kickoff templates README.md; then
```

- [ ] **Step 4: Run release check**

Run:

```bash
bash scripts/check-release.sh
```

Expected: `release package checks passed`.

- [ ] **Step 5: Commit release checks**

Run:

```bash
git add scripts/check-release.sh
git commit -m "chore: extend release checks for project kit architecture"
```

Expected: commit contains only `scripts/check-release.sh`.

## Task 6: Update Public and Maintainer Docs

**Files:**

- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add kit layout to README**

In `README.md`, after the install section, add:

```md
## Repository Layout

This repository is structured as an AI Project Kit:

- `skills/ai-project-kickoff/` publishes the kickoff skill.
- `packages/progress-tracker-site/` owns the future read-only static progress tracker page generator.
- `templates/` owns files generated by the progress tracker site package.
- `skill-design/` contains author notes and source examples; runtime steps must not depend on it.
- `docs/superpowers/` contains design specs and implementation plans.
```

- [ ] **Step 2: Add package/template rules to CLAUDE.md**

In `CLAUDE.md`, add:

```md
## AI Project Kit Boundaries

- `skills/ai-project-kickoff/` is the published skill. Keep it installable through the plugin manifests.
- `packages/progress-tracker-site/` is the static page generator package boundary. Do not put generator implementation inside the kickoff skill.
- `templates/` is the source for generated tracker site files. Do not treat these templates as runtime skill references.
- The shared contract is the context markdown convention, not a shared application runtime.
```

- [ ] **Step 3: Run release check**

Run:

```bash
bash scripts/check-release.sh
```

Expected: `release package checks passed`.

- [ ] **Step 4: Commit docs**

Run:

```bash
git add README.md CLAUDE.md
git commit -m "docs: document project kit repository layout"
```

Expected: commit contains only `README.md` and `CLAUDE.md`.

## Final Verification

- [ ] Run:

```bash
bash scripts/list-skills.sh
```

Expected:

```text
skills/ai-project-kickoff/SKILL.md
```

- [ ] Run:

```bash
bash scripts/check-release.sh
```

Expected:

```text
release package checks passed
```

- [ ] Run:

```bash
git status --short
```

Expected: only intentional uncommitted changes remain, or a clean working tree if every task was committed.

## Self-Review

Spec coverage:

- The plan preserves the published `ai-project-kickoff` skill.
- The plan creates the `packages/progress-tracker-site/` package boundary.
- The plan creates the `templates/` boundary.
- The plan adds milestone tracker support to the kickoff context package.
- The plan keeps progress tracker site installation optional.
- The plan updates release validation for the new architecture.

Residual gaps:

- Full static page generator implementation remains a follow-up plan.
- Static HTML template implementation remains a follow-up plan.
