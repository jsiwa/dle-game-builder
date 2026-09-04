# DLE Mechanic Archetypes

Choose one primary archetype before implementation. Combining multiple archetypes is useful only when the secondary mode reinforces the same knowledge domain.

## 1. Letter or token feedback

Examples of the pattern include Wordle-like word, number, equation, symbol, or sequence guessing.

**Loop:** enter a fixed-length guess → validate → score each token → update board/keyboard → repeat.

**Required model:** answer tokens, accepted guess universe, duplicate-token scoring, attempt limit, normalization, win condition.

**UI:** bounded tile grid, input or on-screen keyboard, status line, attempt history.

**Gotcha:** duplicate letters/tokens require a two-pass scoring algorithm: mark exact matches first, then consume remaining answer counts for present-but-misplaced feedback.

## 2. Attribute deduction

The player guesses an entity and receives feedback across attributes such as year, region, category, rarity, team, or numeric direction.

**Loop:** search/select entity → compare attributes → render row → narrow candidates.

**Required model:** canonical entity IDs, searchable aliases, typed attribute comparators, display formatters, direction rules, attempt limit.

**UI:** autocomplete input plus a scroll-safe feedback table. On narrow screens, use compact cells, abbreviated headings with accessible labels, or a controlled horizontal scroller.

**Gotcha:** comparators must be explicit per field. Equality, overlap, ordered higher/lower, set inclusion, and partial match are different rules.

## 3. Clue ladder

The answer sits behind clues ordered from cryptic to obvious. Early guesses score more; skips or misses reveal later clues.

**Loop:** read current clue → guess or skip → adjust score/rung → reveal next clue → finish.

**Required model:** answer and aliases, ordered clues, score per clue, miss penalty, skip rule, terminal state.

**UI:** one active clue card, visible locked/revealed ladder, input, primary guess button, secondary skip button.

**Gotcha:** keyboard dismissal, Backspace, or browser Back must never count as a guess. Wrong guesses and skips must have visibly different feedback.

## 4. Progressive media reveal

The player identifies an image, screenshot, audio clip, video, silhouette, blur, crop, or layered clue that becomes more informative after each miss/skip.

**Loop:** play/view limited media → guess or skip → reveal longer/clearer/larger media → repeat.

**Required model:** progressive stages, media preload policy, answer aliases, skip and miss effects, fallback media, licensing/source metadata.

**UI:** stable aspect-ratio media frame, explicit play/pause, stage timeline, answer input, skip.

**Gotcha:** do not download every future stage up front when that leaks the answer or wastes bandwidth. Preserve the exact reveal stage after refresh.

## 5. Connections or grouping

The player groups a board of items into hidden categories.

**Loop:** select N items → submit group → accept/reject → lock solved group → continue.

**Required model:** items, group IDs, group labels, difficulty order, allowed mistakes, shuffle seed.

**UI:** responsive grid, selected state, mistakes remaining, submit/deselect controls, solved group banners.

**Gotcha:** overlapping plausible categories need editorial QA. Selection must not depend only on color, and keyboard selection order must be predictable.

## 6. Ordering or timeline

The player arranges items by date, magnitude, rank, geography, process, or another ordered property.

**Loop:** reorder cards → check or place one item → show correctness → finish.

**Required model:** item IDs, canonical order, tie policy, partial-credit policy, move count or attempt rule.

**UI:** large card rows, drag handles, numbered positions, full-width check button, keyboard move-up/down alternatives.

**Gotcha:** decide whether the entire order is submitted at once or items lock incrementally. Avoid ambiguous ties unless the rule explicitly accepts them.

## 7. Grid, crossword, or path logic

The player fills cells, places pieces, draws a route, or satisfies row/column/region rules.

**Loop:** select cell/tool → mutate board → validate locally → check completion.

**Required model:** board dimensions, cell constraints, clue mapping, legal move function, undo history, completion validator.

**UI:** fixed logical board, clear focus cursor, clue panel or contextual clue, undo/reset/check, zoom only when genuinely needed.

**Gotcha:** never scale cells so small that labels or targets become unusable. On desktop add companion panels; on mobile keep the board primary and move companions into tabs/drawers.

## 8. Drawing or construction

The player draws, paints, places shapes, or reconstructs a target from memory.

**Loop:** edit canvas → undo/redo → submit/reveal → compare → score.

**Required model:** tool state, vector or raster operation history, target representation, similarity/scoring policy, export/persistence format.

**UI:** stable canvas, compact color/tool rows, selected-tool indication, undo/redo, reveal/submit separated from destructive clear.

**Gotcha:** scale the canvas backing store for `devicePixelRatio`; transform pointer coordinates; persist operations rather than giant raw bitmaps when practical; make scoring expectations understandable.

## 9. Estimation

The player estimates a number, angle, distance, count, duration, price, size, or center.

**Loop:** inspect prompt → enter/place estimate → receive directional or distance feedback → repeat or score.

**Required model:** answer value/unit, allowed range, precision, scoring curve, attempts, accepted formats.

**UI:** numeric input, slider, dial, or click target depending on the cognitive task; always show units and valid range.

**Gotcha:** use a scoring curve that remains meaningful across scales. Consider logarithmic error for magnitude games rather than raw absolute error.

## 10. Map or location pin

The player identifies or places a location on a map/globe/image.

**Loop:** inspect clue → search or pin → calculate distance/direction → repeat.

**Required model:** coordinates, accepted region geometry if needed, distance formula, projection behavior, attempt rules.

**UI:** bounded map, explicit confirm step, recenter/zoom, textual distance and direction feedback.

**Gotcha:** selecting a pin and submitting must be separate actions. Provide a non-map textual fallback when accessibility requirements demand it.

## 11. Higher or lower / binary choice

The player chooses which item has the greater value or whether the next value is higher/lower.

**Loop:** compare → choose → reveal values → continue streak.

**Required model:** item/value pairs, tie policy, repeat prevention, sequence generation, streak scoring.

**UI:** two large comparable cards or one current/next pair, unambiguous buttons, fast feedback.

**Gotcha:** the source and freshness of numeric values must be documented. Cache values so today's puzzle does not change mid-day.

## Combining archetypes

Good combinations:

- progressive media reveal + attribute deduction;
- clue ladder + final ordering;
- drawing + similarity estimation;
- map pin + year estimation;
- connections + themed trivia explanation.

Avoid launching with many unrelated modes. A compact, excellent daily loop is more valuable than a menu of unfinished games.
