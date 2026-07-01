import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export type ProjectDoc = {
  relativePath: string;
  content: string;
};

const RELEVANT_DOC_PATTERN = /\b(prd|product[-_\s]*requirements?|implementation|implement|stage[-_\s]*plan|roadmap|milestone)\b/i;
const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown", ".mdx"]);
const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(currentDir, "..", "..");

async function collectMarkdownFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectMarkdownFiles(path);
      }
      if (entry.isFile() && MARKDOWN_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        return [path];
      }
      return [];
    }),
  );

  return files.flat();
}

function isRelevantDoc(path: string) {
  return RELEVANT_DOC_PATTERN.test(path.replace(/[/\\]+/g, " "));
}

function quoteMarkdown(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "> Empty document.";
  return trimmed
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}

export async function readRelevantProjectDocs(root: string): Promise<ProjectDoc[]> {
  const docsPath = join(root, "docs");
  const markdownFiles = await collectMarkdownFiles(docsPath);
  const relevantFiles = markdownFiles
    .map((path) => ({
      path,
      relativePath: relative(root, path),
    }))
    .filter((file) => isRelevantDoc(file.relativePath))
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  return Promise.all(
    relevantFiles.map(async (file) => ({
      relativePath: file.relativePath,
      content: await readFile(file.path, "utf8"),
    })),
  );
}

export async function readPackagedReferenceDocs(): Promise<ProjectDoc[]> {
  const docsPath = join(packageRoot, "templates", "docs");
  const markdownFiles = await collectMarkdownFiles(docsPath);
  const referenceFiles = markdownFiles
    .map((path) => ({
      path,
      relativePath: relative(packageRoot, path),
    }))
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  return Promise.all(
    referenceFiles.map(async (file) => ({
      relativePath: file.relativePath,
      content: await readFile(file.path, "utf8"),
    })),
  );
}

export function appendProjectDocsContext(progressTemplate: string, docs: ProjectDoc[]) {
  if (docs.length === 0) return progressTemplate;

  const sections = docs.map((doc) => `### ${doc.relativePath}\n\n${quoteMarkdown(doc.content)}`);
  return `${progressTemplate.trimEnd()}\n\n## Project Docs Context\n\n${sections.join("\n\n")}\n`;
}
