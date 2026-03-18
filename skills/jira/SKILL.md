---
name: jira
version: 0.1.0
description: |
  Manage Jira tickets: view sprint, view ticket details, update status, add comments,
  log time, create tickets. Use when user mentions Jira, tickets, sprint, or task management.
allowed-tools:
  - Bash
  - AskUserQuestion
---

# Jira Companion

Manage Jira Cloud tickets directly from Claude Code.

## Core Principle: Transparency First

**NEVER update Jira without explicit user confirmation.**
Always:
1. Show what you plan to do
2. Ask "Should I proceed?"
3. Execute only after confirmation
4. Show the result

## Jira = Business Language Only

When writing comments or updating descriptions, use **requirements/acceptance criteria language only**.
- ✅ "AC #1 fulfilled: users can now retry failed requests automatically"
- ✅ "This session addressed the auth timeout scenario from the acceptance criteria"
- ❌ "Added RetryHandler class with exponential backoff" (technical detail — goes in plan docs, NOT Jira)

Technical implementation details stay in Claude Code plan documents, not in Jira.

## Available Commands

CLI is at: `${CLAUDE_PLUGIN_ROOT}/src/cli.ts`

### View Sprint Tickets
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" sprint
# Optional filter:
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" sprint --project PROJ
```

### View Ticket
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" ticket PROJ-123
```
Shows: summary, status, priority, description, subtasks, comments, available transitions.

### Analyze Ticket (Deep Context)
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" analyze-ticket PROJ-123
```
Fetches full ticket details including description, **acceptance criteria** (parsed automatically), subtasks, recent comments, and available transitions. Run this when the user says "I'm working on PROJ-123" to load ticket context.

### Get Session Suggestions
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" suggest-updates --session $SESSION_ID
```
Generates a business-language suggestion batch based on this session's commits and the active ticket's acceptance criteria. The Stop hook calls this automatically — you can also run it on demand.

### Update Status
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" transition PROJ-123 --status "In Review"
```
**Always confirm first:** "I'll move PROJ-123 from 'In Progress' to 'In Review'. Shall I proceed?"

### Add Comment
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" comment PROJ-123 --body "Progress update text here"
```
**Always show the comment text first and ask for approval.**
Write in business language: what requirements/AC were addressed, not how.

### Log Time
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" log-time PROJ-123 --duration "1h30m"
```
Supported formats: `30m`, `2h`, `1h30m`.
**Always confirm the duration before logging.**

### Create Ticket
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" create --project PROJ --summary "Title" --type Task --priority Medium --description "..."
```
**Show the full ticket details before creating and ask for confirmation.**

## Workflow: "Update Jira" Request

When user says "update jira" or "sync to jira":
1. Ask which ticket (or detect from branch: `bun run "${CLAUDE_PLUGIN_ROOT}/src/cli.ts" my-tickets`)
2. Run `ticket` to see current state
3. Summarize what was accomplished this session **in business/AC language**
4. Propose: comment + status change (+ time log if appropriate)
5. Wait for approval
6. Execute approved updates

## Workflow: Starting Work on a Ticket

When user says "I'm working on PROJ-123" or starts a session on a ticket branch:
1. Run `analyze-ticket PROJ-123` to load full context
2. Show the ticket summary and acceptance criteria to the user
3. Suggest creating a branch: `git checkout -b PROJ-123-short-description`
4. Optionally transition to "In Progress" (with confirmation)
