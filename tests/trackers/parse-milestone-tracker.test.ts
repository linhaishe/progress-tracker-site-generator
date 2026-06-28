import { describe, expect, it } from "vitest";
import { parseMilestoneTracker } from "../../src/trackers/parse-milestone-tracker.js";

describe("parseMilestoneTracker", () => {
  it("parses status fields and checklist counts", () => {
    const tracker = parseMilestoneTracker(`# Milestone Tracker

## Overall Status

- Current Stage: Implementation Planning
- Delivery Readiness: Not Ready
- Release Confidence: Medium

## Milestones

- [x] Project Kickoff
- [ ] Implementation Planning

## Blockers

- No blockers recorded.
`);

    expect(tracker.title).toBe("Milestone Tracker");
    expect(tracker.overallStatus).toEqual({
      currentStage: "Implementation Planning",
      deliveryReadiness: "Not Ready",
      releaseConfidence: "Medium",
    });
    expect(tracker.sections.milestones.checklist).toEqual([
      { checked: true, text: "Project Kickoff" },
      { checked: false, text: "Implementation Planning" },
    ]);
    expect(tracker.milestoneCounts).toEqual({ complete: 1, total: 2 });
    expect(tracker.sections.blockers.items).toEqual(["No blockers recorded."]);
  });
});
