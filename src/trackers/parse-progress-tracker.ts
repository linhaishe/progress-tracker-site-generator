import { normalizeSectionKey, parseMarkdownSections, type MarkdownSection } from "./parse-markdown.js";

export type ProgressSectionKey =
  | "currentPhase"
  | "currentGoal"
  | "recommendedNextWorkflow"
  | "nextUp"
  | "milestones"
  | "inProgress"
  | "completed"
  | "openQuestions"
  | "assumptions"
  | "risks"
  | "architectureDecisions"
  | "governanceComplianceAndReviewNotes"
  | "sessionNotes"
  | "verification";

export type ParsedProgressTracker = {
  title: string;
  sections: Partial<Record<ProgressSectionKey, MarkdownSection>>;
  unknownSections: Array<Pick<MarkdownSection, "title" | "items">>;
};

const knownKeys = new Set<ProgressSectionKey>([
  "currentPhase",
  "currentGoal",
  "recommendedNextWorkflow",
  "nextUp",
  "milestones",
  "inProgress",
  "completed",
  "openQuestions",
  "assumptions",
  "risks",
  "architectureDecisions",
  "governanceComplianceAndReviewNotes",
  "sessionNotes",
  "verification",
]);

export function parseProgressTracker(markdown: string): ParsedProgressTracker {
  const parsed = parseMarkdownSections(markdown);
  const sections: Partial<Record<ProgressSectionKey, MarkdownSection>> = {};
  const unknownSections: Array<Pick<MarkdownSection, "title" | "items">> = [];

  for (const section of parsed.sections) {
    const key = normalizeSectionKey(section.title) as ProgressSectionKey;
    if (knownKeys.has(key)) {
      sections[key] = section;
    } else {
      unknownSections.push({ title: section.title, items: section.items });
    }
  }

  return { title: parsed.title, sections, unknownSections };
}
