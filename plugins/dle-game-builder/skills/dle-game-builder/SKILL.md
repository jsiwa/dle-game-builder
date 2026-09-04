---
name: dle-game-builder
description: Design, build, redesign, or audit mobile-first daily browser puzzle games ("-dle" games). Use for Wordle-like guessing, clue ladders, progressive media reveals, ordering, connections, grids, maps, drawing, estimation, or higher/lower games, including daily reset, streak, archive, sharing, and puzzle-content systems. Also use for 每日小游戏、猜词游戏、排序游戏. Do not use for generic responsive UI, unrelated games, or standalone Cloudflare work.
license: MIT
metadata:
  version: "1.0.0"
  category: "browser-games"
  source-study: "dlegames.org and representative daily-game interfaces"
---

# DLE Game Builder

Build a polished daily browser game, not a generic dashboard and not a visual clone of another game. The finished product should feel immediately understandable on a phone, remain intentionally compact on desktop, restore progress reliably, and create a repeatable daily ritual.

## Respect the requested scope

- Explicit user choices about scope, framework, deployment platform, visual direction, data source, and deliverables override this skill's defaults.
- For an audit or explanation, inspect and report only. Do not edit files unless the user asks for fixes.
- For a focused change or prototype, complete and verify the requested slice without silently expanding it into a production launch.
- For a new build or substantial redesign, use the game brief as a working checklist and implement the requested experience.
- Apply the full launch checklist only when the user asks for production readiness, launch preparation, or an end-to-end release.
- Do not deploy, publish, buy assets, create external accounts, or enable analytics, ads, authentication, or paid services without explicit user authorization.

## Production daily-game defaults

For a production daily mode, use these defaults unless the user chooses otherwise:

1. Give every player the same primary puzzle for the configured game day.
2. Make the core loop understandable within 10 seconds and usually finishable in 1–5 minutes.
3. Put the playable surface before long-form content, signup prompts, or monetization.
4. Preserve progress, completion, streak, settings, and statistics across refreshes.
5. End with a satisfying, spoiler-safe result that is easy to share.
6. Use original branding, copy, puzzle data, illustrations, and interaction details. Reuse patterns, not trade dress or proprietary assets.
7. Do not require an account before the first play. Add accounts only when cross-device sync or social features justify them.

## Route the task

1. Inspect the repository, package manager, framework, routes, styling system, tests, deployment config, and existing design tokens.
2. Classify the request as an audit, focused change/prototype, new build/redesign, or production launch.
3. Identify the primary mechanic from [mechanic-archetypes.md](references/mechanic-archetypes.md). Start with one primary mechanic and at most one secondary mode.
4. For a new build or substantial redesign, use the smallest useful portion of [game-brief.template.md](assets/game-brief.template.md). Treat it as an internal checklist unless a committed brief would help the project or the user requests one. Infer sensible defaults and ask only about genuine blockers.
5. Read [interface-patterns.md](references/interface-patterns.md) before creating, changing, or auditing layout.
6. Read the other reference files only when their trigger applies:
   - Daily reset, persistence, streaks, archives, or deterministic selection: [daily-state-engine.md](references/daily-state-engine.md)
   - Puzzle authoring, normalization, aliases, difficulty, or media sourcing: [content-pipeline.md](references/content-pipeline.md)
   - Responsive, accessibility, browser, iframe, canvas, drag, or keyboard testing: [qa-accessibility.md](references/qa-accessibility.md)
   - Metadata, indexable content, analytics, ads, launch assets, or Cloudflare deployment: [seo-launch.md](references/seo-launch.md)
7. When the user asks to build or change code, implement and verify the requested scope. Do not stop after producing only a plan or mockup.

## Bundled resources and runtime

Resolve the skill directory from the loaded `SKILL.md` path before using bundled files. Do not assume the user's project root is the skill directory, and do not run a bare `node scripts/...` command from the project.

The bundled helper scripts require Node.js 18 or later and have no package dependencies. Invoke them with an absolute path to this skill directory. If Node.js is unavailable, use the repository's existing tooling or implement an equivalent check without changing the user's stack solely for this skill.

