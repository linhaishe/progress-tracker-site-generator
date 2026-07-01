import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

  it("initializes progress tracker from relevant docs when progress tracker is missing", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "docs", "planning"), { recursive: true });
    await writeFile(
      join(root, "docs", "PRD.md"),
      "# Checkout PRD\n\nBuild a fast checkout flow.\n\n## Acceptance Criteria\n\n- Users can pay by card.",
    );
    await writeFile(
      join(root, "docs", "planning", "implementation-plan.md"),
      "# Implementation Plan\n\n- Create the payment adapter.\n- Add checkout verification.",
    );
    await writeFile(join(root, "docs", "notes.md"), "# Notes\n\nThis should not be imported.");

    await runInit({ root, dryRun: false, force: false });

    const progressMarkdown = await readFile(join(root, "context", "progress-tracker.md"), "utf8");
    expect(progressMarkdown).toContain("## Project Docs Context");
    expect(progressMarkdown).toContain("### docs/PRD.md");
    expect(progressMarkdown).toContain("Build a fast checkout flow.");
    expect(progressMarkdown).toContain("### docs/planning/implementation-plan.md");
    expect(progressMarkdown).toContain("Create the payment adapter.");
    expect(progressMarkdown).not.toContain("This should not be imported.");

    const html = await readFile(join(root, "docs", "progress-tracker.html"), "utf8");
    expect(html).toContain("Build a fast checkout flow.");
  });

  it("uses AI-generated progress tracker content when AI mode is enabled", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "docs"), { recursive: true });
    await writeFile(join(root, "docs", "PRD.md"), "# Checkout PRD\n\nBuild a fast checkout flow.");

    await runInit(
      { root, dryRun: false, force: false, ai: true },
      {
        generateProgressTrackerFromDocs: async ({ projectDocs, progressSkeleton }) => {
          expect(projectDocs.map((doc) => doc.relativePath)).toEqual(["docs/PRD.md"]);
          expect(progressSkeleton).toContain("# Progress Tracker");
          return `# Progress Tracker

## Current Phase

- AI Synthesized Planning

## Current Goal

- Turn checkout PRD into an implementation-ready plan.

## Recommended Next Workflow

- Write the first implementation slice.

## Next Up

- [ ] Define checkout payment adapter.

## Verification

- No verification run recorded.`;
        },
      },
    );

    const progressMarkdown = await readFile(join(root, "context", "progress-tracker.md"), "utf8");
    expect(progressMarkdown).toContain("AI Synthesized Planning");
    expect(progressMarkdown).not.toContain("Build a fast checkout flow.");

    const html = await readFile(join(root, "docs", "progress-tracker.html"), "utf8");
    expect(html).toContain("AI Synthesized Planning");
  });

  it("falls back to template mode when AI mode has no generator available", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "docs"), { recursive: true });
    await writeFile(join(root, "docs", "PRD.md"), "# Checkout PRD\n\nBuild a fast checkout flow.");

    const result = await runInit(
      { root, dryRun: false, force: false, ai: true },
      {
        generateProgressTrackerFromDocs: async () => {
          throw new Error("OPENAI_API_KEY is not set");
        },
      },
    );

    expect(result.output).toContain("AI skipped: OPENAI_API_KEY is not set");
    await expect(readFile(join(root, "context", "progress-tracker.md"), "utf8")).resolves.toContain(
      "## Project Docs Context",
    );
  });

  it("uses the default progress tracker template when no relevant docs exist", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "docs"), { recursive: true });
    await writeFile(join(root, "docs", "notes.md"), "# Notes\n\nGeneral meeting notes.");

    await runInit({ root, dryRun: false, force: false });

    const progressMarkdown = await readFile(join(root, "context", "progress-tracker.md"), "utf8");
    expect(progressMarkdown).toContain("# Progress Tracker");
    expect(progressMarkdown).not.toContain("## Project Docs Context");
  });

  it("preserves existing progress tracker instead of merging docs into it", async () => {
    const root = await tempRoot();
    await mkdir(join(root, "context"), { recursive: true });
    await mkdir(join(root, "docs"), { recursive: true });
    await writeFile(join(root, "context", "progress-tracker.md"), "# Progress Tracker\n\n## Current Phase\n\n- Existing");
    await writeFile(join(root, "docs", "PRD.md"), "# PRD\n\nNew product direction.");

    await runInit({ root, dryRun: false, force: false });

    await expect(readFile(join(root, "context", "progress-tracker.md"), "utf8")).resolves.toBe(
      "# Progress Tracker\n\n## Current Phase\n\n- Existing",
    );
  });

  it("does not write files during dry run", async () => {
    const root = await tempRoot();

    const result = await runInit({ root, dryRun: true, force: false });

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("Dry run only.");
    await expect(readFile(join(root, "progress-tracker.html"), "utf8")).rejects.toThrow();
  });
});
