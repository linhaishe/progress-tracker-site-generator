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
