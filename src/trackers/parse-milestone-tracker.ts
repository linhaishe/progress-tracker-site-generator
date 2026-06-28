import {
  normalizeSectionKey,
  parseLabelValueItems,
  parseMarkdownSections,
  type MarkdownSection,
} from "./parse-markdown.js";

export type MilestoneSectionKey =
  | "overallStatus"
  | "milestones"
  | "currentMilestone"
  | "currentMilestoneExitCriteria"
  | "deliveryScope"
  | "blockers"
  | "milestoneNotes";

export type ParsedMilestoneTracker = {
  title: string;
  overallStatus: {
    currentStage?: string;
    deliveryReadiness?: string;
    releaseConfidence?: string;
  };
  milestoneCounts: {
    complete: number;
    total: number;
  };
  sections: Partial<Record<MilestoneSectionKey, MarkdownSection>>;
  unknownSections: Array<Pick<MarkdownSection, "title" | "items">>;
};

const knownKeys = new Set<MilestoneSectionKey>([
  "overallStatus",
  "milestones",
  "currentMilestone",
  "currentMilestoneExitCriteria",
  "deliveryScope",
  "blockers",
  "milestoneNotes",
]);

export function parseMilestoneTracker(markdown: string): ParsedMilestoneTracker {
  const parsed = parseMarkdownSections(markdown);
  const sections: Partial<Record<MilestoneSectionKey, MarkdownSection>> = {};
  const unknownSections: Array<Pick<MarkdownSection, "title" | "items">> = [];

  for (const section of parsed.sections) {
    const key = normalizeSectionKey(section.title) as MilestoneSectionKey;
    if (knownKeys.has(key)) {
      sections[key] = section;
    } else {
      unknownSections.push({ title: section.title, items: section.items });
    }
  }

  const status = parseLabelValueItems(sections.overallStatus?.items ?? []);
  const milestones = sections.milestones?.checklist ?? [];

  return {
    title: parsed.title,
    overallStatus: {
      currentStage: status.currentStage,
      deliveryReadiness: status.deliveryReadiness,
      releaseConfidence: status.releaseConfidence,
    },
    milestoneCounts: {
      complete: milestones.filter((item) => item.checked).length,
      total: milestones.length,
    },
    sections,
    unknownSections,
  };
}
