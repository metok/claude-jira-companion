# claude-jira-companion

A Claude Code plugin that integrates Jira Cloud as your personal task companion.

At every session start, your assigned sprint tickets appear automatically. Manage tickets, update status, add comments, and log time — all from Claude Code, with full transparency before any Jira update.

## Features

- 🎯 **Sprint overview at session start** — all your assigned tickets, every session
- 🔍 **Ticket details** — description, subtasks, comments, available transitions
- ✅ **Ticket management** — transition status, add comments, log time, create tickets
- 🔗 **Branch detection** — automatically highlights which ticket you're working on
- 🛡️ **Transparency first** — never updates Jira without your confirmation
- 📋 **Business language** — Jira stays focused on requirements, not implementation details

## Requirements

- [Bun](https://bun.sh) v1.0+
- Claude Code
- Jira Cloud account with API token access

## Installation

```bash
# Clone to your Claude skills directory
git clone https://github.com/metok/claude-jira-companion ~/.claude/skills/claude-jira-companion
cd ~/.claude/skills/claude-jira-companion
bun install
```

Register via Claude Code's plugin install command:
```
/plugin install ~/.claude/skills/claude-jira-companion
```

## Setup

Run in Claude Code:
```
/jira-setup
```

Or directly:
```bash
bun run ~/.claude/skills/claude-jira-companion/src/cli.ts setup
```

You'll need a Jira API token — generate one at:
https://id.atlassian.com/manage-profile/security/api-tokens

## Usage

- **`/jira`** — manage tickets, view sprint, update status, add comments, log time, create tickets
- **`/jira-setup`** — configure credentials
- Session start automatically shows your sprint overview

## How It Works

1. **Session Start**: The `SessionStart` hook fetches all your assigned tickets across active sprints and injects them as context into Claude's conversation.

2. **Branch Detection**: If your current branch contains a ticket ID (e.g. `PROJ-123-fix-auth`), it's highlighted as the active ticket.

3. **Jira Updates**: All updates are transparent — Claude always shows what it will do and waits for your confirmation before touching Jira.

4. **Business Language**: Comments and descriptions use requirements/acceptance criteria language only. Technical notes stay in plan documents, not in Jira.

## CLI Reference

```bash
bun run src/cli.ts setup                                    # Configure credentials
bun run src/cli.ts my-tickets                               # List assigned sprint tickets
bun run src/cli.ts sprint [--project KEY]                   # Sprint overview
bun run src/cli.ts ticket PROJ-123                          # View ticket details
bun run src/cli.ts transition PROJ-123 --status "In Review" # Update status
bun run src/cli.ts comment PROJ-123 --body "text"           # Add comment
bun run src/cli.ts log-time PROJ-123 --duration "1h30m"     # Log time
bun run src/cli.ts create --project PROJ --summary "Title"  # Create ticket
```

## License

MIT — see [LICENSE](LICENSE)
