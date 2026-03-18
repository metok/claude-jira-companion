import { getClient } from "../lib/jira-client.js";
import { parseDuration } from "../lib/formatter.js";

export async function run(): Promise<void> {
  const ticketId = process.argv[3];
  const durationFlag = process.argv[4];
  const durationStr = process.argv[5];

  if (!ticketId || durationFlag !== "--duration" || !durationStr) {
    console.error('Usage: bun run src/cli.ts log-time PROJ-123 --duration "30m"');
    process.exit(1);
  }

  const timeSpentSeconds = parseDuration(durationStr);
  const client = await getClient();

  await client.issueWorklogs.addWorklog({
    issueIdOrKey: ticketId,
    timeSpentSeconds,
    started: new Date().toISOString().replace("Z", "+0000"),
  });

  console.log(`✓ Logged ${durationStr} on ${ticketId}`);
}
