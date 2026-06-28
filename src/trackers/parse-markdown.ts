export type ChecklistItem = {
  checked: boolean;
  text: string;
};

export type MarkdownSection = {
  title: string;
  raw: string;
  items: string[];
  checklist: ChecklistItem[];
};

export function normalizeSectionKey(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

export function parseMarkdownSections(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const title = normalized.match(/^#\s+(.+)$/m)?.[1]?.trim() || "Tracker";
  const headingMatches = Array.from(normalized.matchAll(/^##\s+(.+)$/gm));
  const sections: MarkdownSection[] = headingMatches.map((match, index) => {
    const next = headingMatches[index + 1];
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? normalized.length;
    const raw = normalized.slice(start, end).trim();
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      title: match[1]?.trim() || "Untitled Section",
      raw,
      items: lines.map((line) => line.replace(/^[-*]\s+/, "").replace(/^\[[ xX]\]\s+/, "")),
      checklist: lines
        .map((line) => line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/))
        .filter((lineMatch): lineMatch is RegExpMatchArray => Boolean(lineMatch))
        .map((lineMatch) => ({
          checked: lineMatch[1]?.toLowerCase() === "x",
          text: lineMatch[2]?.trim() || "",
        })),
    };
  });

  return { title, sections };
}

export function parseLabelValueItems(items: string[]) {
  const result: Record<string, string> = {};

  for (const item of items) {
    const match = item.match(/^([^:]+):\s*(.+)$/);
    if (match?.[1] && match[2]) {
      result[normalizeSectionKey(match[1])] = match[2].trim();
    }
  }

  return result;
}
