import { getClient } from "../lib/jira-client.js";
import { formatTicketDetail } from "../lib/formatter.js";

export async function run(): Promise<void> {
  const ticketId = process.argv[3];
  if (!ticketId) {
    console.error("Usage: bun run src/cli.ts ticket PROJ-123");
    process.exit(1);
  }

  const client = await getClient();
  const issue = await client.issues.getIssue({
    issueIdOrKey: ticketId,
    fields: ["summary", "status", "priority", "description", "comment", "subtasks", "parent", "issuetype"],
  });

  console.log(formatTicketDetail(issue as Parameters<typeof formatTicketDetail>[0]));

  const transitions = await client.issues.getTransitions({ issueIdOrKey: ticketId });
  if (transitions.transitions && transitions.transitions.length > 0) {
    console.log("\n## Available Transitions");
    for (const t of transitions.transitions) {
      console.log(`- ${t.name} (id: ${t.id})`);
    }
  }
}
