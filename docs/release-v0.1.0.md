# v0.1.0

Initial public release of Codex Cleanup Artifacts.

## Highlights

- Add a Codex skill for conservative project handoff cleanup.
- Add a Node.js scanner that classifies likely disposable iteration artifacts.
- Report high-confidence cleanup candidates separately from medium-confidence review items.
- Preserve project files such as source, configs, lockfiles, docs, tests, and environment files by default.
- Add sample fixtures, tests, GitHub Actions, contribution notes, and Codex for Open Source application draft.

## Validation

- `npm test`
- `node scripts/artifact-scan.js --root test/fixtures/sample-project`
