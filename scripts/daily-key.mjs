#!/usr/bin/env node

const [timeZone = "UTC", instantArg] = process.argv.slice(2);
const instant = instantArg ? new Date(instantArg) : new Date();

if (Number.isNaN(instant.getTime())) {
  console.error(`Invalid ISO instant: ${instantArg}`);
  process.exit(1);
}

try {
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

  console.log(`${map.year}-${map.month}-${map.day}`);
} catch (error) {
  console.error(`Unable to compute a day key for timezone "${timeZone}".`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
