# roco-world

安装依赖：

```bash
bun install
```

运行爬虫：

```bash
bun run src/index.ts
```

本项目使用 `bun init` 创建，基于 bun v1.3.5。[Bun](https://bun.com) 是一个快速的全能 JavaScript 运行时。

## 安装 Skill

将 `roco-agent` skill 安装到 Claude Code 用户目录，使其在所有项目中可用：

```bash
git clone git@github.com:TsingShui/roco-world-skill.git /tmp/roco-world-skill
cp -r /tmp/roco-world-skill/.claude/skills/roco-world ~/.claude/skills/roco-world
```

或将以下提示词粘贴给 Claude Code，自动完成安装：

```
请安装 roco-agent skill，执行以下命令：
git clone git@github.com:TsingShui/roco-world-skill.git /tmp/roco-world-skill && cp -r /tmp/roco-world-skill/.claude/skills/roco-world ~/.claude/skills/roco-world
```
