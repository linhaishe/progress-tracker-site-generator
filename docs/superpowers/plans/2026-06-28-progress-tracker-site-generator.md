# Progress Tracker Site Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@linhaishe/progress-tracker-site`, an npm CLI that installs a self-contained read-only static progress dashboard from standard tracker markdown files.

**Architecture:** Use a small TypeScript CLI with focused pure modules for output path detection, file planning, markdown parsing, and HTML rendering. The generated page embeds a snapshot at generation time and includes browser-only controls for pasted or file-loaded markdown refresh without writing back to disk.

**Tech Stack:** Node.js 20+, TypeScript, Vitest, npm package bin, static HTML/CSS/JS.

---

## File Structure

- Create `package.json`
  - Package metadata, `bin`, build/test scripts, runtime and dev dependencies.
- Create `tsconfig.json`
  - TypeScript settings for Node ESM output.
- Create `vitest.config.ts`
  - Vitest config for unit tests.
- Create `bin/progress-tracker-site.js`
  - Executable shim that imports the compiled CLI.
- Create `src/cli.ts`
  - CLI argument parsing and command dispatch.
- Create `src/commands/init.ts`
  - `init` command orchestration: plan files, write files, report result.
- Create `src/core/output-path.ts`
  - Decide default or explicit output path.
- Create `src/core/ownership.ts`
  - Detect generated HTML marker.
- Create `src/core/file-plan.ts`
  - Build a deterministic file action plan for create/preserve/overwrite/skip.
- Create `src/trackers/parse-markdown.ts`
  - Shared heading and checklist parser helpers.
- Create `src/trackers/parse-progress-tracker.ts`
  - Progress tracker model parser.
- Create `src/trackers/parse-milestone-tracker.ts`
  - Milestone tracker model parser.
- Create `src/trackers/skeletons.ts`
  - Standard skeleton markdown loaders.
- Create `src/render/render-page.ts`
  - Render the self-contained dashboard HTML.
- Create `src/render/page-script.ts`
  - Browser-side refresh script as a string.
- Create `src/render/page-styles.ts`
  - Static CSS based on the cleaned generic design template.
- Create `templates/context/progress-tracker.md`
  - Generic progress tracker skeleton.
- Modify `templates/context/milestone-tracker.md`
  - Keep generic milestone tracker skeleton.
- Modify `templates/context/design.md`
  - Remove project-specific content and keep generic design tokens/rules.
- Create tests under `tests/`
  - Unit tests for path detection, ownership, file planning, parsers, and rendering.
- Modify or create `README.md`
  - Package usage and generated page behavior.

## Task 1: Create Package Foundation

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `bin/progress-tracker-site.js`

- [ ] **Step 1: Create package manifest**

Create `package.json`:

```json
{
  "name": "@linhaishe/progress-tracker-site",
  "version": "0.1.0",
  "description": "Install a read-only static project progress dashboard from context tracker markdown files.",
  "license": "MIT",
  "type": "module",
  "bin": {
    "progress-tracker-site": "./bin/progress-tracker-site.js"
  },
  "files": [
    "bin/",
    "dist/",
    "templates/"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "check": "npm run build && npm run test"
  },
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "@types/node": "^20.19.0",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create executable shim**

Create `bin/progress-tracker-site.js`:

```js
#!/usr/bin/env node
import { main } from "../dist/cli.js";

main(process.argv.slice(2)).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
```

Run:

```bash
chmod +x bin/progress-tracker-site.js
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected:

- `node_modules/` exists.
- `package-lock.json` is created.

- [ ] **Step 6: Run baseline checks**

Run:

```bash
npm run build
npm run test
```

Expected:

- Build fails only because `src/cli.ts` does not exist yet.
- Test command reports no tests or exits according to Vitest's default no-test behavior.

- [ ] **Step 7: Commit package foundation when possible**

Run:

```bash
git rev-parse --is-inside-work-tree
```

If the command exits `0`, run:

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts bin/progress-tracker-site.js
git commit -m "chore: add package foundation"
```

If the command exits non-zero, record in the implementation notes that commits were skipped because the directory is not a git repository.

## Task 2: Clean Generic Templates

**Files:**

- Modify: `templates/context/design.md`
- Create: `templates/context/progress-tracker.md`
- Modify: `templates/context/milestone-tracker.md`

- [ ] **Step 1: Replace design template with generic progress dashboard guidance**

Replace `templates/context/design.md` with:

```md
---
version: alpha
name: "Progress Tracker Dashboard Design Direction"
status: "Generic template"
---

# Design

## Overview

The generated progress tracker page should feel like a dense operational dashboard for developers and AI agents returning to a project. It should be fast to scan, careful around risk, and optimized for handoff clarity rather than presentation or marketing.

## Theme Tokens

### Colors

| Token | Value | Role |
| ----- | ----- | ---- |
| `background` | `#EEEFE9` | Warm page background |
| `surface` | `#FDFDF8` | Panels and controls |
| `muted-surface` | `#F4F4F0` | Metadata and evidence blocks |
| `text` | `#111827` | Primary headings |
| `body-text` | `#374151` | Body content |
| `muted-text` | `#65675E` | Captions and timestamps |
| `border` | `#D2D3CC` | Dividers and panel borders |
| `primary` | `#EB9D2A` | Orientation accent |
| `primary-shadow` | `#CD8407` | Optional accent depth |
| `danger` | `#F35454` | High-risk or blocked state |
| `warning` | `#F7A501` | Attention or stale state |
| `success` | `#36C46F` | Confirmed complete state |
| `info` | `#30ABC6` | Informational state |

### Typography

| Role | Font | Size | Weight | Line Height |
| ---- | ---- | ---- | ------ | ----------- |
| Page title | `Arial, Helvetica, sans-serif` | `24px` | `700` | `32px` |
| Section heading | `Arial, Helvetica, sans-serif` | `18px` to `21px` | `700` | `28px` to `30px` |
| Body | `Arial, Helvetica, sans-serif` | `14px` to `15px` | `400` | `22px` to `24px` |
| Label | `Arial, Helvetica, sans-serif` | `12px` to `14px` | `600` to `700` | `16px` to `20px` |
| Caption | `Arial, Helvetica, sans-serif` | `12px` | `500` | `16px` |

