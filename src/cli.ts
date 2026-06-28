import { runInit } from "./commands/init.js";

export type ParsedArgs = {
  command: "init";
  root: string;
  output?: string;
  dryRun: boolean;
  force: boolean;
};

export function parseArgs(args: string[]): ParsedArgs {
  const [command, ...rest] = args;

  if (!command || command === "--help" || command === "-h") {
    throw new Error("Usage: progress-tracker-site init [--root .] [--output docs/progress-tracker.html] [--dry-run] [--force]");
  }

  if (command !== "init") {
    throw new Error(`Unknown command: ${command}`);
  }

  const parsed: ParsedArgs = {
    command: "init",
    root: ".",
    dryRun: false,
    force: false,
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
    } else {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return parsed;
}

export async function main(args: string[]) {
  const parsed = parseArgs(args);
  const result = await runInit(parsed);
  console.log(result.output);
  process.exitCode = result.exitCode;
}
