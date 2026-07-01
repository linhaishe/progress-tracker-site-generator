import { runInit } from "./commands/init.js";
import { startWatch } from "./commands/watch.js";

export type ParsedArgs = {
  command: "init";
  root: string;
  output?: string;
  dryRun: boolean;
  force: boolean;
  watch: boolean;
  ai: boolean;
};

export function parseArgs(args: string[]): ParsedArgs {
  const [command, ...rest] = args;

  if (!command || command === "--help" || command === "-h") {
    throw new Error(
      "Usage: progress-tracker-site-generator init [--root .] [--output docs/progress-tracker.html] [--dry-run] [--force] [--watch] [--ai]",
    );
  }

  if (command !== "init") {
    throw new Error(`Unknown command: ${command}`);
  }

  const parsed: ParsedArgs = {
    command: "init",
    root: ".",
    dryRun: false,
    force: false,
    watch: false,
    ai: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--root") {
      parsed.root = rest[index + 1] ?? ".";
      index += 1;
    } else if (arg === "--output") {
      parsed.output = rest[index + 1];
      index += 1;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--force") {
      parsed.force = true;
    } else if (arg === "--watch") {
      parsed.watch = true;
    } else if (arg === "--ai") {
      parsed.ai = true;
    } else {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  if (parsed.watch && parsed.dryRun) {
    throw new Error("--watch cannot be combined with --dry-run");
  }

  return parsed;
}

export async function main(args: string[]) {
  const parsed = parseArgs(args);
  if (parsed.watch) {
    await startWatch(parsed);
    return;
  }

  const result = await runInit(parsed);
  console.log(result.output);
  process.exitCode = result.exitCode;
}