## Layout Rules

- Use a full-width app shell with a readable max width around `1760px`.
- Use 4px increments and an 8px rhythm for panels and controls.
- Use dense spacing: `12px` to `20px` gaps between related blocks.
- Prefer borders and surface changes over shadows.
- Use cards only for repeated information modules.
- Keep cards at `8px` radius or less.
- Desktop should use a primary cockpit column and a secondary right rail.
- Mobile should stack all regions without horizontal overflow.

## Component Rules

- The first screen should be the usable progress dashboard, not a landing page.
- The dashboard should prioritize current focus, next workflow, risks, blockers, and verification.
- Amber should orient the reader, not dominate the page.
- Warnings, blockers, and verification gaps should be visually serious and easy to find.
- Missing or empty tracker sections should appear as quiet notices rather than disappearing.
- Manual refresh controls should feel secondary to the dashboard content.
```

- [ ] **Step 2: Create progress tracker skeleton**

Create `templates/context/progress-tracker.md`:

```md
# Progress Tracker

## Current Phase

- Project Kickoff

## Current Goal

- Establish the project context and select the next implementation slice.

## Recommended Next Workflow

- Review tracker files, confirm scope, then write an implementation plan.

## Next Up

- [ ] Confirm the immediate implementation slice.
- [ ] Write an implementation plan.
- [ ] Run verification after implementation.

## In Progress

- No in-progress work recorded.

## Completed

- No completed work recorded.

## Open Questions

- No open questions recorded.

## Assumptions

- No assumptions recorded.

## Risks

- No risks recorded.

## Architecture Decisions

- No architecture decisions recorded.

## Governance, Compliance, and Review Notes

- No review notes recorded.

## Session Notes

- Tracker initialized.

## Verification

- No verification run recorded.
```

- [ ] **Step 3: Ensure milestone template stays generic**

Verify `templates/context/milestone-tracker.md` contains no project-specific names:

```bash
rg -n "Tianmao|PostHog|customer service|AI support|Ghost AI|Stripe|Feature 29" templates/context/milestone-tracker.md
```

Expected: no output.

- [ ] **Step 4: Commit template cleanup when possible**

If git is initialized, run:

```bash
git add templates/context/design.md templates/context/progress-tracker.md templates/context/milestone-tracker.md
git commit -m "chore: add generic tracker templates"
```

If git is not initialized, record that commits were skipped.

## Task 3: Add Output Path And Ownership Modules

**Files:**

- Create: `src/core/output-path.ts`
- Create: `src/core/ownership.ts`
- Test: `tests/core/output-path.test.ts`
- Test: `tests/core/ownership.test.ts`

- [ ] **Step 1: Write output path tests**

Create `tests/core/output-path.test.ts`:

```ts
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { resolveOutputPath } from "../../src/core/output-path.js";

let roots: string[] = [];

async function tempRoot() {
  const root = await mkdtemp(join(tmpdir(), "progress-site-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  roots = [];
});

describe("resolveOutputPath", () => {
  it("uses docs/progress-tracker.html when docs exists", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "docs"));

    expect(await resolveOutputPath({ root })).toBe(join(root, "docs", "progress-tracker.html"));
  });

  it("uses root progress-tracker.html when docs is missing", async () => {
    const root = await tempRoot();

    expect(await resolveOutputPath({ root })).toBe(join(root, "progress-tracker.html"));
  });

  it("resolves explicit output relative to root", async () => {
    const root = await tempRoot();

    expect(await resolveOutputPath({ root, output: "public/status.html" })).toBe(join(root, "public", "status.html"));
  });
});
```

- [ ] **Step 2: Write ownership tests**

Create `tests/core/ownership.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GENERATED_MARKER, isGeneratedHtml } from "../../src/core/ownership.js";

