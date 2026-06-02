# Contributing

Thanks for helping improve Codex Cleanup Artifacts.

## Good first contributions

- Add new fixture projects for common iteration leftovers.
- Improve classification rules for a specific ecosystem.
- Add tests for false positives that should be kept.
- Improve documentation for installing the Codex skill.

## Development

Run the test suite:

```bash
npm test
```

Run the scanner against the sample fixture:

```bash
node scripts/artifact-scan.js --root test/fixtures/sample-project
```

## Classification rule changes

When changing cleanup rules, include tests for both:

- The artifact that should be detected.
- A similar file that should be preserved or sent to review.

Deletion should stay conservative. It is better to produce a review item than to delete possible user work.
