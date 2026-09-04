#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const STATUSES = new Set(["draft", "review", "approved", "published", "retired"]);
const MEDIA_TYPES = new Set(["image", "audio", "video"]);
const TOP_LEVEL_KEYS = new Set(["gameId", "resetTimeZone", "schemaVersion", "puzzles"]);

function normalize(value) {
  return String(value)
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isTimeZone(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function itemId(item) {
  if (isNonEmptyString(item)) return item.trim();
  if (isPlainObject(item) && isNonEmptyString(item.id)) return item.id.trim();
  return undefined;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function validatePuzzleCollection(parsed, { checkLaunchBacklog = false } = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(parsed)) {
    errors.push("Expected a puzzle collection object.");
    return { errors, warnings };
  }

  for (const key of Object.keys(parsed)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`Unknown top-level property "${key}".`);
  }

  if (!isNonEmptyString(parsed.gameId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed.gameId)) {
    errors.push("gameId must be a lowercase kebab-case string.");
  }

  if (!isTimeZone(parsed.resetTimeZone)) {
    errors.push("resetTimeZone must be a valid IANA time zone.");
  }

  if (parsed.schemaVersion !== undefined && (!Number.isInteger(parsed.schemaVersion) || parsed.schemaVersion < 1)) {
    errors.push("schemaVersion must be an integer greater than or equal to 1.");
  }

  if (!Array.isArray(parsed.puzzles) || parsed.puzzles.length === 0) {
    errors.push("puzzles must be a non-empty array.");
    return { errors, warnings };
  }

  const ids = new Set();
  const dates = new Set();
  let previousDate = "";

  parsed.puzzles.forEach((puzzle, index) => {
    const at = `puzzles[${index}]`;

    if (!isPlainObject(puzzle)) {
      errors.push(`${at} must be an object.`);
      return;
    }

    if (!isNonEmptyString(puzzle.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(puzzle.id)) {
      errors.push(`${at}.id must be a lowercase kebab-case string.`);
    } else if (ids.has(puzzle.id)) {
      errors.push(`${at}.id duplicates "${puzzle.id}".`);
    } else {
      ids.add(puzzle.id);
    }

    if (!isNonEmptyString(puzzle.date) || !isDateKey(puzzle.date)) {
      errors.push(`${at}.date must be a valid YYYY-MM-DD date.`);
    } else {
      if (dates.has(puzzle.date)) errors.push(`${at}.date duplicates "${puzzle.date}".`);
      dates.add(puzzle.date);
      if (previousDate && puzzle.date < previousDate) {
        warnings.push(`${at}.date is earlier than the preceding puzzle; sort the schedule before launch.`);
      }
      previousDate = puzzle.date;
    }

    if (!KNOWN_KINDS.has(puzzle.kind)) errors.push(`${at}.kind is missing or unknown.`);
    if (!isNonEmptyString(puzzle.title)) errors.push(`${at}.title is required.`);
    if (!isNonEmptyString(puzzle.prompt)) errors.push(`${at}.prompt is required.`);
    if (!STATUSES.has(puzzle.status)) errors.push(`${at}.status is missing or invalid.`);

    if (!Number.isInteger(puzzle.difficulty) || puzzle.difficulty < 1 || puzzle.difficulty > 5) {
      errors.push(`${at}.difficulty must be an integer from 1 to 5.`);
    }

    if (!isNonEmptyString(puzzle.reviewer)) errors.push(`${at}.reviewer is required.`);

    if (
      puzzle.answer !== undefined &&
      !isNonEmptyString(puzzle.answer) &&
      !(typeof puzzle.answer === "number" && Number.isFinite(puzzle.answer)) &&
      !isPlainObject(puzzle.answer) &&
      !Array.isArray(puzzle.answer)
    ) {
      errors.push(`${at}.answer must be a non-empty string, finite number, object, or array.`);
    }

    if (!isPlainObject(puzzle.source)) {
      errors.push(`${at}.source must be an object.`);
    } else {
      const hasProvenance = ["url", "license", "notes"].some((key) => isNonEmptyString(puzzle.source[key]));
      if (!hasProvenance) errors.push(`${at}.source must include a URL, license, or provenance note.`);
      if (puzzle.source.url !== undefined) {
        try {
          new URL(puzzle.source.url);
        } catch {
          errors.push(`${at}.source.url must be an absolute URL.`);
        }
      }
    }

    if (puzzle.allowAnswerInPrompt !== undefined && typeof puzzle.allowAnswerInPrompt !== "boolean") {
      errors.push(`${at}.allowAnswerInPrompt must be a boolean.`);
    }

    let aliases = [];
    if (puzzle.aliases !== undefined) {
      if (!Array.isArray(puzzle.aliases) || puzzle.aliases.some((alias) => !isNonEmptyString(alias))) {
        errors.push(`${at}.aliases must be an array of non-empty strings.`);
      } else {
        aliases = puzzle.aliases;
        const normalizedAliases = aliases.map(normalize);
        if (new Set(normalizedAliases).size !== normalizedAliases.length) {
          warnings.push(`${at}.aliases contains duplicates after normalization.`);
        }
        if (typeof puzzle.answer === "string" && normalizedAliases.includes(normalize(puzzle.answer))) {
          warnings.push(`${at}.aliases repeats the canonical answer after normalization.`);
        }
      }
    }

    const answerTerms = [typeof puzzle.answer === "string" ? puzzle.answer : "", ...aliases]
      .map(normalize)
      .filter((value) => value.length >= 3);
    if (!puzzle.allowAnswerInPrompt && isNonEmptyString(puzzle.prompt)) {
      const normalizedPrompt = normalize(puzzle.prompt);
      for (const term of answerTerms) {
        if (normalizedPrompt.includes(term)) {
          warnings.push(`${at}.prompt appears to contain an answer or alias.`);
          break;
        }
      }
    }

    if (puzzle.kind === "clue-ladder") {
      if (!isNonEmptyString(puzzle.answer)) errors.push(`${at} clue-ladder requires a string answer.`);
      if (!Array.isArray(puzzle.clues) || puzzle.clues.length < 2) {
        errors.push(`${at} clue-ladder requires at least two clues.`);
      } else {
        puzzle.clues.forEach((clue, clueIndex) => {
          if (!isNonEmptyString(clue)) errors.push(`${at}.clues[${clueIndex}] must be a non-empty string.`);
          if (!puzzle.allowAnswerInPrompt && isNonEmptyString(clue)) {
            const normalizedClue = normalize(clue);
            if (answerTerms.some((term) => normalizedClue.includes(term))) {
              warnings.push(`${at}.clues[${clueIndex}] appears to contain an answer or alias.`);
            }
          }
        });
      }
    }

    if (puzzle.kind === "ordering") {
      if (!Array.isArray(puzzle.items) || puzzle.items.length < 2) {
        errors.push(`${at} ordering puzzle requires at least two items.`);
      }
      if (!Array.isArray(puzzle.solution)) {
        errors.push(`${at} ordering puzzle requires a solution array.`);
      }

      if (Array.isArray(puzzle.items) && Array.isArray(puzzle.solution)) {
        const itemIds = puzzle.items.map(itemId);
        const solutionIds = puzzle.solution.map(itemId);

        puzzle.items.forEach((item, itemIndex) => {
          if (!itemIds[itemIndex]) errors.push(`${at}.items[${itemIndex}] needs a non-empty string or id.`);
          if (isPlainObject(item) && !isNonEmptyString(item.label)) {
            errors.push(`${at}.items[${itemIndex}].label is required for object items.`);
          }
        });
        solutionIds.forEach((id, solutionIndex) => {
          if (!id) errors.push(`${at}.solution[${solutionIndex}] needs a non-empty string or id.`);
        });

        if (new Set(itemIds).size !== itemIds.length) errors.push(`${at}.items contains duplicate IDs.`);
        if (new Set(solutionIds).size !== solutionIds.length) errors.push(`${at}.solution contains duplicate IDs.`);

        const itemCounts = new Map();
        const solutionCounts = new Map();
        for (const id of itemIds) itemCounts.set(id, (itemCounts.get(id) ?? 0) + 1);
        for (const id of solutionIds) solutionCounts.set(id, (solutionCounts.get(id) ?? 0) + 1);
        const isPermutation =
          itemIds.length === solutionIds.length &&
          [...itemCounts].every(([id, count]) => id && solutionCounts.get(id) === count);
        if (!isPermutation) errors.push(`${at}.solution must be a permutation of items.`);
      }
    }

    if (puzzle.kind === "progressive-reveal") {
      if (!hasOwn(puzzle, "answer") || puzzle.answer === null) {
        errors.push(`${at} progressive-reveal requires an answer.`);
      }
      if (!Array.isArray(puzzle.media) || puzzle.media.length < 2) {
        errors.push(`${at} progressive-reveal requires at least two media stages.`);
      }
    }

    if (puzzle.media !== undefined && !Array.isArray(puzzle.media)) {
      errors.push(`${at}.media must be an array.`);
    } else if (Array.isArray(puzzle.media)) {
      puzzle.media.forEach((media, mediaIndex) => {
        const mediaAt = `${at}.media[${mediaIndex}]`;
        if (!isPlainObject(media)) {
          errors.push(`${mediaAt} must be an object.`);
          return;
        }
        if (!isNonEmptyString(media.src)) errors.push(`${mediaAt}.src is required.`);
        if (!MEDIA_TYPES.has(media.type)) errors.push(`${mediaAt}.type must be image, audio, or video.`);
        if (typeof media.alt !== "string") {
          errors.push(`${mediaAt}.alt must be present, even when intentionally empty for decorative media.`);
        }
        if (!isNonEmptyString(media.license) && !isNonEmptyString(puzzle.source?.license)) {
          warnings.push(`${mediaAt} has no license note.`);
        }
      });
    }
  });

  if (checkLaunchBacklog) {
    const approved = parsed.puzzles.filter((puzzle) =>
      isPlainObject(puzzle) && ["approved", "published"].includes(puzzle.status),
    ).length;
    if (approved < 30) {
      warnings.push(`Only ${approved} approved/published puzzles found; add a larger launch buffer.`);
    }
  }

  return { errors, warnings };
}

async function runCli() {
  const args = process.argv.slice(2);
  const checkLaunchBacklog = args.includes("--launch");
  const strict = args.includes("--strict");
  const unknownOptions = args.filter((arg) => arg.startsWith("-") && !["--launch", "--strict"].includes(arg));
  const fileArgs = args.filter((arg) => !arg.startsWith("-"));

  if (unknownOptions.length > 0 || fileArgs.length !== 1) {
    console.error("Usage: node validate-puzzles.mjs [--launch] [--strict] <puzzles.json>");
    if (unknownOptions.length > 0) console.error(`Unknown option: ${unknownOptions[0]}`);
    process.exitCode = 1;
    return;
  }

  let result;
  try {
    const path = resolve(fileArgs[0]);
    const parsed = JSON.parse(await readFile(path, "utf8"));
    result = validatePuzzleCollection(parsed, { checkLaunchBacklog });
  } catch (error) {
    result = { errors: [error instanceof Error ? error.message : String(error)], warnings: [] };
  }

  for (const warning of result.warnings) console.warn(`WARN  ${warning}`);
  for (const error of result.errors) console.error(`ERROR ${error}`);

  const failed = result.errors.length > 0 || (strict && result.warnings.length > 0);
  if (failed) {
    console.error(
      `\nValidation failed with ${result.errors.length} error(s) and ${result.warnings.length} warning(s).`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Validation passed with ${result.warnings.length} warning(s).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await runCli();
}
