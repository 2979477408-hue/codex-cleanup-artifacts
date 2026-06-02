# Codex for Open Source Application Draft

Use this draft after publishing the repository as a public GitHub project.

## Repository

`https://github.com/<your-username>/codex-cleanup-artifacts`

## Maintainer role

Primary maintainer

## Why this repository qualifies

`codex-cleanup-artifacts` addresses a new maintenance problem created by AI-assisted coding: project iterations often leave behind temporary drafts, debug screenshots, logs, stale exports, cache folders, and duplicate deliverables. Removing these artifacts manually is slow and risky because maintainers must avoid deleting source, tests, configuration, final outputs, or user-authored assets. This repository provides a Codex skill and a conservative scanner that classifies cleanup candidates by confidence, explains why each file was flagged, and defaults ambiguous files to review instead of deletion. It is designed for open source maintainers who want cleaner repositories and safer AI coding handoffs.

## How API credits would be used

API credits would be used to improve safe artifact classification across real open source workflows. Planned uses include testing the scanner against diverse fixture projects, generating and reviewing cleanup reports for pull requests, improving issue triage for false positives and false negatives, creating ecosystem-specific cleanup presets for Node, Python, Godot, frontend, and media-heavy projects, and producing documentation examples that help maintainers adopt conservative AI-assisted cleanup without risking source files or final deliverables.

## Evidence to add before submitting

- Public GitHub repository URL
- First release or tagged version
- A few issues showing roadmap and feedback collection
- Screenshots or logs showing the scanner on real projects
- Any stars, forks, users, or external mentions after publishing
- Examples of you maintaining the project through commits, issues, and pull requests
