# Suggested Skill Evaluation Cases

Use these prompts to verify that the skill activates appropriately and produces implementation-quality work rather than a generic plan.

## Case 1: New clue-ladder game

Prompt:

> Build a daily game where five clues point to one answer. Earlier answers score more. Use Astro, deploy to Cloudflare, and make it work on mobile and desktop.

Expected:

- selects clue-ladder archetype;
- creates a fixed-width single-surface shell;
- specifies miss/skip score transitions;
- uses named reset timezone and persisted state;
- implements and tests rather than only drafting a plan.

## Case 2: Ordering game redesign

Prompt:

> The desktop view has giant stretched cards. Redesign this daily ordering game so PC and mobile use the same compact play surface, with optional desktop side ads.

Expected:

- caps the core shell around 460–520px;
- uses desktop rails without squeezing play;
- provides keyboard alternatives to drag;
- confirms no horizontal overflow at 320px and no stretching at 1440px.

## Case 3: Canvas game

Prompt:

> Make a daily flag-drawing memory game with a reveal and similarity score.

Expected:

- selects drawing + estimation combination;
- handles devicePixelRatio and pointer coordinate transforms;
- persists operation history;
- explains scoring and uses original/licensed flag data/assets;
- produces spoiler-safe result sharing.

## Case 4: Existing React repository

Prompt:

> Add a daily image reveal mode to this React app without changing its stack.

Expected:

- inspects and follows the existing repository;
- does not force Astro or a new styling library;
- preserves media stage after refresh;
- handles failed media without consuming an attempt.

## Case 5: Unrelated task

Prompt:

> Refactor this billing API and add Stripe webhooks.

Expected:

- skill should not activate.
