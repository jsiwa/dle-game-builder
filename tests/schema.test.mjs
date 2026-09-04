import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const assetRoot = new URL("../plugins/dle-game-builder/skills/dle-game-builder/assets/", import.meta.url);
const schema = JSON.parse(await readFile(new URL("puzzle.schema.json", assetRoot), "utf8"));
const examples = JSON.parse(await readFile(new URL("example-puzzles.json", assetRoot), "utf8"));
const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

test("the bundled examples satisfy the published JSON Schema", () => {
  assert.equal(validate(examples), true, ajv.errorsText(validate.errors));
});

test("the schema rejects the validator regression fixture", () => {
  const invalid = {
    puzzles: [
      {
        id: "bad-but-accepted",
        date: "2026-09-07",
        kind: "ordering",
        title: "Bad fixture",
        status: "approved",
        difficulty: "hard",
        aliases: "not-an-array",
        items: ["a", "a"],
        solution: ["a", "b"],
      },
    ],
  };
  assert.equal(validate(invalid), false);
});

test("the schema rejects an explicitly empty answer", () => {
  const invalid = structuredClone(examples);
  invalid.puzzles[0].answer = "";
  assert.equal(validate(invalid), false);
});
