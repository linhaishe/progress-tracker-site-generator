# Progress Tracker Visualization Implementation Plan

> Superseded by `docs/superpowers/plans/2026-06-28-progress-tracker-site-kit-architecture.md`.
> This earlier plan targets a Next.js `/dev/progress` route and should not be executed for the current static HTML progress tracker site direction.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only `/dev/progress` handoff cockpit from `context/progress-tracker.md`.

**Architecture:** Keep parsing separate from rendering. Add a pure local parser module under `app/dev/progress/`, then add a server-rendered Next.js page that reads the Markdown file from disk and renders the cockpit plus structured detail. Do not modify the existing `/` customer support workbench.

**Tech Stack:** Next.js 16 App Router, React Server Components, TypeScript, Tailwind CSS utilities, Node `fs/promises`.

---

## File Structure

- Create `app/dev/progress/progress-tracker.ts`
  - Pure parser and section helpers.
  - No React, no filesystem reads, no browser APIs.
- Create `app/dev/progress/page.tsx`
  - Server component for `/dev/progress`.
  - Reads `context/progress-tracker.md`.
  - Renders read-only cockpit, detail sections, missing-section notices, and file-read error UI.
- Do not modify `app/page.tsx`, `app/customer-service-workbench.tsx`, or `context/progress-tracker.md`.

## Context To Read Before Implementation

- `AGENTS.md`
- `docs/superpowers/specs/2026-06-28-progress-tracker-visualization-design.md`
- `context/progress-tracker.md`
- `context/design.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

## Task 1: Add Progress Tracker Parser

**Files:**
- Create: `app/dev/progress/progress-tracker.ts`

- [ ] **Step 1: Create the parser module**

Create `app/dev/progress/progress-tracker.ts` with this full content:

```ts
export const expectedProgressSections = [
  "Current Phase",
  "Current Goal",
  "Completed",
  "In Progress",
  "Next Up",
  "Open Questions",
  "Assumptions",
  "Architecture Decisions",
  "Governance, Compliance, and Review Notes",
  "Risks",
  "Session Notes",
  "Verification",
  "Recommended Next Workflow",
] as const;

export type ExpectedProgressSection = (typeof expectedProgressSections)[number];

export type ProgressSection = {
  title: string;
  content: string;
  isExpected: boolean;
};

export type ParsedProgressTracker = {
  title: string;
  sections: Partial<Record<ExpectedProgressSection, string>>;
  unknownSections: ProgressSection[];
};

function normalizeMarkdown(markdown: string) {
  return markdown.replace(/\r\n/g, "\n").trim();
}

function normalizeSectionTitle(title: string) {
  return title.trim().replace(/\s+/g, " ");
}

function isExpectedSection(title: string): title is ExpectedProgressSection {
  return expectedProgressSections.includes(title as ExpectedProgressSection);
}

