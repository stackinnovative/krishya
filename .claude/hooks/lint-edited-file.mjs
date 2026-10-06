// PostToolUse hook: lint the file Claude just edited with that project's own ESLint.
// Exit 2 + stderr = errors are fed back to Claude so it fixes them right away.
// Exit 0 = clean, or not a file we lint.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const PROJECTS = ["backend", "frontend-next"];

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (!filePath || !/\.(ts|tsx)$/.test(filePath)) process.exit(0);

// Walk up from the edited file to its project folder (works regardless of path style).
const abs = path.resolve(filePath);
let project = null;
for (let dir = path.dirname(abs); dir !== path.dirname(dir); dir = path.dirname(dir)) {
  if (PROJECTS.includes(path.basename(dir)) && existsSync(path.join(dir, "eslint.config.mjs"))) {
    project = dir;
    break;
  }
}
if (!project) process.exit(0);
const repoRoot = path.dirname(project);

const eslintBin = path.join(project, "node_modules", "eslint", "bin", "eslint.js");
if (!existsSync(eslintBin)) process.exit(0); // deps not installed yet - don't block

const result = spawnSync(process.execPath, [eslintBin, "--no-warn-ignored", abs], {
  cwd: project,
  encoding: "utf8",
});

if (result.status === 0) process.exit(0);

const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
process.stderr.write(
  `ESLint found problems in ${path.relative(repoRoot, abs)}. Fix them before continuing ` +
    `(see ${path.basename(project)}/ESLINT.md; never add eslint-disable or edit eslint-suppressions.json to hide them):\n\n${output}\n`
);
process.exit(2);
