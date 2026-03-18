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
    console.error("Usage: bun run src/cli.ts session-summary --session SESSION_ID");
    process.exit(1);
  }

  const session = await readSession(sessionId);
  if (!session || session.commits.length === 0) {
    process.exit(0);
  }

  const { commits, activeTicketId } = session;

  const lines: string[] = [];
  lines.push(`**Session summary:** ${commits.length} commit(s) tracked`);

  if (activeTicketId) {
    lines.push(`**Active ticket:** ${activeTicketId}`);
  }

  lines.push("");
  for (const c of commits) {
    lines.push(`- \`${c.hash.slice(0, 7)}\`: ${c.message}`);
  }

  // If a ticket is associated, append the Jira update suggestions
  if (activeTicketId) {
    try {
      const client = await getClient();
      const issue = await client.issues.getIssue({
        issueIdOrKey: activeTicketId,
        fields: ["summary", "status", "description"],
      });
      const fields = issue.fields as Record<string, unknown>;
      const descText = extractTextFromAdf(fields?.description);
      const acItems = findAcceptanceCriteria(descText);

      const ticketContext = {
        key: activeTicketId,
        summary: fields?.summary as string ?? "",
        status: (fields?.status as Record<string, string>)?.name ?? "",
        acItems,
      };

      const suggestion = buildSuggestion(session, ticketContext);
      if (suggestion) {
        lines.push("");
        lines.push(suggestion);
      }
    } catch {
      // Jira fetch failed — still output the summary without suggestions
    }
  }

  console.log(lines.join("\n"));
}
