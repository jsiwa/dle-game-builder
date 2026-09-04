# DLE Game Builder

[English](README.md) | 简体中文

DLE Game Builder 是一个可复用的 Agent Skill，用来设计、开发、重构和审查高质量的每日浏览器益智游戏。它可以作为独立 skill 安装到 Codex、Claude Code、GitHub Copilot 及其他兼容 Agent Skills 的客户端，也可以作为 Codex/ChatGPT 与 Claude Code 插件安装。

它主要覆盖每日小游戏中容易出错的部分：

- 移动端优先，并在桌面端保持有边界的核心游戏区域；
- 不同游戏机制的状态机和交互模型；
- 每日重置时区、存档、连续天数、归档和分享；
- 谜题结构、别名、难度、来源和内容校验；
- 键盘、触摸、拖拽、Canvas、音视频、地图、iframe 与无障碍 QA；
- SEO、埋点、广告位置、上线素材和 Cloudflare 部署。

## 环境要求

- 支持 Agent Skills 的编码 Agent。
- 运行两个自带脚本时需要 Node.js 18 或更高版本；skill 指令本身没有运行时依赖。
- 安装后的 skill 不需要任何 npm 包。

## 作为独立 Skill 安装

最方便的跨客户端方式是使用 GitHub CLI 2.90 或更高版本。

### Codex

```bash
gh skill install jsiwa/dle-game-builder dle-game-builder --agent codex --scope user
```

使用 `$dle-game-builder` 显式调用，也可以让 Codex 根据任务自动选择。

### Claude Code

```bash
gh skill install jsiwa/dle-game-builder dle-game-builder --agent claude-code --scope user
```

使用 `/dle-game-builder` 显式调用，也可以让 Claude 根据任务自动选择。

### GitHub Copilot

```bash
gh skill install jsiwa/dle-game-builder dle-game-builder --agent github-copilot --scope user
```

去掉 `--scope user` 即安装到当前项目。也可以把 `plugins/dle-game-builder/skills/dle-game-builder/` 复制到以下目录：

| 客户端 | 项目级 | 用户级 |
| --- | --- | --- |
| Codex | `.agents/skills/dle-game-builder/` | `~/.agents/skills/dle-game-builder/` |
| Claude Code | `.claude/skills/dle-game-builder/` | `~/.claude/skills/dle-game-builder/` |
| GitHub Copilot | `.github/skills/dle-game-builder/` 或 `.agents/skills/dle-game-builder/` | `~/.copilot/skills/dle-game-builder/` 或 `~/.agents/skills/dle-game-builder/` |

## 作为插件安装

插件方式提供版本化分发和客户端专用元数据，同时复用同一份核心 skill。

### Codex 和 ChatGPT

```bash
codex plugin marketplace add jsiwa/dle-game-builder
codex plugin add dle-game-builder@dle-game-builder
```

如果使用本地检出，将 `jsiwa/dle-game-builder` 换成仓库的绝对路径。

### Claude Code

在 Claude Code 中运行：

```text
/plugin marketplace add jsiwa/dle-game-builder
/plugin install dle-game-builder@dle-game-builder
```

插件模式下的完整显式命令是 `/dle-game-builder:dle-game-builder`。本地开发也可以直接运行：

```bash
claude --plugin-dir ./plugins/dle-game-builder
```

## 使用示例

```text
$dle-game-builder 制作一个每天排序 7 个历史事件的游戏，部署到 Cloudflare Workers，并适配手机和桌面端。
```

```text
/dle-game-builder 检查当前每日游戏的手机键盘、桌面宽度、每日重置、存档和防剧透分享。只报告，不修改文件。
```

```text
制作一个受每日绘图玩法启发的记忆绘制游戏，但使用原创品牌、交互细节和世界地标轮廓内容。
```

## 仓库结构

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

## 自带脚本

在仓库根目录运行：

```bash
node plugins/dle-game-builder/skills/dle-game-builder/scripts/daily-key.mjs America/New_York 2026-09-04T03:30:00Z
```

```bash
node plugins/dle-game-builder/skills/dle-game-builder/scripts/validate-puzzles.mjs plugins/dle-game-builder/skills/dle-game-builder/assets/example-puzzles.json
```

检查生产内容库存时增加 `--launch --strict`。

## 开发与验证

```bash
npm test
npm run validate
gh skill publish --dry-run
claude plugin validate ./plugins/dle-game-builder --strict
```

发布新版本前，应运行以上命令，同步更新 skill 和两个插件 manifest 中的版本，并创建语义化版本标签。

## 安全说明

Agent skill 可以包含可执行指令和脚本，安装前应先审查内容。本项目自带脚本只读取调用方指定的谜题文件或计算日期 key，不访问网络，也不会修改项目文件。

## 参考文档

- [Agent Skills 规范](https://agentskills.io/specification)
- [OpenAI：创建 Skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI：打包插件](https://developers.openai.com/plugins/build/plugins)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)

## 许可证

MIT © 2026 Jsiwa and contributors.
