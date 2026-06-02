---
name: cleanup-iteration-artifacts
description: Clean up redundant files produced during project/content iterations after Codex finishes work, such as disposable drafts, temporary exports, stale screenshots, debug logs, throwaway prototypes, generated caches, and superseded intermediate outputs. Use when the user asks to clean project leftovers, remove extra iteration artifacts, delete redundant deliverables, tidy the workspace after a project, or says "cleanup artifacts", "delete iteration junk", "project handoff cleanup", "清理产物", "删除多余产物", "项目收尾", "迭代垃圾", or "多余文件".
---

# Cleanup Iteration Artifacts

Use this skill near the end of a project task or content iteration to leave the workspace with only the necessary source, assets, tests, configuration, documentation, and final deliverables.

## Workflow

1. Define the cleanup boundary:
   - Identify the project root, current user request, required final outputs, and files created or changed during this iteration.
   - Check `git status --short` when the directory is a Git repo.
   - If the boundary is unclear, ask before deleting anything.

2. Generate a candidate report:
   - If this repository is available, run `node scripts/artifact-scan.js --root <project-root> --json`.
   - Otherwise use `rg --files`, project-native tools, and the same classification rules.
   - Prefer reporting candidates before deletion when there are many files or any ambiguity.

3. Classify files conservatively:
   - Keep source code, configs, lockfiles, tests, requested docs, real assets, final deliverables, user-authored files, and files referenced by the project.
   - Treat as usually disposable only when created during the current iteration and unreferenced: `tmp*`, `scratch*`, `draft*`, debug screenshots, one-off logs, replaced prototype files, stale local exports, regenerated build output, coverage output, and caches.
   - Never delete without explicit approval: files outside the project root, tracked files not created in this iteration, broad directories, original media, databases, secrets, dependency manifests, environment files, or generated files that are required deliverables.

4. Verify candidates:
   - Check `git status --short` and `git diff --name-only` where useful.
   - Search references by filename or basename with `rg`.
   - For ambiguous candidates, keep them and report why.

5. Delete safely:
   - Delete only clearly disposable candidates inside the project root.
   - On Windows, prefer `Remove-Item -LiteralPath ...`; before recursive deletion, verify each resolved absolute target remains inside the intended workspace or exact target directory.
   - Avoid broad globs and cross-shell deletion pipelines.

6. Validate and report:
   - Rerun focused tests, build, lint, or project checks if cleanup could affect behavior.
   - In the final response, list what was deleted, what was intentionally kept because it was ambiguous, and what verification ran.

## Deletion Bias

Default to preserving user work. A slightly cluttered workspace is better than losing a source asset, final output, or context the user expected to keep.
