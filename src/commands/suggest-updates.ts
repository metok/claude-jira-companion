import { readSession } from "../lib/session-tracker.js";
import { getClient } from "../lib/jira-client.js";
import { extractTextFromAdf, findAcceptanceCriteria } from "../lib/ac-parser.js";
import { buildSuggestion } from "../lib/suggestion-builder.js";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

export async function run(): Promise<void> {
  const sessionId = getArg("--session");
  if (!sessionId) {
    console.error("Usage: bun run src/cli.ts suggest-updates --session SESSION_ID");
    process.exit(1);
  }

  const session = await readSession(sessionId);
  if (!session || !session.activeTicketId || session.commits.length === 0) {
    // Nothing to suggest — silent exit (called from stop hook)
    process.exit(0);
  }

  const client = await getClient();
  const issue = await client.issues.getIssue({
    issueIdOrKey: session.activeTicketId,
    fields: ["summary", "status", "description"],
  });

  const fields = issue.fields as Record<string, unknown>;
  const descText = extractTextFromAdf(fields?.description);
  const acItems = findAcceptanceCriteria(descText);

  const ticketContext = {
    key: session.activeTicketId,
    summary: fields?.summary as string ?? "",
    status: (fields?.status as Record<string, string>)?.name ?? "",
    acItems,
  };

  const suggestion = buildSuggestion(session, ticketContext);
  if (suggestion) {
    console.log(suggestion);
  }
}
