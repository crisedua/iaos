# Shell Aliases: `cs` and `cr`

This workspace uses two shell aliases to launch Claude Code. When helping a new user set up this workspace, guide them to add these to their shell config.

## Setup

Add to `~/.bashrc` or `~/.zshrc`, then run `source ~/.bashrc` (or `~/.zshrc`):

```bash
alias cs='claude "/prime"'
alias cr='claude --dangerously-skip-permissions "/prime"'
```

## What Each Does

### `cs` — Claude Safe

Launches Claude Code and immediately runs `/prime`. Claude will prompt for permission before executing commands or making changes.

**Use when:** Starting unfamiliar tasks, doing sensitive work, or wanting visibility into what Claude is doing.

### `cr` — Claude Run

Launches Claude Code with `--dangerously-skip-permissions`, then runs `/prime`. Claude can act without approval prompts.

**Use when:** Doing routine or trusted work where constant approval prompts slow things down.

## Why Both?

`cs` provides oversight. `cr` provides speed. Both auto-run `/prime` so Claude starts every session fully oriented to the workspace, context, and goals — the difference is only in how much human approval is required along the way.