describe("isGeneratedHtml", () => {
  it("detects files generated by this package", () => {
    expect(isGeneratedHtml(`<!doctype html>\n${GENERATED_MARKER}\n<title>Project Progress</title>`)).toBe(true);
  });

  it("rejects unrelated html files", () => {
    expect(isGeneratedHtml("<!doctype html><title>Existing docs</title>")).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests and verify failure**

Run:

```bash
npm run test -- tests/core/output-path.test.ts tests/core/ownership.test.ts
```

Expected:

- Tests fail because `src/core/output-path.ts` and `src/core/ownership.ts` do not exist.

- [ ] **Step 4: Implement output path module**

Create `src/core/output-path.ts`:

```ts
import { access } from "node:fs/promises";
import { join, resolve } from "node:path";

async function pathExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export type ResolveOutputPathOptions = {
  root: string;
  output?: string;
};

export async function resolveOutputPath(options: ResolveOutputPathOptions) {
  const root = resolve(options.root);

  if (options.output) {
    return resolve(root, options.output);
  }

  const docsPath = join(root, "docs");
  if (await pathExists(docsPath)) {
    return join(docsPath, "progress-tracker.html");
  }

  return join(root, "progress-tracker.html");
}
```

- [ ] **Step 5: Implement ownership module**

Create `src/core/ownership.ts`:

```ts
export const GENERATED_MARKER = "<!-- Generated by @linhaishe/progress-tracker-site. -->";

export function isGeneratedHtml(content: string) {
  return content.includes(GENERATED_MARKER);
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm run test -- tests/core/output-path.test.ts tests/core/ownership.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit core detection modules when possible**

If git is initialized, run:

```bash
git add src/core/output-path.ts src/core/ownership.ts tests/core/output-path.test.ts tests/core/ownership.test.ts
git commit -m "feat: add output path and ownership detection"
```

If git is not initialized, record that commits were skipped.

## Task 4: Add Tracker Parsers

**Files:**

- Create: `src/trackers/parse-markdown.ts`
- Create: `src/trackers/parse-progress-tracker.ts`
- Create: `src/trackers/parse-milestone-tracker.ts`
- Test: `tests/trackers/parse-progress-tracker.test.ts`
- Test: `tests/trackers/parse-milestone-tracker.test.ts`

- [ ] **Step 1: Write progress parser tests**

Create `tests/trackers/parse-progress-tracker.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseProgressTracker } from "../../src/trackers/parse-progress-tracker.js";

describe("parseProgressTracker", () => {
  it("parses known sections and unknown sections", () => {
    const tracker = parseProgressTracker(`# Progress Tracker

## Current Phase

- Implementation Planning

## Current Goal

- Build the generator.

## Next Up

- [ ] Add parser
- [x] Approve design

## Custom Notes

- Keep this note.
`);

    expect(tracker.title).toBe("Progress Tracker");
    expect(tracker.sections.currentPhase.items).toEqual(["Implementation Planning"]);
    expect(tracker.sections.currentGoal.items).toEqual(["Build the generator."]);
    expect(tracker.sections.nextUp.checklist).toEqual([
      { checked: false, text: "Add parser" },
      { checked: true, text: "Approve design" },
    ]);
    expect(tracker.unknownSections).toEqual([{ title: "Custom Notes", items: ["Keep this note."] }]);
  });
});
```

- [ ] **Step 2: Write milestone parser tests**

Create `tests/trackers/parse-milestone-tracker.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseMilestoneTracker } from "../../src/trackers/parse-milestone-tracker.js";

describe("parseMilestoneTracker", () => {
  it("parses status fields and checklist counts", () => {
    const tracker = parseMilestoneTracker(`# Milestone Tracker

## Overall Status

- Current Stage: Implementation Planning
- MVP Readiness: Not Ready
- Release Confidence: Medium

## Milestones

- [x] Project Kickoff
- [ ] Implementation Planning

## Blockers

- No blockers recorded.
`);

    expect(tracker.title).toBe("Milestone Tracker");
    expect(tracker.overallStatus).toEqual({
      currentStage: "Implementation Planning",
      mvpReadiness: "Not Ready",
      releaseConfidence: "Medium",
    });
    expect(tracker.sections.milestones.checklist).toEqual([
      { checked: true, text: "Project Kickoff" },
      { checked: false, text: "Implementation Planning" },
    ]);
    expect(tracker.milestoneCounts).toEqual({ complete: 1, total: 2 });
    expect(tracker.sections.blockers.items).toEqual(["No blockers recorded."]);
  });
});
```

- [ ] **Step 3: Run parser tests and verify failure**

Run:

```bash
npm run test -- tests/trackers/parse-progress-tracker.test.ts tests/trackers/parse-milestone-tracker.test.ts
```

Expected: tests fail because parser modules do not exist.

- [ ] **Step 4: Implement shared markdown parser**

Create `src/trackers/parse-markdown.ts`:

```ts
export type ChecklistItem = {
  checked: boolean;
  text: string;
};

export type MarkdownSection = {
  title: string;
  raw: string;
  items: string[];
  checklist: ChecklistItem[];
};

export function normalizeSectionKey(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

export function parseMarkdownSections(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const title = normalized.match(/^#\s+(.+)$/m)?.[1]?.trim() || "Tracker";
  const headingMatches = Array.from(normalized.matchAll(/^##\s+(.+)$/gm));
  const sections: MarkdownSection[] = headingMatches.map((match, index) => {
    const next = headingMatches[index + 1];
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? normalized.length;
    const raw = normalized.slice(start, end).trim();
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      title: match[1]?.trim() || "Untitled Section",
      raw,
      items: lines.map((line) => line.replace(/^[-*]\s+/, "").replace(/^\[[ xX]\]\s+/, "")),
      checklist: lines
        .map((line) => line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/))
        .filter((lineMatch): lineMatch is RegExpMatchArray => Boolean(lineMatch))
        .map((lineMatch) => ({
          checked: lineMatch[1]?.toLowerCase() === "x",
          text: lineMatch[2]?.trim() || "",
        })),
    };
  });

  return { title, sections };
}

export function parseLabelValueItems(items: string[]) {
  const result: Record<string, string> = {};

  for (const item of items) {
    const match = item.match(/^([^:]+):\s*(.+)$/);
    if (match?.[1] && match[2]) {
      result[normalizeSectionKey(match[1])] = match[2].trim();
    }
  }

  return result;
}
```

- [ ] **Step 5: Implement progress tracker parser**

Create `src/trackers/parse-progress-tracker.ts`:

```ts
import { normalizeSectionKey, parseMarkdownSections, type MarkdownSection } from "./parse-markdown.js";

export type ProgressSectionKey =
  | "currentPhase"
  | "currentGoal"
  | "recommendedNextWorkflow"
  | "nextUp"
  | "inProgress"
  | "completed"
  | "openQuestions"
  | "assumptions"
  | "risks"
  | "architectureDecisions"
  | "governanceComplianceAndReviewNotes"
  | "sessionNotes"
  | "verification";

export type ParsedProgressTracker = {
  title: string;
  sections: Partial<Record<ProgressSectionKey, MarkdownSection>>;
  unknownSections: Array<Pick<MarkdownSection, "title" | "items">>;
};

const knownKeys = new Set<ProgressSectionKey>([
  "currentPhase",
  "currentGoal",
  "recommendedNextWorkflow",
  "nextUp",
  "inProgress",
  "completed",
  "openQuestions",
  "assumptions",
  "risks",
  "architectureDecisions",
  "governanceComplianceAndReviewNotes",
  "sessionNotes",
  "verification",
]);

export function parseProgressTracker(markdown: string): ParsedProgressTracker {
  const parsed = parseMarkdownSections(markdown);
  const sections: Partial<Record<ProgressSectionKey, MarkdownSection>> = {};
  const unknownSections: Array<Pick<MarkdownSection, "title" | "items">> = [];

  for (const section of parsed.sections) {
    const key = normalizeSectionKey(section.title) as ProgressSectionKey;
    if (knownKeys.has(key)) {
      sections[key] = section;
    } else {
      unknownSections.push({ title: section.title, items: section.items });
    }
  }

  return { title: parsed.title, sections, unknownSections };
}
```

- [ ] **Step 6: Implement milestone tracker parser**

Create `src/trackers/parse-milestone-tracker.ts`:

```ts
import { normalizeSectionKey, parseLabelValueItems, parseMarkdownSections, type MarkdownSection } from "./parse-markdown.js";

export type MilestoneSectionKey =
  | "overallStatus"
  | "milestones"
  | "currentMilestone"
  | "mvpScope"
  | "blockers"
  | "milestoneNotes";

export type ParsedMilestoneTracker = {
  title: string;
  overallStatus: {
    currentStage?: string;
    mvpReadiness?: string;
    releaseConfidence?: string;
  };
  milestoneCounts: {
    complete: number;
    total: number;
  };
  sections: Partial<Record<MilestoneSectionKey, MarkdownSection>>;
  unknownSections: Array<Pick<MarkdownSection, "title" | "items">>;
};

const knownKeys = new Set<MilestoneSectionKey>([
  "overallStatus",
  "milestones",
  "currentMilestone",
  "mvpScope",
  "blockers",
  "milestoneNotes",
]);

export function parseMilestoneTracker(markdown: string): ParsedMilestoneTracker {
  const parsed = parseMarkdownSections(markdown);
  const sections: Partial<Record<MilestoneSectionKey, MarkdownSection>> = {};
  const unknownSections: Array<Pick<MarkdownSection, "title" | "items">> = [];

  for (const section of parsed.sections) {
    const key = normalizeSectionKey(section.title) as MilestoneSectionKey;
    if (knownKeys.has(key)) {
      sections[key] = section;
    } else {
      unknownSections.push({ title: section.title, items: section.items });
    }
  }

  const status = parseLabelValueItems(sections.overallStatus?.items ?? []);
  const milestones = sections.milestones?.checklist ?? [];

  return {
    title: parsed.title,
    overallStatus: {
      currentStage: status.currentStage,
      mvpReadiness: status.mvpReadiness,
      releaseConfidence: status.releaseConfidence,
    },
    milestoneCounts: {
      complete: milestones.filter((item) => item.checked).length,
      total: milestones.length,
    },
    sections,
    unknownSections,
  };
}
```

- [ ] **Step 7: Run parser tests**

Run:

```bash
npm run test -- tests/trackers/parse-progress-tracker.test.ts tests/trackers/parse-milestone-tracker.test.ts
```

Expected: all tests pass.

- [ ] **Step 8: Commit parser modules when possible**

If git is initialized, run:

```bash
git add src/trackers tests/trackers
git commit -m "feat: add tracker markdown parsers"
```

If git is not initialized, record that commits were skipped.

## Task 5: Add File Planning

**Files:**

- Create: `src/core/file-plan.ts`
- Create: `src/trackers/skeletons.ts`
- Test: `tests/core/file-plan.test.ts`

- [ ] **Step 1: Write file planning tests**

Create `tests/core/file-plan.test.ts`:

```ts
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { GENERATED_MARKER } from "../../src/core/ownership.js";
import { createInstallPlan } from "../../src/core/file-plan.js";

let roots: string[] = [];

async function tempRoot() {
  const root = await mkdtemp(join(tmpdir(), "progress-site-plan-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  roots = [];
});

describe("createInstallPlan", () => {
  it("creates missing trackers and html", async () => {
    const root = await tempRoot();
    const plan = await createInstallPlan({ root, outputPath: join(root, "progress-tracker.html"), force: false });

    expect(plan.actions.map((action) => [action.kind, action.relativePath])).toEqual([
      ["create", "context/progress-tracker.md"],
      ["create", "context/milestone-tracker.md"],
      ["create", "progress-tracker.html"],
    ]);
    expect(plan.hasConflicts).toBe(false);
  });

  it("preserves existing tracker markdown and skips unrelated html", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "context"));
    await writeFile(join(root, "context", "progress-tracker.md"), "# Existing");
    await writeFile(join(root, "progress-tracker.html"), "<!doctype html><title>Docs</title>");

    const plan = await createInstallPlan({ root, outputPath: join(root, "progress-tracker.html"), force: false });

    expect(plan.actions.map((action) => [action.kind, action.relativePath])).toEqual([
      ["preserve", "context/progress-tracker.md"],
      ["create", "context/milestone-tracker.md"],
      ["conflict", "progress-tracker.html"],
    ]);
    expect(plan.hasConflicts).toBe(true);
  });

  it("overwrites generated html only with force", async () => {
    const root = await tempRoot();
    await writeFile(join(root, "progress-tracker.html"), `${GENERATED_MARKER}\nold`);

    const plan = await createInstallPlan({ root, outputPath: join(root, "progress-tracker.html"), force: true });

    expect(plan.actions.find((action) => action.relativePath === "progress-tracker.html")?.kind).toBe("overwrite");
  });
});
```

- [ ] **Step 2: Run file planning tests and verify failure**

Run:

```bash
npm run test -- tests/core/file-plan.test.ts
```

Expected: tests fail because `file-plan.ts` and `skeletons.ts` do not exist.

- [ ] **Step 3: Implement skeleton loader**

Create `src/trackers/skeletons.ts`:

```ts
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(currentDir, "..", "..");

export async function readTemplate(relativePath: string) {
  return readFile(join(packageRoot, relativePath), "utf8");
}

export async function readProgressSkeleton() {
  return readTemplate("templates/context/progress-tracker.md");
}

export async function readMilestoneSkeleton() {
  return readTemplate("templates/context/milestone-tracker.md");
}
```

- [ ] **Step 4: Implement file plan module**

Create `src/core/file-plan.ts`:

```ts
import { access, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { isGeneratedHtml } from "./ownership.js";

export type FileActionKind = "create" | "preserve" | "overwrite" | "conflict";

export type FileAction = {
  kind: FileActionKind;
  path: string;
  relativePath: string;
  reason: string;
};

export type InstallPlan = {
  root: string;
  outputPath: string;
  outputDirectory: string;
  actions: FileAction[];
  hasConflicts: boolean;
};

export type CreateInstallPlanOptions = {
  root: string;
  outputPath: string;
  force: boolean;
};

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function toRelative(root: string, path: string) {
  return relative(root, path) || ".";
}

export async function createInstallPlan(options: CreateInstallPlanOptions): Promise<InstallPlan> {
  const root = resolve(options.root);
  const outputPath = resolve(options.outputPath);
  const progressPath = resolve(root, "context/progress-tracker.md");
  const milestonePath = resolve(root, "context/milestone-tracker.md");
  const actions: FileAction[] = [];

  for (const trackerPath of [progressPath, milestonePath]) {
    const exists = await fileExists(trackerPath);
    actions.push({
      kind: exists ? "preserve" : "create",
      path: trackerPath,
      relativePath: toRelative(root, trackerPath),
      reason: exists ? "Existing tracker markdown is preserved." : "Tracker markdown is missing and will be created.",
    });
  }

  if (!(await fileExists(outputPath))) {
    actions.push({
      kind: "create",
      path: outputPath,
      relativePath: toRelative(root, outputPath),
      reason: "Static progress dashboard will be created.",
    });
  } else {
    const existingHtml = await readFile(outputPath, "utf8");
    const generated = isGeneratedHtml(existingHtml);
    actions.push({
      kind: generated && options.force ? "overwrite" : generated ? "preserve" : "conflict",
      path: outputPath,
      relativePath: toRelative(root, outputPath),
      reason: generated
        ? options.force
          ? "Existing generated dashboard will be overwritten because --force was passed."
          : "Existing generated dashboard is preserved; pass --force to regenerate it."
        : "Existing HTML does not appear to be generated by this tool.",
    });
  }

  return {
    root,
    outputPath,
    outputDirectory: dirname(outputPath),
    actions,
    hasConflicts: actions.some((action) => action.kind === "conflict"),
  };
}
```

- [ ] **Step 5: Run file planning tests**

Run:

```bash
npm run test -- tests/core/file-plan.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit file planning when possible**

If git is initialized, run:

```bash
git add src/core/file-plan.ts src/trackers/skeletons.ts tests/core/file-plan.test.ts
git commit -m "feat: add install file planning"
```

If git is not initialized, record that commits were skipped.

## Task 6: Add Static Dashboard Renderer

**Files:**

- Create: `src/render/page-styles.ts`
- Create: `src/render/page-script.ts`
- Create: `src/render/render-page.ts`
- Test: `tests/render/render-page.test.ts`

- [ ] **Step 1: Write renderer tests**

Create `tests/render/render-page.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GENERATED_MARKER } from "../../src/core/ownership.js";
import { renderProgressPage } from "../../src/render/render-page.js";
import { parseProgressTracker } from "../../src/trackers/parse-progress-tracker.js";
import { parseMilestoneTracker } from "../../src/trackers/parse-milestone-tracker.js";

describe("renderProgressPage", () => {
  it("renders generated marker, cockpit content, and manual refresh controls", () => {
    const html = renderProgressPage({
      generatedAt: "2026-06-28T00:00:00.000Z",
      sourcePaths: {
        progress: "context/progress-tracker.md",
        milestone: "context/milestone-tracker.md",
      },
      progress: parseProgressTracker(`# Progress Tracker

## Current Phase

- Implementation Planning

## Current Goal

- Build the generator.

## Recommended Next Workflow

- Implement the CLI.

## Next Up

- [ ] Add renderer
`),
      milestone: parseMilestoneTracker(`# Milestone Tracker

## Overall Status

- Current Stage: Implementation Planning
- MVP Readiness: Not Ready
- Release Confidence: Medium

## Milestones

- [x] Project Kickoff
- [ ] Implementation Planning
`),
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain(GENERATED_MARKER);
    expect(html).toContain("Project Progress");
    expect(html).toContain("Implementation Planning");
    expect(html).toContain("Build the generator.");
    expect(html).toContain("Manual refresh");
    expect(html).toContain("progressMarkdownInput");
    expect(html).toContain("1 complete / 2 total");
  });
});
```

- [ ] **Step 2: Run renderer test and verify failure**

Run:

```bash
npm run test -- tests/render/render-page.test.ts
```

Expected: test fails because renderer modules do not exist.

- [ ] **Step 3: Implement static CSS**

Create `src/render/page-styles.ts`:

```ts
export const pageStyles = `
:root {
  --background: #EEEFE9;
  --surface: #FDFDF8;
  --muted-surface: #F4F4F0;
  --text: #111827;
  --body-text: #374151;
  --muted-text: #65675E;
  --border: #D2D3CC;
  --primary: #EB9D2A;
  --danger: #F35454;
  --warning: #F7A501;
  --success: #36C46F;
  --info: #30ABC6;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--background);
  color: var(--body-text);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  line-height: 1.55;
}
button, textarea, input { font: inherit; }
.shell { max-width: 1760px; margin: 0 auto; padding: 16px; }
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}
.title { margin: 0; color: var(--text); font-size: 24px; line-height: 32px; }
.meta { color: var(--muted-text); font-size: 12px; margin-top: 4px; }
.badges { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.badge {
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--muted-surface);
  color: var(--text);
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
}
.badge.primary { border-color: var(--primary); background: var(--primary); }
.cockpit {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, .85fr);
  gap: 12px;
  padding: 12px;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
}
.label {
  color: var(--muted-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
.heading { margin: 4px 0 0; color: var(--text); font-size: 20px; line-height: 28px; }
.accent {
  margin-top: 10px;
  padding: 8px;
  border-left: 3px solid var(--primary);
  background: var(--muted-surface);
}
.signal-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
.section-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 0 12px 12px; }
.list { margin: 8px 0 0; padding-left: 18px; }
.empty { color: var(--muted-text); font-style: italic; }
.milestone-bar { display: flex; gap: 4px; margin-top: 8px; }
.milestone-segment { height: 8px; flex: 1; border-radius: 2px; background: var(--border); }
.milestone-segment.done { background: var(--success); }
.refresh-grid { display: grid; gap: 8px; margin-top: 8px; }
.refresh-grid textarea { width: 100%; min-height: 92px; resize: vertical; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); padding: 8px; }
.refresh-grid input { width: 100%; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); padding: 8px; }
.button-row { display: flex; flex-wrap: wrap; gap: 8px; }
.button-row button { border: 1px solid var(--border); border-radius: 6px; background: var(--muted-surface); padding: 8px 12px; cursor: pointer; }
.button-row button.primary { border-color: var(--primary); background: var(--primary); color: var(--text); font-weight: 700; }
@media (max-width: 900px) {
  .header, .cockpit, .section-grid { display: block; }
  .badges { justify-content: flex-start; margin-top: 10px; }
  .card { margin-top: 10px; }
  .signal-grid { grid-template-columns: 1fr; }
  .shell { padding: 10px; }
}
`;
```