## The single-surface layout contract

Use a mobile-sized core game surface on every viewport.

- Default core shell: `max-width: 480px`; acceptable range is 420–560px depending on the mechanic.
- Set width fluidly, for example `width: min(100%, var(--game-shell-max))`; never hard-code a phone width that clips smaller devices.
- On desktop, center the same game surface. Use the extra space only for optional ad rails, help, clues, results, or decorative background.
- Do not stretch cards, inputs, boards, or line lengths merely because a monitor is wide.
- Dense grid games may add desktop companion panels, but the board remains bounded and the panels collapse below or into drawers on mobile.
- Keep essential play controls inside the core shell. Side rails must never contain the only submit, hint, pause, or settings control.
- Use `100dvh` with a safe fallback, safe-area insets, and content scrolling. Do not lock the page to a fragile fixed height.
- Keep tap targets at least 44×44 CSS pixels and text inputs at 16px or larger to avoid mobile zoom surprises.
- Never disable pinch zoom with `user-scalable=no` or `maximum-scale=1`.

Start from [dle-shell.css](assets/dle-shell.css) when the repository has no equivalent layout system.

## Required information hierarchy

The initial screen should normally follow this order:

1. Compact header: logo/name plus two to four controls such as help, stats, theme, sound, or profile.
2. Daily context: puzzle number/date, mode, or one short sentence explaining the objective.
3. Primary game surface.
4. Primary action or answer input.
5. Secondary actions such as skip, hint, undo, or reveal.
6. Progress/lives/score, only when it helps the next decision.
7. Below-game content, footer, archive, related modes, and monetization.

There should be one visually dominant action at any moment. Disable impossible actions and explain why with state, not extra paragraphs.

## Model the game before styling it

Define a small explicit state machine. The minimum shared states are:

```text
loading -> ready -> playing -> won | lost
                    |         -> error (recoverable)
                    -> paused (only if time/audio requires it)
```

Also define mechanic-specific transitions such as `guess`, `skip`, `revealHint`, `undo`, `reorder`, `submitRound`, and `finish`. Keep scoring and answer evaluation in pure functions separate from rendering.

Every state-changing action must specify:

- preconditions;
- state changes;
- score/life/attempt effects;
- feedback shown to the player;
- persistence behavior;
- analytics event when analytics is in scope, excluding the secret answer;
- keyboard and touch behavior.

Do not let UI components invent rules independently.

## Default project architecture

The user's explicit choices and the existing repository always win. For a new project with no requested stack, use these defaults unless the mechanic needs something else:

- Astro for the indexable page shell and content routes.
- React or Preact island for the interactive game.
- TypeScript with strict mode.
- Plain CSS modules, scoped styles, or the repository's existing utility system. Do not add a heavy component library for a compact game.
- Static puzzle content under `src/content/puzzles/` or `src/data/puzzles/`.
- Pure domain functions under `src/game/`.
- Versioned persistence adapters under `src/storage/`.
- Reusable game UI under `src/components/game/`.
- Cloudflare Workers Static Assets for a new Cloudflare deployment. Add a Worker API only for features such as a verified leaderboard, account sync, feedback submission, or protected current-puzzle delivery.

Suggested component boundary:

```text
GamePage
├── GameHeader
├── DailyMeta
├── GameSurface
├── PrimaryControls
├── ProgressSummary
├── HowToPlayDialog
├── StatsDialog
└── ResultDialog
```

Prefer semantic HTML and native controls. Use canvas only when the mechanic genuinely requires drawing, pixel comparison, or high-frequency rendering.

## Puzzle data contract

Use immutable `id`, `date`, and `kind` fields. Keep presentation copy separate from canonical answers. Normalize user input through one well-tested function and store accepted aliases explicitly.

Use [puzzle.schema.json](assets/puzzle.schema.json) as the baseline and run:

```bash
node "<skill-directory>/scripts/validate-puzzles.mjs" path/to/puzzles.json
```

Adapt the schema when the mechanic needs richer data, but preserve the common identity, schedule, accessibility, and source fields.

## Daily behavior

