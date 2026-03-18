import { getClient } from "../lib/jira-client.js";
import { readConfig } from "../lib/config.js";
import { formatSprintTable, getSprintName } from "../lib/formatter.js";
import type { TicketRow } from "../lib/formatter.js";

export async function run(): Promise<void> {
  const config = await readConfig();
  const client = await getClient();

  const projectArg = process.argv[3];
  const projectFilter = projectArg === "--project" ? `AND project = "${process.argv[4]}" ` : "";

  const result = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
    jql: `assignee = currentUser() AND sprint in openSprints() ${projectFilter}ORDER BY priority ASC`,
    maxResults: config.preferences.maxSprintTickets,
    fields: ["summary", "status", "priority", "sprint"],
  });

  const issues = result.issues ?? [];

  const bySprint = new Map<string, TicketRow[]>();
  for (const issue of issues) {
    const sprint = getSprintName(issue.fields);
    if (!bySprint.has(sprint)) bySprint.set(sprint, []);
    bySprint.get(sprint)!.push({
      key: issue.key ?? "",
      summary: (issue.fields as Record<string, unknown>)?.summary as string ?? "",
      status: ((issue.fields as Record<string, unknown>)?.status as Record<string, string>)?.name ?? "",
      priority: ((issue.fields as Record<string, unknown>)?.priority as Record<string, string>)?.name ?? "None",
      sprint,
    });
  }

  if (bySprint.size === 0) {
    console.log("No tickets assigned in open sprints.");
    return;
  }

  for (const [sprint, rows] of bySprint) {
    console.log(`\n## ${sprint || "No Sprint"}\n`);
    console.log(formatSprintTable(rows));
  }
}