- [ ] **Step 4: Implement browser refresh script**

Create `src/render/page-script.ts`:

```ts
export const pageScript = `
const embeddedSnapshot = window.__PROGRESS_TRACKER_SNAPSHOT__;

function splitSections(markdown) {
  const normalized = String(markdown || "").replace(/\\r\\n/g, "\\n").trim();
  const sections = {};
  const matches = Array.from(normalized.matchAll(/^##\\s+(.+)$/gm));
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const start = match.index + match[0].length;
    const end = next ? next.index : normalized.length;
    sections[match[1].trim().toLowerCase()] = normalized.slice(start, end).trim();
  }
  return sections;
}

function applyPastedMarkdown() {
  const progress = document.getElementById("progressMarkdownInput").value;
  const milestone = document.getElementById("milestoneMarkdownInput").value;
  const progressSections = splitSections(progress);
  const milestoneSections = splitSections(milestone);
  document.querySelector("[data-live-current-goal]").textContent = progressSections["current goal"] || "No current goal found in pasted markdown.";
  document.querySelector("[data-live-next-workflow]").textContent = progressSections["recommended next workflow"] || "No recommended next workflow found in pasted markdown.";
  document.querySelector("[data-live-milestone-status]").textContent = milestoneSections["overall status"] || "No overall status found in pasted markdown.";
}

function resetSnapshot() {
  document.getElementById("progressMarkdownInput").value = embeddedSnapshot.progressMarkdown;
  document.getElementById("milestoneMarkdownInput").value = embeddedSnapshot.milestoneMarkdown;
  applyPastedMarkdown();
}

async function loadFileInto(inputId, fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  document.getElementById(inputId).value = await file.text();
  applyPastedMarkdown();
}

window.applyPastedMarkdown = applyPastedMarkdown;
window.resetSnapshot = resetSnapshot;
window.loadFileInto = loadFileInto;
`;
```

- [ ] **Step 5: Implement page renderer**

Create `src/render/render-page.ts`:

```ts
import { GENERATED_MARKER } from "../core/ownership.js";
import type { ParsedMilestoneTracker } from "../trackers/parse-milestone-tracker.js";
import type { ParsedProgressTracker } from "../trackers/parse-progress-tracker.js";
import { pageScript } from "./page-script.js";
import { pageStyles } from "./page-styles.js";

export type RenderProgressPageInput = {
  generatedAt: string;
  sourcePaths: {
    progress: string;
    milestone: string;
  };
  progressMarkdown?: string;
  milestoneMarkdown?: string;
  progress: ParsedProgressTracker;
  milestone: ParsedMilestoneTracker;
};

function escapeHtml(value: string | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function firstItem(items: string[] | undefined, fallback: string) {
  return items?.find(Boolean) ?? fallback;
}

function list(items: string[] | undefined) {
  const safeItems = items?.filter(Boolean) ?? [];
  if (safeItems.length === 0) {
    return `<p class="empty">No entries recorded.</p>`;
  }
  return `<ul class="list">${safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function milestoneSegments(complete: number, total: number) {
  const count = Math.max(total, 1);
  return Array.from({ length: count }, (_, index) => `<span class="milestone-segment ${index < complete ? "done" : ""}"></span>`).join("");
}

export function renderProgressPage(input: RenderProgressPageInput) {
  const currentPhase = firstItem(input.progress.sections.currentPhase?.items, input.milestone.overallStatus.currentStage ?? "Current phase not recorded.");
  const currentGoal = firstItem(input.progress.sections.currentGoal?.items, "Current goal not recorded.");
  const nextWorkflow = firstItem(input.progress.sections.recommendedNextWorkflow?.items, "Recommended next workflow not recorded.");
  const milestoneSummary = `${input.milestone.milestoneCounts.complete} complete / ${input.milestone.milestoneCounts.total} total`;
  const snapshot = JSON.stringify({
    progressMarkdown: input.progressMarkdown ?? "",
    milestoneMarkdown: input.milestoneMarkdown ?? "",
  }).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${GENERATED_MARKER}
  <title>Project Progress</title>
  <style>${pageStyles}</style>
</head>
<body>
  <main class="shell">
    <section class="panel">
      <header class="header">
        <div>
          <h1 class="title">Project Progress</h1>
          <div class="meta">Generated ${escapeHtml(input.generatedAt)} from ${escapeHtml(input.sourcePaths.progress)} and ${escapeHtml(input.sourcePaths.milestone)}</div>
        </div>
        <div class="badges">
          <span class="badge">Read-only</span>
          <span class="badge primary">Manual refresh</span>
        </div>
      </header>
      <div class="cockpit">
        <div>
          <article class="card">
            <div class="label">Current Focus</div>
            <h2 class="heading">${escapeHtml(currentPhase)}</h2>
            <p data-live-current-goal>${escapeHtml(currentGoal)}</p>
            <div class="accent" data-live-next-workflow>${escapeHtml(nextWorkflow)}</div>
          </article>
          <div class="signal-grid">
            <article class="card"><div class="label">Next Up</div>${list(input.progress.sections.nextUp?.items)}</article>
            <article class="card"><div class="label">Open Questions</div>${list(input.progress.sections.openQuestions?.items)}</article>
            <article class="card"><div class="label">Verification</div>${list(input.progress.sections.verification?.items)}</article>
          </div>
        </div>
        <aside>
          <article class="card">
            <div class="label">Milestones</div>
            <div class="milestone-bar">${milestoneSegments(input.milestone.milestoneCounts.complete, input.milestone.milestoneCounts.total)}</div>
            <p>${escapeHtml(milestoneSummary)}</p>
            <p data-live-milestone-status>${escapeHtml(input.milestone.overallStatus.currentStage ?? "Current stage not recorded.")}</p>
          </article>
          <article class="card"><div class="label">Risks / Blockers</div>${list([...(input.progress.sections.risks?.items ?? []), ...(input.milestone.sections.blockers?.items ?? [])])}</article>
          <article class="card"><div class="label">Assumptions</div>${list(input.progress.sections.assumptions?.items)}</article>
          <article class="card">
            <div class="label">Refresh Source</div>
            <div class="refresh-grid">
              <textarea id="progressMarkdownInput" aria-label="Paste progress tracker markdown">${escapeHtml(input.progressMarkdown ?? "")}</textarea>
              <textarea id="milestoneMarkdownInput" aria-label="Paste milestone tracker markdown">${escapeHtml(input.milestoneMarkdown ?? "")}</textarea>
              <input type="file" accept=".md,text/markdown,text/plain" onchange="loadFileInto('progressMarkdownInput', this)" aria-label="Load progress tracker markdown">
              <input type="file" accept=".md,text/markdown,text/plain" onchange="loadFileInto('milestoneMarkdownInput', this)" aria-label="Load milestone tracker markdown">
              <div class="button-row">
                <button class="primary" onclick="applyPastedMarkdown()">Apply pasted markdown</button>
                <button onclick="resetSnapshot()">Reset snapshot</button>
              </div>
            </div>
          </article>
        </aside>
      </div>
      <div class="section-grid">
        <article class="card"><div class="label">Completed</div>${list(input.progress.sections.completed?.items)}</article>
        <article class="card"><div class="label">In Progress</div>${list(input.progress.sections.inProgress?.items)}</article>
        <article class="card"><div class="label">Architecture Decisions</div>${list(input.progress.sections.architectureDecisions?.items)}</article>
        <article class="card"><div class="label">Session Notes</div>${list(input.progress.sections.sessionNotes?.items)}</article>
      </div>
    </section>
  </main>
  <script>window.__PROGRESS_TRACKER_SNAPSHOT__ = ${snapshot};</script>
  <script>${pageScript}</script>
</body>
</html>`;
}
```

- [ ] **Step 6: Run renderer tests**

Run:

```bash
npm run test -- tests/render/render-page.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit renderer when possible**

If git is initialized, run:

```bash
git add src/render tests/render
git commit -m "feat: render static progress dashboard"
```

If git is not initialized, record that commits were skipped.

## Task 7: Add Init Command And CLI

**Files:**

- Create: `src/commands/init.ts`
- Create: `src/cli.ts`
- Test: `tests/commands/init.test.ts`
- Test: `tests/cli.test.ts`

- [ ] **Step 1: Write init command tests**

Create `tests/commands/init.test.ts`:

```ts
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { runInit } from "../../src/commands/init.js";

let roots: string[] = [];

async function tempRoot() {
  const root = await mkdtemp(join(tmpdir(), "progress-site-init-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  roots = [];
});

describe("runInit", () => {
  it("creates trackers and html in docs when docs exists", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "docs"));

    const result = await runInit({ root, dryRun: false, force: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("Progress tracker site installed.");
    expect(await readFile(join(root, "context", "progress-tracker.md"), "utf8")).toContain("# Progress Tracker");
    expect(await readFile(join(root, "context", "milestone-tracker.md"), "utf8")).toContain("# Milestone Tracker");
    expect(await readFile(join(root, "docs", "progress-tracker.html"), "utf8")).toContain("Project Progress");
  });

  it("does not write files during dry run", async () => {
    const root = await tempRoot();

    const result = await runInit({ root, dryRun: true, force: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("Dry run only.");
    await expect(readFile(join(root, "progress-tracker.html"), "utf8")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Write CLI tests**

Create `tests/cli.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/cli.js";

describe("parseArgs", () => {
  it("parses init flags", () => {
    expect(parseArgs(["init", "--root", "demo", "--output", "docs/status.html", "--dry-run", "--force"])).toEqual({
      command: "init",
      root: "demo",
      output: "docs/status.html",
      dryRun: true,
      force: true,
    });
  });

  it("rejects unknown commands", () => {
    expect(() => parseArgs(["build"])).toThrow("Unknown command: build");
  });
});
```

- [ ] **Step 3: Run init and CLI tests and verify failure**

Run:

```bash
npm run test -- tests/commands/init.test.ts tests/cli.test.ts
```

Expected: tests fail because command and CLI modules do not exist.

- [ ] **Step 4: Implement init command**

Create `src/commands/init.ts`:

```ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { createInstallPlan, type FileAction } from "../core/file-plan.js";
import { resolveOutputPath } from "../core/output-path.js";
import { renderProgressPage } from "../render/render-page.js";
import { parseMilestoneTracker } from "../trackers/parse-milestone-tracker.js";
import { parseProgressTracker } from "../trackers/parse-progress-tracker.js";
import { readMilestoneSkeleton, readProgressSkeleton } from "../trackers/skeletons.js";

export type RunInitOptions = {
  root: string;
  output?: string;
  dryRun: boolean;
  force: boolean;
};

export type RunInitResult = {
  exitCode: number;
  output: string;
};

function group(actions: FileAction[], kind: FileAction["kind"]) {
  return actions.filter((action) => action.kind === kind);
}

function linesFor(title: string, actions: FileAction[]) {
  if (actions.length === 0) return [];
  return [`${title}:`, ...actions.map((action) => `- ${action.relativePath}`)];
}

function formatReport(planActions: FileAction[], outputPath: string, root: string, dryRun: boolean, hasConflicts: boolean) {
  const lines = [
    dryRun ? "Dry run only." : hasConflicts ? "Progress tracker site has conflicts." : "Progress tracker site installed.",
    "",
    ...linesFor("Created", group(planActions, "create")),
    ...linesFor("Overwritten", group(planActions, "overwrite")),
    ...linesFor("Existing", group(planActions, "preserve")),
    ...linesFor("Conflicts", group(planActions, "conflict")),
    "",
    `Open: ${relative(root, outputPath)}`,
  ];

  return lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n").trimEnd();
}

export async function runInit(options: RunInitOptions): Promise<RunInitResult> {
  const root = resolve(options.root);
  const outputPath = await resolveOutputPath({ root, output: options.output });
  const plan = await createInstallPlan({ root, outputPath, force: options.force });

  if (!options.dryRun && !plan.hasConflicts) {
    await mkdir(resolve(root, "context"), { recursive: true });
    await mkdir(dirname(outputPath), { recursive: true });

    const progressAction = plan.actions.find((action) => action.relativePath === "context/progress-tracker.md");
    const milestoneAction = plan.actions.find((action) => action.relativePath === "context/milestone-tracker.md");

    if (progressAction?.kind === "create") {
      await writeFile(progressAction.path, await readProgressSkeleton(), "utf8");
    }
    if (milestoneAction?.kind === "create") {
      await writeFile(milestoneAction.path, await readMilestoneSkeleton(), "utf8");
    }

    const progressMarkdown = await readFile(resolve(root, "context/progress-tracker.md"), "utf8");
    const milestoneMarkdown = await readFile(resolve(root, "context/milestone-tracker.md"), "utf8");
    const htmlAction = plan.actions.find((action) => action.path === outputPath);

    if (htmlAction?.kind === "create" || htmlAction?.kind === "overwrite") {
      await writeFile(
        outputPath,
        renderProgressPage({
          generatedAt: new Date().toISOString(),
          sourcePaths: {
            progress: "context/progress-tracker.md",
            milestone: "context/milestone-tracker.md",
          },
          progressMarkdown,
          milestoneMarkdown,
          progress: parseProgressTracker(progressMarkdown),
          milestone: parseMilestoneTracker(milestoneMarkdown),
        }),
        "utf8",
      );
    }
  }

  return {
    exitCode: plan.hasConflicts ? 1 : 0,
    output: formatReport(plan.actions, outputPath, root, options.dryRun, plan.hasConflicts),
  };
}
```

- [ ] **Step 5: Implement CLI**

Create `src/cli.ts`:

```ts
import { runInit } from "./commands/init.js";

export type ParsedArgs = {
  command: "init";
  root: string;
  output?: string;
  dryRun: boolean;
  force: boolean;
};

export function parseArgs(args: string[]): ParsedArgs {
  const [command, ...rest] = args;

  if (!command || command === "--help" || command === "-h") {
    throw new Error("Usage: progress-tracker-site init [--root .] [--output docs/progress-tracker.html] [--dry-run] [--force]");
  }

  if (command !== "init") {
    throw new Error(`Unknown command: ${command}`);
  }

  const parsed: ParsedArgs = {
    command: "init",
    root: ".",
    dryRun: false,
    force: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--root") {
      parsed.root = rest[index + 1] ?? ".";
      index += 1;
    } else if (arg === "--output") {
      parsed.output = rest[index + 1];
      index += 1;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--force") {
      parsed.force = true;
    } else {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return parsed;
}

export async function main(args: string[]) {
  const parsed = parseArgs(args);
  const result = await runInit(parsed);
  console.log(result.output);
  process.exitCode = result.exitCode;
}
```

- [ ] **Step 6: Run init and CLI tests**

Run:

```bash
npm run test -- tests/commands/init.test.ts tests/cli.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Run build**

Run:

```bash
npm run build
```

Expected: build passes and `dist/` contains compiled modules.

- [ ] **Step 8: Commit init command and CLI when possible**

If git is initialized, run:

```bash
git add src/commands src/cli.ts tests/commands tests/cli.test.ts
git commit -m "feat: add init cli command"
```

If git is not initialized, record that commits were skipped.

## Task 8: Add README And End-to-End Verification

**Files:**

- Create or modify: `README.md`

- [ ] **Step 1: Create README**

Create or replace `README.md`:

```md
# progress-tracker-site

Install a read-only static progress dashboard from standard tracker markdown files.

```bash
npx @linhaishe/progress-tracker-site init
```

The command reads or creates:

- `context/progress-tracker.md`
- `context/milestone-tracker.md`

It writes a self-contained HTML dashboard to:

- `docs/progress-tracker.html` when `docs/` exists
- `progress-tracker.html` otherwise

## Usage

```bash
npx @linhaishe/progress-tracker-site init
npx @linhaishe/progress-tracker-site init --dry-run
npx @linhaishe/progress-tracker-site init --force
npx @linhaishe/progress-tracker-site init --output docs/progress-tracker.html
npx @linhaishe/progress-tracker-site init --root .
```

The generated page is static and read-only. It embeds a snapshot at generation time and also lets you paste or load updated markdown in the browser to refresh the visible dashboard. Browser refresh does not write files.
```

- [ ] **Step 2: Run all checks**

Run:

```bash
npm run check
```

Expected:

- TypeScript build passes.
- All Vitest tests pass.

- [ ] **Step 3: Run dry-run verification**

Run:

```bash
tmpdir="$(mktemp -d)"
node bin/progress-tracker-site.js init --root "$tmpdir" --dry-run
test ! -f "$tmpdir/progress-tracker.html"
rm -rf "$tmpdir"
```

Expected:

- CLI output contains `Dry run only.`
- The `test ! -f` command exits `0`.

- [ ] **Step 4: Run install verification**

Run:

```bash
tmpdir="$(mktemp -d)"
mkdir -p "$tmpdir/docs"
node bin/progress-tracker-site.js init --root "$tmpdir"
test -f "$tmpdir/context/progress-tracker.md"
test -f "$tmpdir/context/milestone-tracker.md"
test -f "$tmpdir/docs/progress-tracker.html"
rg -n "Project Progress|Manual refresh|Generated by @linhaishe/progress-tracker-site" "$tmpdir/docs/progress-tracker.html"
rm -rf "$tmpdir"
```

Expected:

- All `test -f` commands exit `0`.
- `rg` finds the title, refresh label, and generated marker.

- [ ] **Step 5: Open generated HTML for manual browser verification**

Run:

```bash
tmpdir="$(mktemp -d)"
mkdir -p "$tmpdir/docs"
node bin/progress-tracker-site.js init --root "$tmpdir"
open "$tmpdir/docs/progress-tracker.html"
```

Expected:

- Browser opens the dashboard.
- First screen shows the Handoff Cockpit.
- Pasting changed `Current Goal` markdown and clicking `Apply pasted markdown` updates the visible current goal.
- Narrowing browser width does not create horizontal overflow.

- [ ] **Step 6: Commit docs and final verification when possible**

If git is initialized, run:

```bash
git add README.md package.json package-lock.json tsconfig.json vitest.config.ts bin src tests templates
git commit -m "docs: add progress tracker site usage"
```

If git is not initialized, record that commits were skipped.

## Self-Review

- Spec coverage: the plan covers package setup, generic templates, static output path rules, conservative conflict handling, tracker skeletons, parser behavior, generated marker, Handoff Cockpit rendering, manual refresh controls, CLI flags, and verification.
- Placeholder scan: the plan contains no `TBD`, no `TODO`, and no unspecified "handle edge cases" steps.
- Type consistency: parser return types, renderer inputs, CLI options, and file-plan action kinds are defined before use and reused consistently.
