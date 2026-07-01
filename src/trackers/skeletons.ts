import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(currentDir, "..", "..");

export async function readTemplate(relativePath: string) {
  return readFile(join(packageRoot, relativePath), "utf8");
}

export async function readProgressSkeleton() {
  return readTemplate("templates/context/progress-tracker.md");
}
