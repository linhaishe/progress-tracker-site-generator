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