- Choose and document one reset timezone.
- Compute a named-timezone day key consistently; do not accidentally use UTC when the product promises local or Eastern reset.
- Prefer an explicit date-to-puzzle schedule. A seeded selector is acceptable only when list versioning prevents historical answers from changing after new content is added.
- Restore an in-progress puzzle exactly after reload, including revealed hints, order, drawing data, elapsed time policy, and used attempts.
- Store completion against immutable puzzle IDs and day keys.
- Calculate streaks from completed consecutive game days, not consecutive site visits.
- Show a next-puzzle countdown only after the reset contract is stable.
- Never expose tomorrow's puzzle through HTML, preload tags, public API responses, source maps, or analytics payloads unless spoilers are intentionally acceptable.

Use `node "<skill-directory>/scripts/daily-key.mjs" <IANA_TIME_ZONE> [ISO_INSTANT]` to verify edge cases.

## Completion and sharing

A completion state should provide:

- clear win/loss result;
- score, attempts, time, or accuracy relevant to the mechanic;
- today's puzzle number or date;
- streak and one useful comparison to personal history;
- spoiler-safe share text;
- copy/share fallback when the Web Share API is unavailable;
- next reset time or archive/practice action.

Use symbols plus text or position; never rely on color alone. Do not include the answer in the share text, page title, URL, or analytics event.

## Interaction rules that prevent common failures

- Pressing browser Back, Backspace outside a focused field, Escape, or mobile keyboard dismissal must never consume an attempt.
- Enter submits only when the current input is valid and focused or the interface clearly owns Enter.
- Drag-and-drop interactions must also provide keyboard-accessible move controls or selection-then-place behavior.
- Keep focused inputs visible above the mobile keyboard. Do not submit on blur.
- Prevent duplicate submissions with an action lock, not a long arbitrary timeout.
- Make async failures retryable without losing game state.
- Pause or stop audio when hidden, but do not silently mark a skip.
- Scale canvas backing resolution by `devicePixelRatio` while keeping CSS size stable.
- Reserve media and ad dimensions to avoid layout shifts.
- A player must be able to close every nonessential modal and continue.

## Verification workflow

Choose checks in proportion to the requested scope. Before declaring an implementation complete, run every relevant available check below and report checks that could not be run:

1. Run typecheck, lint, unit tests, and production build using repository commands.
2. Test the core pure functions, especially normalization, evaluation, scoring, date keys, streaks, and puzzle selection.
3. Test fresh, mid-game restored, won, lost, malformed-data, offline/media-failure, and next-day states.
4. Test widths 320, 360, 390, 430, 768, 1024, and 1440; include short mobile heights.
5. Confirm no horizontal scroll, clipped controls, inaccessible overlays, or desktop stretching.
6. Verify keyboard-only play and screen-reader labels for the primary loop.
7. Confirm color contrast, reduced-motion behavior, and non-color feedback.
8. Confirm share output contains no answer and works without native sharing.
9. Confirm the first puzzle can be played without signup, cookie wall, or ad obstruction.
10. Confirm there are no console errors, failed network requests caused by the implementation, or secret-answer logs.

Adapt [responsive.spec.ts](assets/responsive.spec.ts) when Playwright is available.

## Production launch definition of done

For an explicit production launch or launch-readiness request, the game is ready only when it includes:

- a complete playable loop with win and loss states;
- mobile-first single-surface layout and intentional desktop behavior;
- deterministic daily puzzle selection and documented reset timezone;
- refresh-safe persistence and correct streak behavior;
- help/rules that fit in a short modal or drawer;
- result, stats, and spoiler-safe sharing;
- accessible keyboard/touch interaction;
- production build and meaningful automated tests;
- indexable title, description, canonical URL, social image, icon, and below-game explanatory content;
- a content pipeline with enough validated puzzles for launch;
- a launch pack: 1:1 logo, 16:9 OG image, gameplay screenshot, directory metadata, and concise game description.

Report the implemented files, tests run, reset timezone when relevant, content coverage when relevant, and any genuine remaining blocker. Do not claim verification that was not performed.
