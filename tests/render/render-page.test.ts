import { describe, expect, it } from "vitest";
import { GENERATED_MARKER } from "../../src/core/ownership.js";
import { renderProgressPage } from "../../src/render/render-page.js";
import { parseProgressTracker } from "../../src/trackers/parse-progress-tracker.js";

describe("renderProgressPage", () => {
  it("renders generated marker, cockpit content, and manual refresh controls", () => {
    const html = renderProgressPage({
      generatedAt: "2026-06-28T00:00:00.000Z",
      sourcePaths: {
        progress: "context/progress-tracker.md",
      },
      progress: parseProgressTracker(`# Progress Tracker

## Current Phase

- Implementation Planning

## Current Goal

- Build the generator.

## Recommended Next Workflow

- Implement the CLI.

## Next Up

- [ ] Add renderer

## Milestones

- [x] Project Kickoff
- [ ] Implementation Planning
`),
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain(GENERATED_MARKER);
    expect(html).toContain("Project Progress");
    expect(html).toContain("Implementation Planning");
    expect(html).toContain("Build the generator.");
    expect(html).toContain("Manual refresh");
    expect(html).toContain("progressMarkdownInput");
    expect(html).toContain("1 complete / 2 total");
  });
});
