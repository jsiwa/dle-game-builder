# Interface Patterns for Daily DLE Games

Use this reference whenever creating or auditing the game shell, layout, control hierarchy, or responsive behavior.

## Core observation: one interactive surface

Most compact daily games do not become a desktop application at wide breakpoints. Their interactive surface stays close to phone width and is centered in a full-page background. Desktop adds negative space, optional side rails, or supplementary panels without stretching the core task.

Representative patterns visible across daily games:

- A centered clue-and-input column with large empty desktop margins.
- A centered drawing or media surface, with desktop ad/help rails outside it.
- A fixed-width stack of draggable cards with one full-width confirmation button.
- A bounded board plus clue/help panels on desktop; the board remains the same logical size while panels move below or into drawers on mobile.

Treat the mobile layout as the canonical game, not as a reduced desktop layout.

## Choose a shell width intentionally

| Mechanic | Starting max width | Notes |
|---|---:|---|
| Clue ladder, single input, higher/lower | 440–480px | Keeps reading and decision distance tight |
| Word feedback or attribute rows | 480–520px | May need horizontal attribute scrolling on very small screens |
| Ordering cards and connections | 460–520px | Cards should remain large enough to tap or drag |
| Drawing, image reveal, map | 500–640px | Preserve aspect ratio; controls can wrap below |
| Crossword or logic board | 420–560px board | Add optional desktop clue panel rather than enlarging cells indefinitely |

These are defaults, not exact targets. Measure the content and choose the smallest width that avoids cramped primary interaction.

## Desktop shell patterns

### Pattern A: centered column

Use for clue ladders, guessing, estimation, higher/lower, and simple ordering.

```text
[ flexible margin ] [ 440–500px game ] [ flexible margin ]
```

### Pattern B: centered game with side rails

Use when ads, help, related modes, or nonessential progress need desktop space.

```text
[ left rail ] [ 460–560px game ] [ right rail ]
```

Rails appear only when there is enough room. Hide or move them below the game before they squeeze the core surface.

### Pattern C: bounded board plus companions

Use for crossword, sudoku, chess, or a complex grid.

```text
[ clue list ] [ fixed board ] [ help/settings ]
```

On mobile, show the board first and place clues in tabs, a sheet, or below the board. Keep the currently relevant clue visible near the board.

## Header

- Aim for a 52–64px visual height.
- Use a wordmark or short title, not a marketing hero.
- Limit visible controls to the two to four used during play.
- Give icon-only buttons accessible names and tooltips.
- Use a divider or spacing change to separate global controls from the puzzle.
- Avoid a permanent hamburger menu when all essential options fit in small dialogs.

## Vertical rhythm

A reliable compact sequence is:

```text
Header
Daily label / mode
Task title
One-sentence instruction
Game surface
Input or primary action
Secondary controls
Progress / feedback
```

Use 8–12px gaps inside a functional group and 20–32px between major groups. Excessive top whitespace makes the game feel unfinished on mobile; insufficient whitespace makes state changes hard to parse.

## Cards and inputs

- Primary card row height: typically 56–72px.
- Input and main button height: typically 46–54px.
- Border radius: keep one compact family, commonly 10–16px.
- Use border, fill, icon, and text together for locked/current/correct/incorrect states.
- Keep submit adjacent to the input on larger phone widths; stack it below when the input would become too narrow.
- A full-width final CTA works well for ordering, grid verification, and round completion.

## Game state presentation

### Ready

Show the objective and playable surface. Do not front-load stats, sign-in, archive, or a long tutorial.

### Playing

Keep the current decision visually dominant. Collapse old feedback when it becomes repetitive, but preserve enough history for deduction.

### Feedback

Use a short animation only when it explains a state change. Update an `aria-live` region with the same meaning.

### Complete

Move focus to a result heading. Show result, score, streak, share, and next action in that order. Do not cover the result with an ad or immediate signup wall.

## Mobile viewport and keyboard

- Use normal document flow and scrolling rather than vertically centering a tall game in a fixed viewport.
- Apply `scroll-margin-bottom` to inputs and call `scrollIntoView({ block: "center" })` only when needed.
- Use `inputmode`, `autocomplete`, and `enterkeyhint` that match the answer type.
- Keep input font size at least 16px.
- Handle `visualViewport` changes only as an enhancement; the layout must remain usable without JavaScript viewport hacks.
- Never submit on blur, keyboard close, or browser navigation.

## Ads and monetization

- Prefer desktop side rails because they preserve the game flow.
- On mobile, place an ad after the playable surface or below a completed result, not between prompt and answer controls.
- Reserve the slot dimensions to prevent cumulative layout shift.
- Never let a sticky ad cover the keyboard, bottom controls, share button, or result.
- The game must still be usable when an ad blocker leaves an empty slot.

## Originality

Patterns such as centered shells, tab rows, card stacks, and result dialogs are reusable. Do not copy another game's exact wordmark, palette, typography combination, icon arrangement, card proportions, copy, animations, or puzzle data. Create a distinct visual system around the user's concept.
