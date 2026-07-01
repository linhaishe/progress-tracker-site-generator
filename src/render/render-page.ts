import { GENERATED_MARKER } from "../core/ownership.js";
import type { ParsedProgressTracker } from "../trackers/parse-progress-tracker.js";
import { pageScript } from "./page-script.js";
import { pageStyles } from "./page-styles.js";

export type RenderProgressPageInput = {
  generatedAt: string;
  sourcePaths: {
    progress: string;
  };
  progressMarkdown?: string;
  progress: ParsedProgressTracker;
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
  return Array.from(
    { length: count },
    (_, index) => `<span class="milestone-segment ${index < complete ? "done" : ""}"></span>`,
  ).join("");
}

export function renderProgressPage(input: RenderProgressPageInput) {
  const currentPhase = firstItem(input.progress.sections.currentPhase?.items, "Current phase not recorded.");
  const currentGoal = firstItem(input.progress.sections.currentGoal?.items, "Current goal not recorded.");
  const nextWorkflow = firstItem(
    input.progress.sections.recommendedNextWorkflow?.items,
    "Recommended next workflow not recorded.",
  );
  const milestones = input.progress.sections.milestones?.checklist ?? [];
  const milestoneCounts = {
    complete: milestones.filter((item) => item.checked).length,
    total: milestones.length,
  };
  const milestoneSummary = `${milestoneCounts.complete} complete / ${milestoneCounts.total} total`;
  const snapshot = JSON.stringify({
    progressMarkdown: input.progressMarkdown ?? "",
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
          <div class="meta">Generated ${escapeHtml(input.generatedAt)} from ${escapeHtml(input.sourcePaths.progress)}</div>
        </div>
        <div class="badges">
          <span class="badge">Read-only</span>
          <span class="badge primary">Manual refresh</span>
        </div>
      </header>
      <div class="cockpit">
        <article class="card focus-card">
          <div class="label">Current Focus</div>
          <h2 class="heading">${escapeHtml(currentPhase)}</h2>
          <p data-live-current-goal>${escapeHtml(currentGoal)}</p>
          <div class="accent" data-live-next-workflow>${escapeHtml(nextWorkflow)}</div>
        </article>
        <article class="card milestone-card">
          <div class="label">Milestones</div>
          <div class="milestone-bar">${milestoneSegments(milestoneCounts.complete, milestoneCounts.total)}</div>
          <p>${escapeHtml(milestoneSummary)}</p>
          <p data-live-milestone-status>${escapeHtml(currentPhase)}</p>
        </article>
        <div class="content-stack">
          <article class="card"><div class="label">Next Up</div>${list(input.progress.sections.nextUp?.items)}</article>
          <article class="card"><div class="label">Open Questions</div>${list(input.progress.sections.openQuestions?.items)}</article>
          <article class="card"><div class="label">Risks / Blockers</div>${list(input.progress.sections.risks?.items)}</article>
          <article class="card"><div class="label">Verification</div>${list(input.progress.sections.verification?.items)}</article>
          <article class="card"><div class="label">Assumptions</div>${list(input.progress.sections.assumptions?.items)}</article>
          <details class="card refresh-card">
            <summary><span class="label">Refresh Source</span></summary>
            <div class="refresh-grid">
              <textarea id="progressMarkdownInput" aria-label="Paste progress tracker markdown">${escapeHtml(input.progressMarkdown ?? "")}</textarea>
              <input type="file" accept=".md,text/markdown,text/plain" onchange="loadFileInto('progressMarkdownInput', this)" aria-label="Load progress tracker markdown">
              <div class="button-row">
                <button class="primary" onclick="applyPastedMarkdown()">Apply pasted markdown</button>
                <button onclick="resetSnapshot()">Reset snapshot</button>
              </div>
            </div>
          </details>
        </div>
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
