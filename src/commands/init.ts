import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { createInstallPlan, type FileAction } from "../core/file-plan.js";
import { resolveOutputPath } from "../core/output-path.js";
import { renderProgressPage } from "../render/render-page.js";
import { parseMilestoneTracker } from "../trackers/parse-milestone-tracker.js";
import { parseProgressTracker } from "../trackers/parse-progress-tracker.js";
import { readMilestoneSkeleton, readProgressSkeleton } from "../trackers/skeletons.js";

export type RunInitOptions = {
  root: string;
  output?: string;
  dryRun: boolean;
  force: boolean;
};

export type RunInitResult = {
  exitCode: number;
  output: string;
};

function group(actions: FileAction[], kind: FileAction["kind"]) {
  return actions.filter((action) => action.kind === kind);
}

function linesFor(title: string, actions: FileAction[]) {
  if (actions.length === 0) return [];
  return [`${title}:`, ...actions.map((action) => `- ${action.relativePath}`)];
}

function formatReport(planActions: FileAction[], outputPath: string, root: string, dryRun: boolean, hasConflicts: boolean) {
  const lines = [
    dryRun ? "Dry run only." : hasConflicts ? "Progress tracker site has conflicts." : "Progress tracker site installed.",
    "",
    ...linesFor("Created", group(planActions, "create")),
    ...linesFor("Overwritten", group(planActions, "overwrite")),
    ...linesFor("Existing", group(planActions, "preserve")),
    ...linesFor("Conflicts", group(planActions, "conflict")),
    "",
    `Open: ${relative(root, outputPath)}`,
  ];

  return lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n").trimEnd();
}

export async function runInit(options: RunInitOptions): Promise<RunInitResult> {
  const root = resolve(options.root);
  const outputPath = await resolveOutputPath({ root, output: options.output });
  const plan = await createInstallPlan({ root, outputPath, force: options.force });

  if (!options.dryRun && !plan.hasConflicts) {
    await mkdir(resolve(root, "context"), { recursive: true });
    await mkdir(dirname(outputPath), { recursive: true });

    const progressAction = plan.actions.find((action) => action.relativePath === "context/progress-tracker.md");
    const milestoneAction = plan.actions.find((action) => action.relativePath === "context/milestone-tracker.md");

    if (progressAction?.kind === "create") {
      await writeFile(progressAction.path, await readProgressSkeleton(), "utf8");
    }
    if (milestoneAction?.kind === "create") {
      await writeFile(milestoneAction.path, await readMilestoneSkeleton(), "utf8");
    }

    const progressMarkdown = await readFile(resolve(root, "context/progress-tracker.md"), "utf8");
    const milestoneMarkdown = await readFile(resolve(root, "context/milestone-tracker.md"), "utf8");
    const htmlAction = plan.actions.find((action) => action.path === outputPath);

    if (htmlAction?.kind === "create" || htmlAction?.kind === "overwrite") {
      await writeFile(
        outputPath,
        renderProgressPage({
          generatedAt: new Date().toISOString(),
          sourcePaths: {
            progress: "context/progress-tracker.md",
            milestone: "context/milestone-tracker.md",
          },
          progressMarkdown,
          milestoneMarkdown,
          progress: parseProgressTracker(progressMarkdown),
          milestone: parseMilestoneTracker(milestoneMarkdown),
        }),
        "utf8",
      );
    }
  }

  return {
    exitCode: plan.hasConflicts ? 1 : 0,
    output: formatReport(plan.actions, outputPath, root, options.dryRun, plan.hasConflicts),
  };
}
