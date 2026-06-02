import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { classify, deleteHighConfidence, scanProject } from "../scripts/artifact-scan.js";

test("classifies protected project files as keep", () => {
  const result = classify({
    name: "package.json",
    relative: "package.json",
    isDirectory: false
  });

  assert.equal(result.action, "keep");
  assert.equal(result.confidence, "protected");
});

test("classifies generated output directories as high-confidence candidates", () => {
  const result = classify({
    name: "coverage",
    relative: "coverage",
    isDirectory: true
  });

  assert.equal(result.action, "candidate");
  assert.equal(result.confidence, "high");
});

test("classifies temporary source files as review items", () => {
  const result = classify({
    name: "scratch-helper.js",
    relative: "scratch-helper.js",
    isDirectory: false
  });

  assert.equal(result.action, "review");
  assert.equal(result.confidence, "medium");
});

test("scans a fixture project and summarizes candidates", async () => {
  const root = path.join(import.meta.dirname, "fixtures", "sample-project");
  const report = await scanProject(root);

  assert.equal(report.summary.candidates, 2);
  assert.equal(report.summary.review, 2);
  assert.equal(report.summary.protected, 1);
});

test("deletes only high-confidence candidates", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cleanup-artifacts-"));
  await mkdir(path.join(root, "coverage"));
  await writeFile(path.join(root, "debug.log"), "debug output");
  await writeFile(path.join(root, "scratch-helper.js"), "export const x = 1;");

  const report = await scanProject(root);
  const deleted = await deleteHighConfidence(report);

  assert.deepEqual(deleted.sort(), ["coverage", "debug.log"]);

  const after = await scanProject(root);
  assert.equal(after.entries.some((entry) => entry.path === "scratch-helper.js"), true);
});
