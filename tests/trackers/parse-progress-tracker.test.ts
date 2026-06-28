import { describe, expect, it } from "vitest";
import { parseProgressTracker } from "../../src/trackers/parse-progress-tracker.js";

describe("parseProgressTracker", () => {
  it("parses known sections and unknown sections", () => {
    const tracker = parseProgressTracker(`# Progress Tracker

## Current Phase

- Implementation Planning

## Current Goal

- Build the generator.

## Next Up

- [ ] Add parser
- [x] Approve design

## Custom Notes

- Keep this note.
`);

    expect(tracker.title).toBe("Progress Tracker");
    expect(tracker.sections.currentPhase.items).toEqual(["Implementation Planning"]);
    expect(tracker.sections.currentGoal.items).toEqual(["Build the generator."]);
    expect(tracker.sections.nextUp.checklist).toEqual([
      { checked: false, text: "Add parser" },
      { checked: true, text: "Approve design" },
    ]);
    expect(tracker.unknownSections).toEqual([{ title: "Custom Notes", items: ["Keep this note."] }]);
  });
});
