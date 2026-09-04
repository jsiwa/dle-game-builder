#!/usr/bin/env node

import { fileURLToPath } from "node:url";

export function dailyKey(timeZone = "UTC", instantInput = new Date()) {
  const instant = instantInput instanceof Date ? instantInput : new Date(instantInput);

  if (Number.isNaN(instant.getTime())) {
    throw new TypeError(`Invalid ISO instant: ${instantInput}`);
  }

  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${map.year}-${map.month}-${map.day}`;
}

function runCli() {
  const [timeZone = "UTC", instantArg] = process.argv.slice(2);

  try {
    console.log(dailyKey(timeZone, instantArg ?? new Date()));
  } catch (error) {
    if (error instanceof RangeError) {
      console.error(`Unable to compute a day key for timezone "${timeZone}".`);
    }
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli();
}
