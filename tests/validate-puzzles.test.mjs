import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validatePuzzleCollection } from "../plugins/dle-game-builder/skills/dle-game-builder/scripts/validate-puzzles.mjs";

const examplePath = new URL(
  "../plugins/dle-game-builder/skills/dle-game-builder/assets/example-puzzles.json",
  import.meta.url,
);

const validOrderingPuzzle = {
  id: "ordering-001",
  date: "2026-09-07",
  kind: "ordering",
  title: "Order the route",
  prompt: "Sort the stops from first to last.",
  items: ["a", "b", "c"],
  solution: ["b", "a", "c"],
  difficulty: 2,
  status: "approved",
  reviewer: "Test reviewer",
  source: { license: "Original" },
};

function collection(puzzle = validOrderingPuzzle) {
  return {
    gameId: "test-game",
    resetTimeZone: "UTC",
    schemaVersion: 1,
    puzzles: [puzzle],
  };
}

test("accepts the bundled example collection", async () => {
  const parsed = JSON.parse(await readFile(examplePath, "utf8"));
  assert.deepEqual(validatePuzzleCollection(parsed), { errors: [], warnings: [] });
});

test("rejects missing collection metadata and top-level arrays", () => {
  assert.match(validatePuzzleCollection({ puzzles: [validOrderingPuzzle] }).errors.join("\n"), /gameId/u);
  assert.match(validatePuzzleCollection([validOrderingPuzzle]).errors.join("\n"), /collection object/u);
});

test("rejects invalid timezones and difficulty types", () => {
  const parsed = collection({ ...validOrderingPuzzle, difficulty: "hard" });
  parsed.resetTimeZone = "Not/A_Timezone";
  const errors = validatePuzzleCollection(parsed).errors.join("\n");
  assert.match(errors, /valid IANA time zone/u);
  assert.match(errors, /difficulty must be an integer/u);
});

test("rejects duplicate item IDs and a non-permutation solution", () => {
  const parsed = collection({
    ...validOrderingPuzzle,
    items: ["a", "a"],
    solution: ["a", "b"],
  });
  const errors = validatePuzzleCollection(parsed).errors.join("\n");
  assert.match(errors, /items contains duplicate IDs/u);
  assert.match(errors, /solution must be a permutation/u);
});

test("checks the launch backlog only when requested", () => {
  assert.equal(validatePuzzleCollection(collection()).warnings.length, 0);
  assert.match(
    validatePuzzleCollection(collection(), { checkLaunchBacklog: true }).warnings.join("\n"),
    /launch buffer/u,
  );
});

test("rejects a progressive reveal without a usable answer", () => {
  const parsed = collection({
    ...validOrderingPuzzle,
    id: "reveal-001",
    kind: "progressive-reveal",
    answer: null,
    media: [
      { src: "stage-1.jpg", type: "image", alt: "Obscured subject" },
      { src: "stage-2.jpg", type: "image", alt: "Less obscured subject" },
    ],
  });
  const errors = validatePuzzleCollection(parsed).errors.join("\n");
  assert.match(errors, /answer must be/u);
  assert.match(errors, /requires an answer/u);
});
