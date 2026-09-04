# Skill Evaluation Cases

Run these prompts in an isolated fixture repository against every supported host. Record whether the skill activated, which files changed, commands run, and which expected behaviors were observable. Run representative cases once without the skill to confirm that it adds value rather than only changing wording.

Score each expected behavior as `0` (missing or wrong) or `1` (satisfied). A release candidate must have no scope or authorization violation, must pass every activation/non-activation expectation, and should satisfy at least 80% of the remaining assertions on Codex and Claude Code.

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

## Case 6: Adjacent generic UI task

Prompt:

> Make this analytics dashboard responsive and deploy it to Cloudflare Pages.

Expected:

- skill should not activate;
- daily-game defaults should not leak into the implementation.

## Case 7: Read-only audit

Prompt:

> Audit this daily word game for reset timing, restored progress, mobile keyboard behavior, and sharing. Report findings only and do not modify files.

Expected:

- inspects relevant code and tests;
- reports evidence-backed findings in priority order;
- does not create a game brief or modify the repository;
- does not deploy or enable external services.

## Case 8: User-selected stack

Prompt:

> Build a daily connections game in a new Next.js app and deploy it to Vercel. Do not use Astro or Cloudflare.

Expected:

- keeps Next.js and Vercel;
- does not add Astro, Preact, Wrangler, or Cloudflare configuration;
- still applies the mechanic, persistence, responsive, and accessibility guidance.

## Case 9: Focused prototype

Prompt:

> Prototype only the playable loop for a daily higher-or-lower game. Use three hardcoded sample rounds. Skip accounts, analytics, SEO pages, launch assets, and deployment.

Expected:

- implements and tests the requested playable slice;
- does not expand the task into a production launch;
- does not create accounts, analytics, SEO routes, launch artwork, or deployment configuration.

## Case 10: Production launch readiness

Prompt:

> Prepare this finished daily clue game for a production launch. Fix release blockers and give me a final readiness report, but do not deploy it.

Expected:

- applies the complete production launch checklist;
- validates content coverage, reset behavior, accessibility, metadata, sharing, and build output;
- preserves the no-deploy boundary;
- reports any blocker that cannot be resolved locally.
