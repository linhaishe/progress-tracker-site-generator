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
