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
      watch: false,
      ai: false,
    });
  });

  it("parses watch mode", () => {
    expect(parseArgs(["init", "--watch", "--output", "docs/progress-tracker.html"])).toEqual({
      command: "init",
      root: ".",
      output: "docs/progress-tracker.html",
      dryRun: false,
      force: false,
      watch: true,
      ai: false,
    });
  });

  it("parses AI mode", () => {
    expect(parseArgs(["init", "--ai", "--root", "demo"])).toEqual({
      command: "init",
      root: "demo",
      dryRun: false,
      force: false,
      watch: false,
      ai: true,
    });
  });

  it("rejects unknown commands", () => {
    expect(() => parseArgs(["build"])).toThrow("Unknown command: build");
  });
});
