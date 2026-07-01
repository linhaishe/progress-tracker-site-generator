import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseProgressTracker } from "../../src/trackers/parse-progress-tracker.js";

describe("progress tracker template", () => {
  it("includes structured handoff fields for agent-readable progress tracking", async () => {
    const markdown = await readFile(join(process.cwd(), "templates", "context", "progress-tracker.md"), "utf8");
    const tracker = parseProgressTracker(markdown);
    const unknownSectionTitles = tracker.unknownSections.map((section) => section.title);

    expect(unknownSectionTitles).toContain("Project Health");
    expect(unknownSectionTitles).toContain("Active Slice");
    expect(unknownSectionTitles).toContain("Exit Criteria");
    expect(unknownSectionTitles).toContain("Next Slices");
    expect(unknownSectionTitles).toContain("Source Map");
    expect(tracker.sections.milestones?.checklist).toHaveLength(7);

    expect(markdown).toContain("- Delivery Confidence:");
    expect(markdown).toContain("- Scope Stability:");
    expect(markdown).toContain("- Technical Risk:");
    expect(markdown).toContain("- Blocker Status:");
    expect(markdown).toContain("- Name:");
    expect(markdown).toContain("- Status:");
    expect(markdown).toContain("- Source:");
    expect(markdown).toContain("- Last Run:");
    expect(markdown).toContain("- Result:");
    expect(markdown).toContain("- Coverage:");
  });
});
