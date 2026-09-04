# SEO, Analytics, Monetization, and Launch

Read this reference when preparing the public page, deployment, directory listing, social assets, analytics, or ads.

## Page architecture

The home route should render a meaningful HTML shell even before the game JavaScript loads:

1. unique title and concise game description;
2. playable game immediately near the top;
3. short “how to play” and rules;
4. what makes the game distinct;
5. examples that do not spoil the current answer;
6. reset cadence and timezone;
7. FAQ, archive/practice links, privacy, feedback, and related internal pages.

Do not hide all indexable content in a client-only modal. Do not bury the game under an SEO article.

Useful routes:

```text
/                 current daily game
/how-to-play      stable rules and illustrated examples
/archive          past puzzles, with spoiler-aware labels
/practice         optional non-streak mode
/stats            local stats view or account stats
/about            creator and editorial/source policy
/privacy          storage, analytics, ads, and account disclosure
```

## Metadata

Default title pattern:

```text
<Game Name> – Daily <Topic or Mechanic> Game
```

Default description pattern:

```text
Play <Game Name>, a free daily <mechanic> game. <Distinctive one-sentence loop>. A new puzzle every day; no signup required.
```

Add canonical URL, favicon/app icons, theme color, 1:1 logo, and 16:9 social image. The social image should communicate the mechanic without showing today's solution.

Use structured data conservatively. `Game` or `VideoGame` can describe a browser game; include only properties actually supported by the page, such as name, description, URL, image, genre, inLanguage, isAccessibleForFree, and operating system/platform wording. Validate the final JSON-LD and do not invent ratings.

## Daily and archive indexing

- Keep the canonical home URL stable for the current puzzle.
- Do not create indexable URLs for every transient game state, result modal, hint level, or share code.
- Archive pages may be indexable when they contain durable, non-thin content. Avoid placing the answer in titles/snippets before the user opts to reveal it.
- Add sitemap and robots rules intentionally.
- Use real links for archive/how-to/about, not click handlers only.

## Performance budget

Use these as starting targets for a compact game:

- render the static shell immediately;
- keep initial interactive JavaScript around or below 150KB compressed when practical;
- lazy-load result celebrations, archives, maps, and non-current media;
- use responsive images and explicit dimensions;
- subset or avoid custom fonts;
- avoid a large UI framework solely for dialogs and buttons;
- reserve all media and ad slots to prevent layout shifts.

Measure the real production build rather than claiming a budget from source file sizes.

## Analytics event contract

Keep events small and answer-free:

```text
game_view          game_id, puzzle_id, mode
play_start         game_id, puzzle_id, mode
attempt_submit     game_id, puzzle_id, attempt_number, valid
hint_reveal        game_id, puzzle_id, hint_index, reason
round_complete     game_id, puzzle_id, outcome, score_bucket, attempts
share_open         game_id, puzzle_id, channel
share_complete     game_id, puzzle_id, channel
archive_open       game_id
settings_change    setting, value_bucket
error              code, surface
```

Do not send raw guesses, secret answers, drawing data, exact free-text feedback, or sensitive identifiers. Define a single event module so components do not emit inconsistent names.

## Ads

- Make the first session playable without an interstitial.
- Desktop side rails are preferred for compact centered games.
- On mobile, place ads after the game or after completion.
- Do not insert ads between a clue and its input, inside a grid, above a mobile keyboard, or over a result/share action.
- Reserve slot dimensions and handle no-fill/ad blockers gracefully.
- Keep ads visually distinct from game controls.

## Cloudflare deployment

For a new static or statically generated game, prefer Cloudflare Workers Static Assets. Configure the build output directory in `wrangler.jsonc`; set the compatibility date to the current date when implementing.

Example starting point:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-dle-game",
  "compatibility_date": "YYYY-MM-DD",
  "assets": {
    "directory": "./dist/",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  }
}
```

Add a Worker script only when server behavior is necessary. Keep puzzle evaluation client-side for a casual static game; move current-puzzle delivery or leaderboard verification server-side when spoiler resistance or competitive integrity matters.

Before deploy:

- production build succeeds;
- routes and 404 work directly, not only through client navigation;
- cache headers are safe for the HTML shell and immutable hashed assets;
- source maps do not expose protected future puzzle data;
- environment variables contain no client-shipped secrets;
- embed/fullscreen policy is explicit;
- privacy page matches analytics, storage, ads, and account behavior.

## Launch pack

Create all of these:

- 1:1 logo, legible at 64px;
- 16:9 OG image with little text and no daily answer;
- clean desktop gameplay screenshot and mobile screenshot;
- 120–180 character directory summary;
- 40–70 word player-facing description;
- category, tags, language, reset cadence, price, signup requirement, and iframe policy;
- how-to-play steps;
- launch post and spoiler-safe share example;
- feedback/contact route;
- at least 30 scheduled puzzles or a validated generation/source pipeline.

Use [directory-metadata.template.json](../assets/directory-metadata.template.json) as the handoff format.
