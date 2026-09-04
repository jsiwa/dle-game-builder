#!/usr/bin/env node

import { access, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = resolve(repositoryRoot, "plugins/dle-game-builder");
const skillRoot = resolve(pluginRoot, "skills/dle-game-builder");
const errors = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function requirePath(path) {
  if (!(await exists(path))) errors.push(`Missing ${relative(repositoryRoot, path)}`);
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${relative(repositoryRoot, path)}: ${error.message}`);
    return undefined;
  }
}

const requiredPaths = [
  resolve(skillRoot, "SKILL.md"),
  resolve(skillRoot, "agents/openai.yaml"),
  resolve(skillRoot, "assets/puzzle.schema.json"),
  resolve(skillRoot, "scripts/daily-key.mjs"),
  resolve(skillRoot, "scripts/validate-puzzles.mjs"),
  resolve(pluginRoot, ".codex-plugin/plugin.json"),
  resolve(pluginRoot, ".claude-plugin/plugin.json"),
  resolve(pluginRoot, "LICENSE"),
  resolve(pluginRoot, "README.md"),
  resolve(repositoryRoot, ".agents/plugins/marketplace.json"),
  resolve(repositoryRoot, ".claude-plugin/marketplace.json"),
  resolve(repositoryRoot, "README.md"),
  resolve(repositoryRoot, "README.zh-CN.md"),
  resolve(repositoryRoot, "evals/cases.md"),
];

await Promise.all(requiredPaths.map(requirePath));

if (await exists(resolve(repositoryRoot, "SKILL.md"))) {
  errors.push("SKILL.md must live in the named skill directory, not the repository root.");
}

const packageJson = await readJson(resolve(repositoryRoot, "package.json"));
const skillPath = resolve(skillRoot, "SKILL.md");
if (await exists(skillPath)) {
  const skillText = await readFile(skillPath, "utf8");
  const frontmatter = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---/u)?.[1];
  if (!frontmatter) {
    errors.push("SKILL.md is missing YAML frontmatter.");
  } else {
    const name = frontmatter.match(/^name:\s*(.+)$/mu)?.[1]?.trim();
    const description = frontmatter.match(/^description:\s*(.+)$/mu)?.[1]?.trim();
    const version = frontmatter.match(/^\s+version:\s*["']?([^"'\s]+)["']?$/mu)?.[1];
    if (name !== "dle-game-builder") errors.push("SKILL.md name must be dle-game-builder.");
    if (!description || description.length > 1024) errors.push("SKILL.md description must contain 1-1024 characters.");
    if (version !== packageJson?.version) errors.push("SKILL.md metadata.version must match package.json.");
    if (/^compatibility:/mu.test(frontmatter)) {
      errors.push("Keep runtime requirements in the body so current Codex validation remains compatible.");
    }
  }

  const localLinkPattern = /\]\((?!https?:|#)([^)]+)\)/gu;
  for (const match of skillText.matchAll(localLinkPattern)) {
    const linkedPath = resolve(skillRoot, match[1]);
    if (!(await exists(linkedPath))) {
      errors.push(`Broken SKILL.md link: ${match[1]}`);
    }
  }

  if (/^\s*node scripts\//mu.test(skillText)) {
    errors.push("SKILL.md must not invoke bundled scripts relative to the user's working directory.");
  }
}

const codexManifest = await readJson(resolve(pluginRoot, ".codex-plugin/plugin.json"));
const claudeManifest = await readJson(resolve(pluginRoot, ".claude-plugin/plugin.json"));

for (const [label, manifest] of [
  ["Codex", codexManifest],
  ["Claude Code", claudeManifest],
]) {
  if (!manifest) continue;
  if (manifest.name !== "dle-game-builder") errors.push(`${label} plugin name is inconsistent.`);
  if (manifest.version !== packageJson?.version) errors.push(`${label} plugin version is inconsistent.`);
  if (!manifest.author?.name) errors.push(`${label} plugin author is missing.`);
  if (manifest.skills !== "./skills/") errors.push(`${label} plugin skills path must be ./skills/.`);
}

if (codexManifest && !codexManifest.interface?.defaultPrompt?.length) {
  errors.push("Codex plugin needs at least one default prompt.");
}

const codexMarketplace = await readJson(resolve(repositoryRoot, ".agents/plugins/marketplace.json"));
const claudeMarketplace = await readJson(resolve(repositoryRoot, ".claude-plugin/marketplace.json"));

for (const [label, marketplace] of [
  ["Codex", codexMarketplace],
  ["Claude Code", claudeMarketplace],
]) {
  const entry = marketplace?.plugins?.find((plugin) => plugin.name === "dle-game-builder");
  if (!entry) {
    errors.push(`${label} marketplace is missing dle-game-builder.`);
    continue;
  }
  const sourcePath = typeof entry.source === "string" ? entry.source : entry.source?.path;
  if (sourcePath !== "./plugins/dle-game-builder") {
    errors.push(`${label} marketplace source path is inconsistent.`);
  } else if (!(await exists(resolve(repositoryRoot, sourcePath)))) {
    errors.push(`${label} marketplace source does not exist.`);
  }
  if (entry.version !== undefined && entry.version !== packageJson?.version) {
    errors.push(`${label} marketplace version is inconsistent.`);
  }
}

const openaiYamlPath = resolve(skillRoot, "agents/openai.yaml");
if (await exists(openaiYamlPath)) {
  const openaiYaml = await readFile(openaiYamlPath, "utf8");
  if (!openaiYaml.includes("$dle-game-builder")) {
    errors.push("agents/openai.yaml default_prompt must mention $dle-game-builder.");
  }
}

for (const scriptName of ["daily-key.mjs", "validate-puzzles.mjs"]) {
  const scriptPath = resolve(skillRoot, "scripts", scriptName);
  if (await exists(scriptPath)) {
    const scriptStat = await stat(scriptPath);
    if ((scriptStat.mode & 0o111) === 0) errors.push(`${scriptName} must be executable.`);
  }
}

const englishReadme = await readFile(resolve(repositoryRoot, "README.md"), "utf8");
const chineseReadme = await readFile(resolve(repositoryRoot, "README.zh-CN.md"), "utf8");
if (!englishReadme.includes("[简体中文](README.zh-CN.md)")) errors.push("English README needs a Chinese link.");
if (!chineseReadme.includes("[English](README.md)")) errors.push("Chinese README needs an English link.");

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  console.error(`\nPackage validation failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log("Package validation passed.");
}