export function parseProgressTracker(markdown: string): ParsedProgressTracker {
  const normalized = normalizeMarkdown(markdown);
  const titleMatch = normalized.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() || "Progress Tracker";
  const headingMatches = Array.from(normalized.matchAll(/^##\s+(.+)$/gm));
  const sections: Partial<Record<ExpectedProgressSection, string>> = {};
  const unknownSections: ProgressSection[] = [];

  headingMatches.forEach((match, index) => {
    const rawTitle = match[1] ?? "";
    const sectionTitle = normalizeSectionTitle(rawTitle);
    const contentStart = (match.index ?? 0) + match[0].length;
    const nextHeading = headingMatches[index + 1];
    const contentEnd = nextHeading?.index ?? normalized.length;
    const content = normalized.slice(contentStart, contentEnd).trim();

    if (isExpectedSection(sectionTitle)) {
      sections[sectionTitle] = content;
      return;
    }

    unknownSections.push({
      title: sectionTitle || "Untitled Section",
      content,
      isExpected: false,
    });
  });

  return { title, sections, unknownSections };
}

export function sectionLines(content: string | undefined) {
  if (!content?.trim()) {
    return [];
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, ""));
}

export function sectionPreview(content: string | undefined, maxItems = 3) {
  return sectionLines(content).slice(0, maxItems);
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: exits `0` with no TypeScript errors.

- [ ] **Step 3: Commit parser**

Run:

```bash
git add app/dev/progress/progress-tracker.ts
git commit -m "feat: add progress tracker parser"
```

Expected: commit includes only `app/dev/progress/progress-tracker.ts`.

## Task 2: Add Read-Only `/dev/progress` Page

**Files:**
- Create: `app/dev/progress/page.tsx`
- Read: `context/progress-tracker.md`

- [ ] **Step 1: Create the server page**

Create `app/dev/progress/page.tsx` with this full content:

```tsx
import type { Metadata } from "next";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  expectedProgressSections,
  parseProgressTracker,
  sectionLines,
  sectionPreview,
  type ExpectedProgressSection,
  type ParsedProgressTracker,
} from "./progress-tracker";

export const metadata: Metadata = {
  title: "Dev Progress - Tianmao Global AI Service Workbench",
  description: "Read-only handoff cockpit generated from context/progress-tracker.md.",
};

export const dynamic = "force-dynamic";

type TrackerLoadResult =
  | {
      ok: true;
      filePath: string;
      lastReadAt: string;
      fileUpdatedAt: string;
      tracker: ParsedProgressTracker;
    }
  | {
      ok: false;
      filePath: string;
      message: string;
    };

async function loadProgressTracker(): Promise<TrackerLoadResult> {
  const filePath = path.join(process.cwd(), "context/progress-tracker.md");

  try {
    const [markdown, fileStats] = await Promise.all([
      readFile(filePath, "utf8"),
      stat(filePath),
    ]);

    return {
      ok: true,
      filePath,
      lastReadAt: new Date().toLocaleString("en-US", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fileUpdatedAt: fileStats.mtime.toLocaleString("en-US", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      tracker: parseProgressTracker(markdown),
    };
  } catch (error) {
    return {
      ok: false,
      filePath,
      message: error instanceof Error ? error.message : "Unknown read error",
    };
  }
}

export default async function DevProgressPage() {
  const result = await loadProgressTracker();

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-[#EEEFE9] px-4 py-6 text-[#111827]">
        <div className="mx-auto max-w-4xl border border-[#D2D3CC] bg-[#FDFDF8] p-6">
          <p className="text-xs font-semibold uppercase text-[#65675E]">
            Read-only dev route
          </p>
          <h1 className="mt-2 text-2xl font-bold">Progress tracker unavailable</h1>
          <p className="mt-4 text-sm leading-6 text-[#374151]">
            Expected to read <code>{result.filePath}</code>, but the file could not
            be loaded.
          </p>
          <p className="mt-3 border border-[#D2D3CC] bg-[#F4F4F0] p-3 text-sm text-[#65675E]">
            {result.message}
          </p>
        </div>
      </main>
    );
  }

  const { tracker } = result;
  const currentPhase = sectionLines(tracker.sections["Current Phase"]).join(" ");
  const currentGoal = sectionLines(tracker.sections["Current Goal"]).join(" ");
  const nextWorkflow = sectionLines(tracker.sections["Recommended Next Workflow"]).join(" ");
  const missingSections = expectedProgressSections.filter(
    (section) => !tracker.sections[section]?.trim(),
  );

  return (
    <main className="min-h-screen bg-[#EEEFE9] px-4 py-5 text-[#111827] lg:px-6">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-4">
        <header className="border border-[#D2D3CC] bg-[#FDFDF8] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#65675E]">
                Read-only dev handoff
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-normal">
                Project Progress
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#374151]">
                Generated from <code>context/progress-tracker.md</code> for the next
                AI agent or developer taking over this repository.
              </p>
            </div>
            <dl className="grid gap-2 text-xs text-[#65675E] sm:grid-cols-2 lg:min-w-[420px]">
              <MetaItem label="Source" value="context/progress-tracker.md" />
              <MetaItem label="Mode" value="Read-only" />
              <MetaItem label="File updated" value={result.fileUpdatedAt} />
              <MetaItem label="Last read" value={result.lastReadAt} />
            </dl>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col gap-4">
            <section className="border border-[#D2D3CC] bg-[#FDFDF8] p-5">
              <p className="text-xs font-semibold uppercase text-[#65675E]">
                Current handoff state
              </p>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <HeroDatum title="Current Phase" value={currentPhase} />
                <HeroDatum title="Current Goal" value={currentGoal} />
                <HeroDatum title="Next Workflow" value={nextWorkflow} accent />
              </div>
            </section>

            <section className="grid gap-3 lg:grid-cols-3">
              <SignalCard
                title="Next Up"
                items={sectionPreview(tracker.sections["Next Up"], 3)}
                empty="No next-up items recorded."
              />
              <SignalCard
                title="Open Questions"
                items={sectionPreview(tracker.sections["Open Questions"], 3)}
                empty="No open questions recorded."
                tone="warning"
              />
              <SignalCard
                title="Verification"
                items={sectionPreview(tracker.sections.Verification, 3)}
                empty="No verification notes recorded."
              />
            </section>

            <DetailGrid tracker={tracker} />
          </div>

          <aside className="flex flex-col gap-4">
            <SignalCard
              title="Risks"
              items={sectionPreview(tracker.sections.Risks, 5)}
              empty="No risks recorded."
              tone="danger"
            />
            <SignalCard
              title="Governance / Compliance"
              items={sectionPreview(
                tracker.sections["Governance, Compliance, and Review Notes"],
                5,
              )}
              empty="No governance or compliance notes recorded."
              tone="info"
            />
            <SignalCard
              title="Assumptions"
              items={sectionPreview(tracker.sections.Assumptions, 5)}
              empty="No assumptions recorded."
            />
            {missingSections.length > 0 ? (
              <section className="border border-[#D2D3CC] bg-[#FDFDF8] p-4">
                <p className="text-xs font-semibold uppercase text-[#65675E]">
                  Missing or empty sections
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#374151]">
                  {missingSections.map((section) => (
                    <li key={section} className="border border-[#D2D3CC] bg-[#F4F4F0] px-3 py-2">
                      {section}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#D2D3CC] bg-[#F4F4F0] px-3 py-2">
      <dt className="font-semibold uppercase">{label}</dt>
      <dd className="mt-1 break-words text-[#374151]">{value}</dd>
    </div>
  );
}

function HeroDatum({
  title,
  value,
  accent = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <article
      className={`border p-4 ${
        accent
          ? "border-[#B17816] bg-[#EB9D2A] text-[#111827]"
          : "border-[#D2D3CC] bg-[#F4F4F0]"
      }`}
    >
      <p className="text-xs font-semibold uppercase opacity-75">{title}</p>
      <p className="mt-3 text-base font-bold leading-6">
        {value || `Missing ${title.toLowerCase()} section.`}
      </p>
    </article>
  );
}

function SignalCard({
  title,
  items,
  empty,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  empty: string;
  tone?: "neutral" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    neutral: "border-[#D2D3CC]",
    warning: "border-[#F7A501]",
    danger: "border-[#F35454]",
    info: "border-[#30ABC6]",
  }[tone];

  return (
    <section className={`border bg-[#FDFDF8] p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase text-[#65675E]">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#374151]">
          {items.map((item) => (
            <li key={item} className="border-l-2 border-[#D2D3CC] pl-3">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[#65675E]">{empty}</p>
      )}
    </section>
  );
}

function DetailGrid({ tracker }: { tracker: ParsedProgressTracker }) {
  const sections: Array<{ title: ExpectedProgressSection; max?: number }> = [
    { title: "Completed" },
    { title: "In Progress" },
    { title: "Architecture Decisions" },
    { title: "Session Notes" },
    { title: "Open Questions" },
    { title: "Risks" },
    { title: "Assumptions" },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {sections.map(({ title }) => (
        <DetailSection key={title} title={title} content={tracker.sections[title]} />
      ))}
      {tracker.unknownSections.length > 0 ? (
        <section className="border border-[#D2D3CC] bg-[#FDFDF8] p-4 xl:col-span-2">
          <p className="text-xs font-semibold uppercase text-[#65675E]">Other Notes</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {tracker.unknownSections.map((section) => (
              <DetailSection
                key={section.title}
                title={section.title}
                content={section.content}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function DetailSection({ title, content }: { title: string; content?: string }) {
  const items = sectionLines(content);

  return (
    <article className="border border-[#D2D3CC] bg-[#FDFDF8] p-4">
      <p className="text-xs font-semibold uppercase text-[#65675E]">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#374151]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[#65675E]">
          No {title.toLowerCase()} recorded.
        </p>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: exits `0` with no TypeScript errors.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: exits `0` with no ESLint errors.

- [ ] **Step 4: Commit page**

Run:

```bash
git add app/dev/progress/page.tsx
git commit -m "feat: add progress tracker dev page"
```

Expected: commit includes only `app/dev/progress/page.tsx`.

## Task 3: Verify Route Behavior And Build

**Files:**
- Verify: `app/dev/progress/page.tsx`
- Verify: `app/page.tsx`
- Verify: `context/progress-tracker.md`

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: exits `0`; build output includes the app routes without errors.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev
```

Expected: dev server starts and prints a local URL, normally `http://localhost:3000`.

- [ ] **Step 3: Verify `/dev/progress` renders**

Open:

```text
http://localhost:3000/dev/progress
```

Expected:

- Page title reads `Project Progress`.
- Header shows `Read-only dev handoff`.
- Source path is `context/progress-tracker.md`.
- Current phase, current goal, and next workflow are visible in the top cockpit.
- Next up, open questions, verification, risks, governance/compliance, and assumptions are visible.
- Missing/empty tracker sections appear in the missing section notice when applicable.

- [ ] **Step 4: Verify `/` remains unchanged**

Open:

```text
http://localhost:3000/
```

Expected:

- Customer support workbench still renders.
- Case queue, case details, and AI assistant panel still appear.
- No `/dev/progress` UI appears on the customer support workbench.

- [ ] **Step 5: Verify mobile overflow**

Use browser devtools or Playwright/agent-browser with a `390x900` viewport and visit:

```text
http://localhost:3000/dev/progress
```

Expected:

- No horizontal scrolling.
- Signal cards stack vertically.
- Long open questions and risks wrap inside their cards.

- [ ] **Step 6: Stop dev server**

Stop the dev server with `Ctrl+C`.

Expected: server exits cleanly.

- [ ] **Step 7: Commit verification note if progress tracker is updated**

Only if implementation updates `context/progress-tracker.md`, run:

```bash
git add context/progress-tracker.md
git commit -m "docs: update progress tracker after dev page"
```

Expected: commit includes only the progress tracker update.

## Self-Review

- Spec coverage:
  - Read-only `/dev/progress`: Task 2.
  - Source of truth remains `context/progress-tracker.md`: Task 2.
  - Parser split by `##`: Task 1.
  - Unknown sections preserved: Task 1 and Task 2.
  - Missing/empty sections visible: Task 2.
  - Visual direction from `context/design.md`: Task 2.
  - Verification for route, mobile, lint, build: Task 3.
- Placeholder scan:
  - No unresolved markers or unspecified implementation steps remain.
- Type consistency:
  - `ExpectedProgressSection`, `ParsedProgressTracker`, `sectionLines`, and `sectionPreview` are defined in Task 1 and imported with matching names in Task 2.
