# DLE Game Builder

English | [简体中文](README.zh-CN.md)

DLE Game Builder is a reusable Agent Skill for designing, building, redesigning, and auditing polished daily browser puzzle games. It works as a standalone skill in Codex, Claude Code, GitHub Copilot, and other Agent Skills-compatible hosts, and it is also packaged as a plugin for Codex/ChatGPT and Claude Code.

It covers the parts of daily games that are easy to get subtly wrong:

- mobile-first play with an intentionally bounded desktop surface;
- mechanic-specific state and interaction models;
- daily reset time zones, persistence, streaks, archives, and sharing;
- puzzle schemas, aliases, difficulty, provenance, and validation;
- keyboard, touch, drag, canvas, media, map, iframe, and accessibility QA;
- SEO, analytics, ad placement, launch assets, and Cloudflare deployment.

## Requirements

- An Agent Skills-compatible coding agent.
- Node.js 18 or later to run the two bundled helper scripts. The skill instructions themselves have no runtime dependency.
- No npm packages are required by the installed skill.

## Install as a standalone skill

The easiest cross-client installation uses GitHub CLI 2.90 or later.

### Codex

```bash
gh skill install jsiwa/dle-game-builder dle-game-builder --agent codex --scope user
```

Invoke it explicitly with `$dle-game-builder`, or let Codex select it when the request matches.

### Claude Code

```bash
gh skill install jsiwa/dle-game-builder dle-game-builder --agent claude-code --scope user
```

Invoke it explicitly with `/dle-game-builder`, or let Claude select it when relevant.

### GitHub Copilot

```bash
gh skill install jsiwa/dle-game-builder dle-game-builder --agent github-copilot --scope user
```

Omit `--scope user` to install at project scope. You can also copy the directory at `plugins/dle-game-builder/skills/dle-game-builder/` into one of these locations:

| Host | Project scope | User scope |
| --- | --- | --- |
| Codex | `.agents/skills/dle-game-builder/` | `~/.agents/skills/dle-game-builder/` |
| Claude Code | `.claude/skills/dle-game-builder/` | `~/.claude/skills/dle-game-builder/` |
| GitHub Copilot | `.github/skills/dle-game-builder/` or `.agents/skills/dle-game-builder/` | `~/.copilot/skills/dle-game-builder/` or `~/.agents/skills/dle-game-builder/` |

## Install as a plugin

Plugin installation provides versioned distribution and host-specific metadata while reusing the same core skill.

### Codex and ChatGPT

```bash
codex plugin marketplace add jsiwa/dle-game-builder
codex plugin add dle-game-builder@dle-game-builder
```

For a local checkout, replace `jsiwa/dle-game-builder` with its absolute directory path.

### Claude Code

Run these commands inside Claude Code:

```text
/plugin marketplace add jsiwa/dle-game-builder
/plugin install dle-game-builder@dle-game-builder
```

The plugin-scoped explicit command is `/dle-game-builder:dle-game-builder`. For local development, launch Claude Code with:

```bash
claude --plugin-dir ./plugins/dle-game-builder
```

## Example requests

```text
$dle-game-builder Build a daily game where players order seven historical events. Use Cloudflare Workers and make it work well on phones and desktops.
```

```text
/dle-game-builder Audit this daily game for mobile keyboard behavior, desktop width, reset timing, persistence, and spoiler-safe sharing. Report only; do not edit files.
```

```text
Build a memory-drawing game inspired by the mechanic of other daily games, but use original branding, interface details, and landmark-outline content.
```

## Repository structure

```text
dle-game-builder/
├── .agents/plugins/marketplace.json       # Codex marketplace
├── .claude-plugin/marketplace.json        # Claude Code marketplace
├── plugins/dle-game-builder/
│   ├── .codex-plugin/plugin.json
│   ├── .claude-plugin/plugin.json
│   └── skills/dle-game-builder/
│       ├── SKILL.md
│       ├── agents/openai.yaml
│       ├── references/
│       ├── assets/
│       └── scripts/
├── evals/cases.md
├── scripts/validate-package.mjs
└── tests/
```

## Bundled helpers

From this repository checkout:

```bash
node plugins/dle-game-builder/skills/dle-game-builder/scripts/daily-key.mjs America/New_York 2026-09-04T03:30:00Z
```

```bash
node plugins/dle-game-builder/skills/dle-game-builder/scripts/validate-puzzles.mjs plugins/dle-game-builder/skills/dle-game-builder/assets/example-puzzles.json
```

Add `--launch --strict` to the puzzle validator when checking a production content backlog.

## Development and validation

```bash
npm test
npm run validate
gh skill publish --dry-run
claude plugin validate ./plugins/dle-game-builder --strict
```

Before publishing a release, run every command above, bump the version consistently in the skill and both plugin manifests, then create a semantic version tag.

## Security

Agent skills can contain executable instructions and scripts. Review the skill before installing it. The bundled scripts only read the puzzle file supplied by the caller or compute a date key; they do not use the network or mutate project files.

## References

- [Agent Skills specification](https://agentskills.io/specification)
- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI: Package plugins](https://developers.openai.com/plugins/build/plugins)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [GitHub Copilot agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)

## License

MIT © 2026 Jsiwa and contributors.
