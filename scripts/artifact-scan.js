#!/usr/bin/env node
import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DEFAULT_IGNORES = new Set([
  ".git",
  "node_modules",
  ".venv",
  "venv",
  "__pycache__",
  ".idea",
  ".vscode"
]);

const PROTECTED_BASENAMES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "Cargo.toml",
  "Cargo.lock",
  "pyproject.toml",
  "requirements.txt",
  "README.md",
  "LICENSE"
]);

const PROTECTED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".rs",
  ".go",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".gd",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".md"
]);

const MEDIA_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".mp4",
  ".mov",
  ".wav",
  ".mp3",
  ".psd",
  ".blend",
  ".kra"
]);

const DISPOSABLE_DIRS = new Set([
  ".cache",
  ".turbo",
  ".parcel-cache",
  ".pytest_cache",
  ".ruff_cache",
  "coverage",
  ".nyc_output",
  "tmp",
  "temp"
]);

const DISPOSABLE_EXTENSIONS = new Set([
  ".log",
  ".tmp",
  ".bak",
  ".old",
  ".orig"
]);

const DISPOSABLE_NAME_PATTERNS = [
  /^tmp[-_.]?/i,
  /^temp[-_.]?/i,
  /^scratch[-_.]?/i,
  /^draft[-_.]?/i,
  /^debug[-_.]?/i,
  /^test-output[-_.]?/i,
  /^playwright-report$/i,
  /^artifact[-_.]?/i,
  /[-_.]draft[-_.]/i,
  /[-_.]scratch[-_.]/i,
  /[-_.]debug[-_.]/i,
  /[-_.]old[-_.]/i
];

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    json: false,
    deleteHighConfidence: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      args.root = argv[++i];
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--delete-high-confidence") {
      args.deleteHighConfidence = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/artifact-scan.js [--root <path>] [--json] [--delete-high-confidence]

Scans a project for likely disposable iteration artifacts.

Options:
  --root <path>                 Project root to scan. Defaults to cwd.
  --json                        Print machine-readable JSON.
  --delete-high-confidence      Delete only high-confidence disposable files/directories.
  --help                        Show this help message.`);
}

async function walk(root, current = root, entries = []) {
  const items = await readdir(current, { withFileTypes: true });
  for (const item of items) {
    const absolute = path.join(current, item.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, "/");

    if (item.isDirectory() && DEFAULT_IGNORES.has(item.name)) {
      continue;
    }

    entries.push({
      absolute,
      relative,
      name: item.name,
      isDirectory: item.isDirectory()
    });

    if (item.isDirectory()) {
      await walk(root, absolute, entries);
    }
  }
  return entries;
}

function classify(entry) {
  const ext = path.extname(entry.name).toLowerCase();
  const lowerName = entry.name.toLowerCase();
  const reasons = [];

  if (PROTECTED_BASENAMES.has(entry.name) || PROTECTED_BASENAMES.has(lowerName)) {
    return { action: "keep", confidence: "protected", reasons: ["protected project or environment file"] };
  }

  if (entry.isDirectory && DISPOSABLE_DIRS.has(entry.name)) {
    return { action: "candidate", confidence: "high", reasons: ["known generated cache/output directory"] };
  }

  if (!entry.isDirectory && DISPOSABLE_EXTENSIONS.has(ext)) {
    return { action: "candidate", confidence: "high", reasons: [`disposable extension ${ext}`] };
  }

  if (DISPOSABLE_NAME_PATTERNS.some((pattern) => pattern.test(entry.name))) {
    reasons.push("temporary or iteration-like filename");
  }

  if (MEDIA_EXTENSIONS.has(ext) && /screenshot|capture|debug|draft|tmp|temp/i.test(entry.name)) {
    reasons.push("debug/draft media asset name");
  }

  if (PROTECTED_EXTENSIONS.has(ext) && reasons.length > 0) {
    return {
      action: "review",
      confidence: "medium",
      reasons: [...reasons, "source/document extension requires review"]
    };
  }

  if (MEDIA_EXTENSIONS.has(ext) && reasons.length > 0) {
    return {
      action: "review",
      confidence: "medium",
      reasons: [...reasons, "media may be source material or final output"]
    };
  }

  if (reasons.length > 0) {
    return { action: "candidate", confidence: "medium", reasons };
  }

  return { action: "keep", confidence: "low", reasons: ["no disposable pattern matched"] };
}

function insideRoot(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function scanProject(root) {
  const absoluteRoot = path.resolve(root);
  const rootStat = await stat(absoluteRoot);
  if (!rootStat.isDirectory()) {
    throw new Error(`Root is not a directory: ${absoluteRoot}`);
  }

  const entries = await walk(absoluteRoot);
  const classified = entries.map((entry) => ({
    path: entry.relative,
    type: entry.isDirectory ? "directory" : "file",
    ...classify(entry),
    absolute: entry.absolute
  }));

  return {
    root: absoluteRoot,
    summary: {
      total: classified.length,
      candidates: classified.filter((entry) => entry.action === "candidate").length,
      review: classified.filter((entry) => entry.action === "review").length,
      protected: classified.filter((entry) => entry.confidence === "protected").length
    },
    entries: classified
  };
}

async function deleteHighConfidence(report) {
  const deleted = [];
  for (const entry of report.entries) {
    if (entry.action !== "candidate" || entry.confidence !== "high") {
      continue;
    }
    if (!insideRoot(report.root, entry.absolute)) {
      throw new Error(`Refusing to delete outside root: ${entry.absolute}`);
    }
    await rm(entry.absolute, { recursive: entry.type === "directory", force: true });
    deleted.push(entry.path);
  }
  return deleted;
}

function printText(report, deleted = []) {
  console.log(`Scanned: ${report.root}`);
  console.log(`Candidates: ${report.summary.candidates}`);
  console.log(`Needs review: ${report.summary.review}`);
  console.log(`Protected: ${report.summary.protected}`);

  const visible = report.entries.filter((entry) => entry.action !== "keep");
  if (visible.length === 0) {
    console.log("\nNo disposable artifacts found.");
  } else {
    console.log("\nCleanup candidates:");
    for (const entry of visible) {
      console.log(`- [${entry.confidence}] ${entry.path} (${entry.type})`);
      console.log(`  ${entry.reasons.join("; ")}`);
    }
  }

  if (deleted.length > 0) {
    console.log("\nDeleted high-confidence artifacts:");
    for (const file of deleted) {
      console.log(`- ${file}`);
    }
  }
}

export { classify, deleteHighConfidence, scanProject };

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const report = await scanProject(args.root);
    const deleted = args.deleteHighConfidence ? await deleteHighConfidence(report) : [];

    if (args.json) {
      console.log(JSON.stringify({ ...report, deleted }, null, 2));
    } else {
      printText(report, deleted);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
