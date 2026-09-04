import assert from "node:assert/strict";
import test from "node:test";

import { dailyKey } from "../plugins/dle-game-builder/skills/dle-game-builder/scripts/daily-key.mjs";

test("computes a UTC day key", () => {
  assert.equal(dailyKey("UTC", "2026-09-04T23:59:59Z"), "2026-09-04");
});

test("uses the configured timezone around midnight", () => {
  assert.equal(dailyKey("America/New_York", "2026-09-04T03:30:00Z"), "2026-09-03");
  assert.equal(dailyKey("America/New_York", "2026-09-04T04:30:00Z"), "2026-09-04");
});

test("rejects invalid instants and timezones", () => {
  assert.throws(() => dailyKey("UTC", "not-a-date"), /Invalid ISO instant/u);
  assert.throws(() => dailyKey("Not/A_Timezone", "2026-09-04T00:00:00Z"), RangeError);
});
