# QA, Accessibility, and Browser Checklist

Read this reference before completion and whenever the game uses drag-and-drop, canvas, audio/video, maps, keyboard shortcuts, dialogs, iframe embedding, or fullscreen.

## Responsive matrix

Test at least:

| Width × height | Purpose |
|---|---|
| 320 × 568 | smallest supported phone / short viewport |
| 360 × 640 | common compact Android |
| 390 × 844 | modern iPhone-sized viewport |
| 430 × 932 | large phone |
| 768 × 1024 | tablet portrait |
| 1024 × 768 | tablet/desktop threshold |
| 1440 × 900 | wide desktop behavior and rails |

Assertions:

- no horizontal page scroll;
- core game shell fits and remains centered;
- no control is hidden behind safe areas, browser chrome, keyboard, sticky ad, or modal;
- desktop core shell does not expand beyond its intended maximum;
- text remains readable at 200% zoom;
- orientation change preserves state and does not submit or reset.

## Keyboard

- Every interactive element is reachable in a logical sequence.
- Focus is visibly distinct in light and dark themes.
- Enter/Space behavior matches native control expectations.
- Escape closes only the top dismissible layer and never changes game score.
- Backspace edits input; outside input it does not submit, skip, reveal, or navigate an internal game state unless the user explicitly chose that behavior.
- Reordering supports move up/down buttons, keyboard drag semantics, or select-position controls.
- Grid navigation uses documented arrow-key behavior and does not trap focus.

## Screen readers

- Use semantic headings, forms, lists, buttons, and dialogs.
- Give icon-only buttons concise accessible names.
- Announce current clue, attempt result, score change, mistake count, and completion in a polite `aria-live` region.
- Do not announce every decorative animation or every tile individually after a large update.
- For colored feedback, include text such as “correct position,” “present,” “not present,” “higher,” or “lower.”
- Move focus to the result heading when a completion dialog opens and restore focus when it closes.

## Dialogs and sheets

- Use the native `dialog` element when the existing stack supports it well, or implement equivalent focus trapping and return focus.
- Include a visible close control.
- Do not open help automatically on every visit after the player dismisses it.
- Keep result dialogs scrollable on short screens.
- Never place essential game controls only behind a hover state.

## Touch and pointer

- Minimum target: 44×44 CSS pixels.
- Avoid adjacent destructive and primary controls without spacing.
- Use pointer capture for drawing/dragging and cancel cleanly on `pointercancel`.
- Prevent page scrolling only on the active drawing/drag surface, not on the entire document.
- Confirm destructive reset/clear when recovery is impossible.

## Canvas

- Separate CSS dimensions from backing dimensions.
- Multiply backing dimensions by `devicePixelRatio` and scale the rendering context.
- Convert pointer coordinates through the element bounding box.
- Re-render from stored operations after resize rather than stretching a bitmap.
- Provide undo/redo and a textual explanation of the scoring model.
- Add a non-canvas result description where the drawing itself conveys important information.

## Audio and video

- Do not autoplay audible media.
- Provide play/pause, elapsed/progress, replay rule, and volume/mute when relevant.
- Captions/transcripts may be inappropriate before a guess because they spoil the answer; provide an accessible alternative mode or non-spoiling description where possible.
- Stop playback when a result or another clip starts.
- Handle failed media loads without consuming a guess.
- Honor reduced motion and avoid flashing content.

## Maps

- Make pin placement and submission separate.
- Provide zoom/recenter controls with labels.
- Keep attribution visible when the map provider requires it.
- Announce selected coordinates/region and result distance in text.
- Avoid map gestures that block normal page scrolling without an obvious boundary.

## Color and motion

- Meet WCAG contrast for text and meaningful controls.
- Never use red/green alone; add icons, patterns, labels, or position.
- Respect `prefers-reduced-motion` and remove nonessential flips, shakes, confetti, and parallax.
- Keep state transitions short and deterministic so rapid players are not forced to wait.

## Persistence and failure states

Test:

- reload after every attempt/reveal/move;
- browser back/forward;
- private mode or blocked storage;
- corrupt storage JSON;
- outdated schema version;
- media timeout and offline return;
- duplicate rapid click/Enter;
- game open across reset midnight;
- two tabs open on the same puzzle;
- answer or dataset missing.

The game should recover without silently changing attempts or wiping unrelated stats.

## Iframe and fullscreen

- The game must fit both standalone and embedded contexts if embedding is supported.
- Avoid relying on top-level navigation APIs inside an iframe.
- Request fullscreen only after a user gesture and always provide an exit control.
- Recalculate board/canvas size on fullscreen changes without resetting state.
- Document `frame-ancestors` / embed policy and required iframe permissions such as autoplay or fullscreen.
- Do not show both host and game sticky headers when embedding; support an embed mode with reduced chrome.

## Automated checks

Use unit tests for pure rules and Playwright/Cypress for the main loop. A minimal browser suite should cover:

1. first visit and how-to dismissal;
2. valid and invalid action;
3. refresh restore;
4. win and loss;
5. share output;
6. mobile input/keyboard flow;
7. keyboard-only flow;
8. desktop max-width and optional rails;
9. malformed puzzle data;
10. next-day transition.
