import { access } from "node:fs/promises";
import { join, resolve } from "node:path";

async function pathExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export type ResolveOutputPathOptions = {
  root: string;
  output?: string;
};

export async function resolveOutputPath(options: ResolveOutputPathOptions) {
  const root = resolve(options.root);

  if (options.output) {
    return resolve(root, options.output);
  }

  const docsPath = join(root, "docs");
  if (await pathExists(docsPath)) {
    return join(docsPath, "progress-tracker.html");
  }

  return join(root, "progress-tracker.html");
}
