import { watch } from "node:fs";
import type { FSWatcher } from "node:fs";
import { resolve } from "node:path";
import { runInit, type RunInitOptions, type RunInitResult } from "./init.js";

const WATCHED_CONTEXT_FILES = new Set(["progress-tracker.md", "milestone-tracker.md", "design.md"]);

export type WatchSession = {
  close: () => void;
};

export type WatchLogger = {
  log: (message: string) => void;
  error: (message: string) => void;
};

export type StartWatchDependencies = {
  runInit?: (options: RunInitOptions) => Promise<RunInitResult>;
  watchDirectory?: (
    path: string,
    listener: (eventType: string, filename: string | Buffer | null) => void,
  ) => Pick<FSWatcher, "close">;
  debounceMs?: number;
  logger?: WatchLogger;
};

export function shouldRegenerateForWatchEvent(filename: string | Buffer | null) {
  if (!filename) return false;
  return WATCHED_CONTEXT_FILES.has(filename.toString());
}

function timestamp() {
  return new Date().toISOString();
}

export async function startWatch(options: RunInitOptions, dependencies: StartWatchDependencies = {}): Promise<WatchSession> {
  const root = resolve(options.root);
  const contextPath = resolve(root, "context");
  const regenerate = dependencies.runInit ?? runInit;
  const watchDirectory =
    dependencies.watchDirectory ??
    ((path, listener) => watch(path, { persistent: true }, listener));
  const logger = dependencies.logger ?? console;
  const debounceMs = dependencies.debounceMs ?? 150;
  let timer: NodeJS.Timeout | undefined;
  let running = false;
  let pending = false;

  async function runOnce(reason: string) {
    if (running) {
      pending = true;
      return;
    }

    running = true;
    try {
      const result = await regenerate({
        root,
        output: options.output,
        dryRun: false,
        force: true,
      });
      logger.log(`[${timestamp()}] ${reason}\n${result.output}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[${timestamp()}] Failed to regenerate progress tracker site: ${message}`);
    } finally {
      running = false;
      if (pending) {
        pending = false;
        await runOnce("Regenerated after pending changes.");
      }
    }
  }

  function schedule(filename: string | Buffer | null) {
    if (!shouldRegenerateForWatchEvent(filename)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      void runOnce(`Regenerated after ${filename?.toString()} changed.`);
    }, debounceMs);
  }

  await runOnce("Initial generation complete.");
  const watcher = watchDirectory(contextPath, (_eventType, filename) => schedule(filename));
  logger.log(`Watching context/progress-tracker.md, context/milestone-tracker.md, context/design.md`);

  return {
    close() {
      if (timer) clearTimeout(timer);
      watcher.close();
    },
  };
}
