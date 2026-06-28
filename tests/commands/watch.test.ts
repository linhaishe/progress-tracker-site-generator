import { describe, expect, it, vi } from "vitest";
import { shouldRegenerateForWatchEvent, startWatch } from "../../src/commands/watch.js";

describe("shouldRegenerateForWatchEvent", () => {
  it("only reacts to tracker and design markdown files", () => {
    expect(shouldRegenerateForWatchEvent("progress-tracker.md")).toBe(true);
    expect(shouldRegenerateForWatchEvent("milestone-tracker.md")).toBe(true);
    expect(shouldRegenerateForWatchEvent("design.md")).toBe(true);
    expect(shouldRegenerateForWatchEvent("notes.md")).toBe(false);
    expect(shouldRegenerateForWatchEvent(null)).toBe(false);
  });
});

describe("startWatch", () => {
  it("generates immediately and regenerates after watched files change", async () => {
    let listener: (eventType: string, filename: string | Buffer | null) => void = () => {};
    const close = vi.fn();
    const runInit = vi.fn().mockResolvedValue({ exitCode: 0, output: "ok" });

    const session = await startWatch(
      { root: "/repo", output: "docs/progress-tracker.html", dryRun: false, force: false },
      {
        runInit,
        watchDirectory: vi.fn((_path, next) => {
          listener = next;
          return { close };
        }),
        debounceMs: 0,
        logger: { log: vi.fn(), error: vi.fn() },
      },
    );

    expect(runInit).toHaveBeenCalledWith({
      root: "/repo",
      output: "docs/progress-tracker.html",
      dryRun: false,
      force: true,
    });

    listener("change", "progress-tracker.md");
    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(runInit).toHaveBeenCalledTimes(2);
    session.close();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
