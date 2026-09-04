# Daily State Engine

Read this reference when implementing reset timing, puzzle selection, persistence, streaks, archives, or share IDs.

## Day key

Choose an IANA timezone such as `UTC`, `America/New_York`, or `Asia/Taipei` and document it in the UI/help. Compute the calendar date in that timezone, not by slicing `toISOString()` unless the promised reset is UTC.

```ts
export function dayKey(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const map = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return `${map.year}-${map.month}-${map.day}`;
}
```

Test dates around midnight, daylight-saving transitions, leap days, month/year boundaries, and a client whose local timezone differs from the game timezone.

## Puzzle selection

### Preferred: explicit schedule

```json
{
  "2026-09-04": "puzzle-0083",
  "2026-09-05": "puzzle-0084"
}
```

This keeps historical puzzles stable when content is added or reordered.

### Seeded selection

Use only when the content pool is versioned and the mapping is persisted. Adding one item to an unversioned array can otherwise change every future and historical selection.

### Server-selected current puzzle

Use when future answers must not ship to clients, media URLs are protected, or a verified leaderboard needs a server timestamp. Return only the current puzzle and public archive entries. Cache by day key.

## State shape

Keep game rules in a mechanic-specific payload but use a shared envelope:

```ts
interface StoredGameState<T> {
  schemaVersion: number;
  gameId: string;
  puzzleId: string;
  dayKey: string;
  status: "ready" | "playing" | "won" | "lost";
  startedAt?: string;
  completedAt?: string;
  payload: T;
}
```

Use a key such as:

```text
dle:<game-id>:v<schema-version>:puzzle:<puzzle-id>
```

Store settings and aggregate stats separately so a corrupted puzzle state does not erase the player's preferences.

## Migrations and recovery

- Parse storage inside `try/catch`.
- Validate puzzle ID, day key, and schema version before restore.
- Write small explicit migrations for compatible versions.
- If recovery fails, preserve aggregate stats and reset only the malformed current puzzle state.
- Never merge yesterday's in-progress payload into today's puzzle.

## Attempts and timing

- Persist immediately after every meaningful state transition.
- Disable duplicate submission while evaluation is running.
- For timed games, decide whether background time counts. Use timestamps rather than relying only on an interval counter.
- For audio/video, persist reveal stage and playback entitlement, not current playback position unless the rules require it.
- For canvas games, persist operation history or compressed vectors after each stroke batch and on `visibilitychange`.

## Streaks

Track a set or ordered list of completed day keys. A current streak is the number of consecutive game days ending today or yesterday, depending on whether today's puzzle is unfinished. Avoid incrementing a streak twice when a player reopens a completed puzzle.

Decide and document:

- whether only wins count or any completion counts;
- whether archive plays affect streaks (normally no);
- whether a grace/freeze mechanic exists;
- which timezone defines consecutive days.

## Statistics

Mechanic-appropriate stats are better than a generic dashboard. Examples:

- guess distribution for fixed-attempt games;
- average clue/rung solved;
- median completion time;
- average estimation error;
- perfect-order rate;
- drawing accuracy average;
- current and max streak.

Keep personal stats local by default. Do not send answers, raw guesses, drawing contents, or precise personal identifiers to analytics.

## Countdown

Calculate the next timezone midnight on the server or with a timezone-aware algorithm. Recalculate on visibility change and at least once per minute after completion. When the countdown reaches zero, offer a deliberate reload/new-puzzle transition rather than silently replacing an open result.

## Share identity

Give each puzzle a stable public number or date. Share text should include game name, puzzle number, result, compact progress symbols, and canonical URL. It must not include the answer or a query parameter that reveals it.
