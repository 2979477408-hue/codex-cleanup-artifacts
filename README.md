# Codex Cleanup Artifacts

A Codex skill and small CLI scanner for safely identifying disposable files left behind during AI coding iterations.

AI-assisted project work often leaves drafts, debug screenshots, old exports, logs, coverage output, cache folders, and one-off prototypes. This project helps maintainers clean those leftovers without treating deletion as a guessing game.

## What it does

- Provides a Codex skill for project handoff cleanup.
- Scans a project and classifies likely disposable artifacts.
- Outputs reasons for each cleanup candidate.
- Keeps deletion conservative by default.
- Supports optional deletion of only high-confidence disposable files.

## Install the skill

Copy the `skill/` directory into your Codex skills folder and name it `cleanup-iteration-artifacts`:

```powershell
Copy-Item -Recurse -Force .\skill $env:USERPROFILE\.codex\skills\cleanup-iteration-artifacts
```

Then ask Codex:

```text
Use $cleanup-iteration-artifacts to clean disposable files created during this project iteration.
```

## Use the scanner

Run a report from this repository:

```bash
node scripts/artifact-scan.js --root /path/to/project
```

Machine-readable output:

```bash
node scripts/artifact-scan.js --root /path/to/project --json
```

Delete only high-confidence disposable artifacts:

```bash
node scripts/artifact-scan.js --root /path/to/project --delete-high-confidence
```

The scanner does not delete medium-confidence review items. Those should be inspected by a maintainer or by Codex using the bundled skill workflow.

## Classification model

High-confidence candidates include:

- Known generated directories like `coverage`, `.pytest_cache`, `.turbo`, `tmp`, and `temp`
- Disposable extensions like `.log`, `.tmp`, `.bak`, `.old`, and `.orig`

Medium-confidence review items include:

- Files with names like `draft-*`, `scratch-*`, `debug-*`, or `tmp-*`
- Debug or draft media such as screenshots and captures
- Source or documentation files that look temporary but could contain user work

Protected items include:

- Source code
- Config files
- Lockfiles and dependency manifests
- Environment files
- Tests
- Requested documentation
- Final deliverables and original media unless clearly disposable

## Repository layout

```text
skill/                  Codex skill users can install
scripts/artifact-scan.js CLI scanner
test/                   Node test suite
examples/               Example scanner output
```

## Roadmap

- Git-aware detection for files created in the current iteration
- Reference search to detect whether candidate files are imported or linked
- Project presets for Node, Python, Godot, frontend apps, and media-heavy workflows
- Safer interactive deletion flow
- More fixtures that model real Codex-generated project leftovers

## Why this may qualify for Codex for Open Source

This project targets a real maintenance problem created by AI coding workflows: disposable iteration output is easy to create and risky to remove. The skill and scanner help maintainers keep open source repositories tidy while preserving source, tests, assets, and final deliverables.

## License

MIT
