#!/usr/bin/env bun
export {};
const command = process.argv[2];

const commands: Record<string, () => Promise<void>> = {
  setup:             () => import("./commands/setup.js").then(m => m.run()),
  "my-tickets":      () => import("./commands/my-tickets.js").then(m => m.run()),
  sprint:            () => import("./commands/sprint.js").then(m => m.run()),
  ticket:            () => import("./commands/ticket.js").then(m => m.run()),
  transition:        () => import("./commands/transition.js").then(m => m.run()),
  comment:           () => import("./commands/comment.js").then(m => m.run()),
  "log-time":        () => import("./commands/log-time.js").then(m => m.run()),
  create:            () => import("./commands/create.js").then(m => m.run()),
  "post-commit":     () => import("./commands/post-commit.js").then(m => m.run()),
  "analyze-ticket":  () => import("./commands/analyze-ticket.js").then(m => m.run()),
  "suggest-updates": () => import("./commands/suggest-updates.js").then(m => m.run()),
  "session-summary": () => import("./commands/session-summary.js").then(m => m.run()),
};

if (!command || !commands[command]) {
  console.log(`Usage: bun run src/cli.ts <command>

Commands:
  setup            Configure credentials
  my-tickets       List your assigned sprint tickets
  sprint           Sprint overview with grouping
  ticket           View ticket details (requires ticket ID)
  transition       Change ticket status
  comment          Add comment to ticket
  log-time         Log work time on ticket
  create           Create new ticket
  post-commit      Track latest git commit (called by hook)
  analyze-ticket   Deep analysis of a ticket with AC extraction
  suggest-updates  Generate Jira update suggestions for current session
  session-summary  Show session commit summary
`);
  process.exit(1);
}

try {
  await commands[command]();
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
