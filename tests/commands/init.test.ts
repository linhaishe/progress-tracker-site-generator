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
