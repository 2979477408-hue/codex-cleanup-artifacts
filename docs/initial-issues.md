# Initial Issues

Use these as the first public issues after publishing.

## 1. Add Git-aware current-iteration detection

The scanner should use Git metadata to distinguish files created or modified during the current AI coding iteration from long-lived project files. This would reduce false positives and make cleanup reports more useful after Codex sessions.

Acceptance criteria:

- Detect untracked files separately from tracked files.
- Surface modified tracked files as review-only unless explicitly disposable.
- Include tests for untracked temporary files and tracked files with temporary-looking names.

## 2. Add Node, Python, and Godot cleanup presets

Add ecosystem-specific presets for common generated outputs and caches.

Initial presets:

- Node: `.next`, `.vite`, `.turbo`, `dist`, `coverage`
- Python: `.pytest_cache`, `.ruff_cache`, `__pycache__`, `.mypy_cache`
- Godot: `.godot`, export logs, temporary imported outputs

Acceptance criteria:

- Presets are documented.
- Presets include tests for both disposable and protected files.
- Presets avoid deleting source assets or final deliverables.

## 3. Search references before suggesting deletion

The scanner should detect whether a candidate file is referenced by source, docs, config, or manifests before marking it as disposable.

Acceptance criteria:

- Search by relative path and basename.
- Referenced files should become review items or protected items.
- Include tests for imported files, linked images, and documented outputs.
