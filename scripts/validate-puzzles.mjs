#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const KNOWN_KINDS = new Set([
  "token-feedback",
  "attribute-deduction",
  "clue-ladder",
  "progressive-reveal",
  "connections",
  "ordering",
  "grid",
  "drawing",
  "estimation",
  "map-pin",
  "higher-lower",
  "custom",
]);

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/validate-puzzles.mjs <puzzles.json>");
  process.exit(1);
}

const errors = [];
const warnings = [];

function normalize(value) {
  return String(value)
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en");
}

function isDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function itemId(item) {
  return typeof item === "string" ? item : item?.id;
}

try {
  const path = resolve(fileArg);
  const parsed = JSON.parse(await readFile(path, "utf8"));
  const puzzles = Array.isArray(parsed) ? parsed : parsed?.puzzles;

  if (!Array.isArray(puzzles) || puzzles.length === 0) {
    errors.push("Expected a non-empty puzzle array or an object with a non-empty puzzles array.");
  } else {
    const ids = new Set();
    const dates = new Set();
    let previousDate = "";

    puzzles.forEach((puzzle, index) => {
      const at = `puzzles[${index}]`;

      if (!puzzle || typeof puzzle !== "object" || Array.isArray(puzzle)) {
        errors.push(`${at} must be an object.`);
        return;
      }

      if (typeof puzzle.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(puzzle.id)) {
        errors.push(`${at}.id must be a lowercase kebab-case string.`);
      } else if (ids.has(puzzle.id)) {
        errors.push(`${at}.id duplicates "${puzzle.id}".`);
      } else {
        ids.add(puzzle.id);
      }

      if (typeof puzzle.date !== "string" || !isDateKey(puzzle.date)) {
        errors.push(`${at}.date must be a valid YYYY-MM-DD date.`);
      } else {
        if (dates.has(puzzle.date)) errors.push(`${at}.date duplicates "${puzzle.date}".`);
        dates.add(puzzle.date);
        if (previousDate && puzzle.date < previousDate) {
          warnings.push(`${at}.date is earlier than the preceding puzzle; consider sorting the schedule.`);
        }
        previousDate = puzzle.date;
      }

      if (!KNOWN_KINDS.has(puzzle.kind)) {
        errors.push(`${at}.kind is missing or unknown.`);
      }

      if (typeof puzzle.title !== "string" || puzzle.title.trim().length === 0) {
        errors.push(`${at}.title is required.`);
      }

      if (!["draft", "review", "approved", "published", "retired"].includes(puzzle.status)) {
        errors.push(`${at}.status is missing or invalid.`);
      }

      if (Number.isInteger(puzzle.difficulty) && (puzzle.difficulty < 1 || puzzle.difficulty > 5)) {
        errors.push(`${at}.difficulty must be from 1 to 5.`);
      }

      if (
        typeof puzzle.answer === "string" &&
        typeof puzzle.prompt === "string" &&
        !puzzle.allowAnswerInPrompt &&
        normalize(puzzle.answer).length >= 3 &&
        normalize(puzzle.prompt).includes(normalize(puzzle.answer))
      ) {
        warnings.push(`${at}.prompt appears to contain the answer "${puzzle.answer}".`);
      }

      if (Array.isArray(puzzle.aliases)) {
        const normalizedAliases = puzzle.aliases.map(normalize);
        if (new Set(normalizedAliases).size !== normalizedAliases.length) {
          warnings.push(`${at}.aliases contains duplicates after normalization.`);
        }
      }

      if (puzzle.kind === "clue-ladder") {
        if (typeof puzzle.answer !== "string" || puzzle.answer.trim() === "") {
          errors.push(`${at} clue-ladder requires a string answer.`);
        }
        if (!Array.isArray(puzzle.clues) || puzzle.clues.length < 2) {
          errors.push(`${at} clue-ladder requires at least two clues.`);
        }
      }

      if (puzzle.kind === "ordering") {
        if (!Array.isArray(puzzle.items) || puzzle.items.length < 2) {
          errors.push(`${at} ordering puzzle requires at least two items.`);
        }
        if (!Array.isArray(puzzle.solution)) {
          errors.push(`${at} ordering puzzle requires a solution array.`);
        } else if (Array.isArray(puzzle.items)) {
          const itemIds = puzzle.items.map(itemId);
          const solutionIds = puzzle.solution.map(itemId);
          const sameLength = itemIds.length === solutionIds.length;
          const sameSet = sameLength && itemIds.every((id) => solutionIds.includes(id));
          if (!sameSet) errors.push(`${at}.solution must be a permutation of items.`);
        }
      }

      if (puzzle.kind === "progressive-reveal") {
        if (!Array.isArray(puzzle.media) || puzzle.media.length < 2) {
          errors.push(`${at} progressive-reveal requires at least two media stages.`);
        }
      }

      if (Array.isArray(puzzle.media)) {
        puzzle.media.forEach((media, mediaIndex) => {
          if (!media?.src) errors.push(`${at}.media[${mediaIndex}].src is required.`);
          if (!media?.type) errors.push(`${at}.media[${mediaIndex}].type is required.`);
          if (typeof media?.alt !== "string") {
            errors.push(`${at}.media[${mediaIndex}].alt must be present, even when intentionally empty for decorative media.`);
          }
          if (!media?.license && !puzzle.source?.license) {
            warnings.push(`${at}.media[${mediaIndex}] has no license/provenance note.`);
          }
        });
      }
    });

    const approved = puzzles.filter((puzzle) => ["approved", "published"].includes(puzzle.status)).length;
    if (approved < 30) {
      warnings.push(`Only ${approved} approved/published puzzles found; consider a larger launch buffer.`);
    }
  }
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error));
}

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

if (errors.length > 0) {
  console.error(`\nValidation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`Validation passed with ${warnings.length} warning(s).`);
