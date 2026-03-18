---
name: jira-setup
version: 0.1.0
description: |
  Configure Jira companion — set up API credentials and preferences.
  Use when: user wants to set up Jira, connect their account, or update credentials.
allowed-tools:
  - Bash
  - AskUserQuestion
---

# Jira Setup

Guide the user through configuring the Jira companion plugin.

## Steps

1. Run the interactive setup:

```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" setup
```

This prompts for:
- **Jira host**: e.g. `yourcompany.atlassian.net` (without https://)
- **Email**: Atlassian account email
- **API token**: Generate at https://id.atlassian.com/manage-profile/security/api-tokens

2. After setup, verify it works:

```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" my-tickets
```

If tickets appear, setup is complete. If there's an error, check credentials.

## Notes
- Credentials are stored in `~/.claude-jira/config.json` (owner read-only)
- Never share or commit this file
