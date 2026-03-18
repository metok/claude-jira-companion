import { getClient } from "../lib/jira-client.js";
import { readConfig } from "../lib/config.js";
import { getCurrentBranchTicket } from "../lib/ticket-detector.js";
import { formatSprintTable, getSprintName } from "../lib/formatter.js";
import type { TicketRow } from "../lib/formatter.js";

export async function run(): Promise<void> {
  const config = await readConfig();
  const client = await getClient();

  const maxTickets = config.preferences.maxSprintTickets;

  const result = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
    jql: "assignee = currentUser() AND sprint in openSprints() ORDER BY priority ASC",
    maxResults: maxTickets,
    fields: ["summary", "status", "priority", "sprint"],
  });

  const issues = result.issues ?? [];

  const rows: TicketRow[] = issues.map(issue => ({
    key: issue.key ?? "",
    summary: (issue.fields as Record<string, unknown>)?.summary as string ?? "",
    status: ((issue.fields as Record<string, unknown>)?.status as Record<string, string>)?.name ?? "",
    priority: ((issue.fields as Record<string, unknown>)?.priority as Record<string, string>)?.name ?? "None",
    sprint: getSprintName(issue.fields),
  }));

  const activeTicket = config.preferences.autoDetectTicketFromBranch
    ? await getCurrentBranchTicket()
    : null;

  const lines: string[] = [];

  if (activeTicket) {
    lines.push(`**Active ticket (from branch):** ${activeTicket}`);
    lines.push("");
  }

  if (rows.length === 0) {
    lines.push("No tickets assigned in open sprints.");
  } else {
    lines.push(formatSprintTable(rows));
  }

  console.log(lines.join("\n"));
}
