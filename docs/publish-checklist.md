# Publish Checklist

## Before publishing

- Run `npm test`.
- Run `node scripts/artifact-scan.js --root test/fixtures/sample-project`.
- Commit the initial project files.
- Create a public GitHub repository named `codex-cleanup-artifacts`.
- Push the local repository to GitHub.

## After publishing

- Open 3 initial issues:
  - Add Git-aware current-iteration detection.
  - Add Node/Python/Godot project presets.
  - Add reference search for imported or linked candidate files.
- Create a `v0.1.0` release.
- Add the GitHub URL to `docs/codex-for-open-source-application.md`.
- Use the application draft when applying to Codex for Open Source.

## Suggested first issue text

Title: Add Git-aware current-iteration detection

Body:

The scanner should use Git metadata to distinguish files created or modified during the current AI coding iteration from long-lived project files. This would reduce false positives and make cleanup reports more useful after Codex sessions.
