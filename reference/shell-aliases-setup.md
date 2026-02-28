# Setting Up `cs` and `cr` Shell Aliases

This workspace uses two shell aliases to launch Claude Code with session initialization built in.

## What They Do

| Alias | Command | Mode |
|-------|---------|------|
| `cs` | `claude "/prime"` | Safe — prompts for permission before each action |
| `cr` | `claude --dangerously-skip-permissions "/prime"` | Run — no approval prompts |

Both aliases launch Claude Code and immediately run `/prime`, so every session starts fully oriented to the workspace, context, and goals.

### `cs` — Claude Safe

Launches Claude Code with normal permission behavior. Claude will ask before executing commands or making file changes.

**Use when:** Starting unfamiliar tasks, doing sensitive work, or wanting visibility into what Claude is doing.

### `cr` — Claude Run

Launches Claude Code with `--dangerously-skip-permissions`. Claude acts autonomously without approval prompts.

**Use when:** Doing routine or trusted work where approval prompts slow things down.

## Why Both?

`cs` provides oversight. `cr` provides speed. The only difference is how much human approval is required — both auto-initialize the session via `/prime`.

## Setup Instructions

### macOS / Linux

Add these lines to `~/.bashrc` (bash) or `~/.zshrc` (zsh):

```bash
alias cs='claude "/prime"'
alias cr='claude --dangerously-skip-permissions "/prime"'
```

Then reload your shell config:

```bash
source ~/.bashrc   # or source ~/.zshrc
```

### Windows (Git Bash / WSL)

Add the same lines to `~/.bashrc` in your Git Bash or WSL environment, then run:

```bash
source ~/.bashrc
```

### Windows (PowerShell)

Add to your PowerShell profile (`$PROFILE`):

```powershell
function cs { claude "/prime" @args }
function cr { claude --dangerously-skip-permissions "/prime" @args }
```

## Requirements

- Claude Code CLI must be installed and available as `claude` in your PATH
- The workspace must have a `/prime` command defined at `.claude/commands/prime.md`
- The `/prime` command loads context from the `context/` folder and orients Claude to the workspace
