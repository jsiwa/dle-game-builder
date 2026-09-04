# dle-game-builder Skill

这是一个可复用的 Agent Skill，用来让 Claude Code、Codex、GitHub Copilot 等兼容 Agent Skills 的编码代理，稳定地设计、开发、重构和验收 DLE / Daily Browser Game。

它不是只给一套 UI，而是把日常小游戏最容易出错的部分固化成流程：

- 移动端为主、PC 保持固定核心游戏宽度；
- 不同 DLE 机制的状态机与交互规范；
- 每日重置、时区、存档、连续天数和分享；
- 谜题内容结构、别名、难度与校验；
- 手机键盘、拖拽、Canvas、音视频、地图和 iframe 的 QA；
- SEO、广告位、埋点、Cloudflare 部署与上线素材。

## 安装

开放标准常见目录：

```text
<project>/.agents/skills/dle-game-builder/
```

Claude Code 项目级目录：

```text
<project>/.claude/skills/dle-game-builder/
```

Claude Code 个人级目录：

```text
~/.claude/skills/dle-game-builder/
```

把整个文件夹复制进去即可。目录名必须和 `SKILL.md` 里的 `name` 一致。

## 使用示例

```text
/dle-game-builder 制作一个每天排序 7 个历史事件的游戏，部署到 Cloudflare Workers。
```

```text
使用 dle-game-builder 检查当前项目：移动端键盘、PC 固定宽度、每日重置、存档和分享是否正确，并直接修复。
```

```text
做一个 Vexle 类型的“从记忆中绘制”玩法，但不要复制它的品牌和界面；主题改成世界地标轮廓。
```

## 默认实现倾向

- 已有项目：完全遵循当前技术栈。
- 新项目：Astro + React/Preact + TypeScript。
- 部署：Cloudflare Workers Static Assets；只有排行榜、账号同步、受保护谜题接口等功能才增加 Worker API。
- 核心游戏区域：通常 420–560px，默认 480px；PC 端居中，外侧空间用于广告、帮助或装饰。

## 文件结构

```text
dle-game-builder/
├── SKILL.md
├── README.md
├── references/
│   ├── interface-patterns.md
│   ├── mechanic-archetypes.md
│   ├── daily-state-engine.md
│   ├── content-pipeline.md
│   ├── qa-accessibility.md
│   └── seo-launch.md
├── assets/
│   ├── game-brief.template.md
│   ├── dle-shell.css
│   ├── puzzle.schema.json
│   ├── example-puzzles.json
│   ├── directory-metadata.template.json
│   └── responsive.spec.ts
├── scripts/
│   ├── daily-key.mjs
│   └── validate-puzzles.mjs
└── evals/
    └── cases.md
```

## 自带脚本

检查指定时区的每日 key：

```bash
node scripts/daily-key.mjs America/New_York 2026-09-04T03:30:00Z
```

校验谜题数据：

```bash
node scripts/validate-puzzles.mjs assets/example-puzzles.json
```

## 设计结论

该 Skill 采用“single-surface”模型：手机是核心游戏版式，PC 不盲目拉伸，而是在两侧增加留白、广告位、帮助或线索面板。Crossword、Sudoku 等高密度棋盘类游戏可以在桌面增加辅助栏，但棋盘本身仍保持有边界的逻辑尺寸。

## 参考标准

- Agent Skills specification: https://agentskills.io/specification
- Agent Skills best practices: https://agentskills.io/skill-creation/best-practices
- Claude Code skills: https://code.claude.com/docs/en/skills
- Cloudflare Workers static assets: https://developers.cloudflare.com/workers/static-assets/
