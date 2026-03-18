#!/usr/bin/env bun
export {};
const command = process.argv[2];

const commands: Record<string, () => Promise<void>> = {
  setup:           () => import("./commands/setup.js").then(m => m.run()),
  "my-tickets":    () => import("./commands/my-tickets.js").then(m => m.run()),
  sprint:          () => import("./commands/sprint.js").then(m => m.run()),
  ticket:          () => import("./commands/ticket.js").then(m => m.run()),
  transition:      () => import("./commands/transition.js").then(m => m.run()),
  comment:         () => import("./commands/comment.js").then(m => m.run()),
  "log-time":      () => import("./commands/log-time.js").then(m => m.run()),
  create:          () => import("./commands/create.js").then(m => m.run()),
};

if (!command || !commands[command]) {
  console.log(`Usage: bun run src/cli.ts <command>

Commands:
  setup         Configure credentials
  my-tickets    List your assigned sprint tickets
  sprint        Sprint overview with grouping
  ticket        View ticket details (requires ticket ID)
  transition    Change ticket status
  comment       Add comment to ticket
  log-time      Log work time on ticket
  create        Create new ticket
`);
  process.exit(1);
}

try {
  await commands[command]();
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
