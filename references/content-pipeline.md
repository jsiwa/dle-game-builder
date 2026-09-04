# Puzzle Content Pipeline

Read this reference when sourcing answers, authoring hints, generating daily schedules, accepting aliases, or launching with a content backlog.

## Source of truth

Each puzzle must have:

- immutable ID;
- scheduled date or published order;
- mechanic kind;
- canonical answer or solution;
- accepted aliases and normalization notes;
- prompt/clues/media;
- difficulty and editorial notes;
- source/license/provenance for factual or media-based content;
- accessibility text for every nondecorative image, audio clue, and canvas target;
- review status and reviewer.

Do not make the frontend component the only place where puzzle rules or answers exist.

## Normalization

Define normalization once per answer domain. Typical steps are:

1. Unicode normalization (`NFKC` or a documented alternative).
2. Trim and collapse whitespace.
3. Case folding.
4. Normalize punctuation, apostrophes, dashes, and diacritics only when appropriate.
5. Resolve explicit aliases to the canonical ID.

Do not remove meaningful symbols from equations, chemical names, titles, model numbers, or non-Latin languages. Store aliases deliberately rather than making fuzzy matching so broad that wrong answers pass.

## Search and autocomplete

- Search against normalized names and aliases.
- Return canonical entity IDs, not display strings.
- Rank exact prefix, word prefix, then fuzzy matches.
- Keep the list keyboard navigable and announce result count.
- Do not show the secret answer as a default or recent suggestion.
- For large datasets, index once and keep filtering under one animation frame on common phones.

## Difficulty curve

A good daily game mixes success and tension. Label content internally using a small rubric such as:

- `1`: broadly recognizable / obvious clue path;
- `2`: familiar but requires one deduction;
- `3`: standard target difficulty;
- `4`: specialist knowledge or misleading alternatives;
- `5`: expert-only, best used sparingly or with strong late hints.

Schedule clusters intentionally rather than publishing several expert puzzles in a row. Validate that later clues or reveal stages materially improve solve probability.

## Editorial QA by mechanic

### Guessing and aliases

- Canonical answer exists in the selectable universe.
- Common spelling, punctuation, translated title, abbreviation, and former-name variants are considered.
- No unrelated answer is accepted by overbroad normalization.

### Clue ladder

- Clues become progressively more useful.
- No clue accidentally contains the answer or a trivial morphological form.
- The first clue is hard but fair; the last is sufficient for the intended audience.

### Connections

- Every item belongs to exactly one intended group after all groups are considered.
- Plausible red herrings are intentional, not accidental ambiguity.
- Group labels are explanatory and satisfying after reveal.

### Ordering

- The ordering property and direction are explicit.
- Ties are absent, accepted, or resolved by a documented secondary key.
- Names remain readable when reordered on a 320px viewport.

### Media reveal

- Every stage loads and has a fallback.
- Later stages are genuinely more revealing.
- Rights and attribution requirements are satisfied.
- File names, metadata, captions, and URLs do not leak the answer.

### Estimation

- Unit, scale, valid range, and rounding are unambiguous.
- The scoring curve is tested on plausible guesses and extreme outliers.
- Explanatory source text is ready for the result state.

## Content backlog

Before public launch, aim for:

- at least 30 validated daily puzzles for a manual/editorial game;
- preferably 60–90 days when media or specialist review is slow;
- at least 10 practice/archive examples for testing the full difficulty range;
- a documented publishing process and emergency replacement procedure.

These are operating defaults, not rigid requirements. A generated or database-backed game still needs enough QA samples to prove selection and difficulty are stable.

## Generation with AI

AI may draft clues, distractors, explanations, or tags, but do not publish factual or puzzle content without deterministic validation and human/editorial review. Check for duplicate answers, leaked answers, ambiguous groups, false claims, cultural bias, and unsupported media rights.

## Validation

Use the bundled baseline validator:

```bash
node scripts/validate-puzzles.mjs assets/example-puzzles.json
```

Extend it with mechanic-specific checks and run it in CI. Treat warnings about duplicate dates, invalid solutions, missing alt text, or answer leakage as release blockers when relevant.
