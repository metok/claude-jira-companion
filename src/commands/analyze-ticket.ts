import { getClient } from "../lib/jira-client.js";
import { extractTextFromAdf, findAcceptanceCriteria } from "../lib/ac-parser.js";

export async function run(): Promise<void> {
  const ticketId = process.argv[3];
  if (!ticketId) {
    console.error("Usage: bun run src/cli.ts analyze-ticket PROJ-123");
    process.exit(1);
  }

  const client = await getClient();

  const issue = await client.issues.getIssue({
    issueIdOrKey: ticketId,
    fields: [
      "summary", "status", "priority", "description",
      "comment", "subtasks", "parent", "issuetype", "labels",
    ],
  });

  const fields = issue.fields as Record<string, unknown>;
  const summary = fields?.summary as string ?? "";
  const status = (fields?.status as Record<string, string>)?.name ?? "";
  const priority = (fields?.priority as Record<string, string>)?.name ?? "None";
  const issueType = (fields?.issuetype as Record<string, string>)?.name ?? "";
  const parent = fields?.parent as Record<string, unknown> | undefined;

  // Extract description text and find ACs
  const descriptionText = extractTextFromAdf(fields?.description);
  const acItems = findAcceptanceCriteria(descriptionText);

  // Format output as structured markdown for Claude
  const lines: string[] = [
    `# ${ticketId}: ${summary}`,
    "",
    `**Type:** ${issueType}  |  **Status:** ${status}  |  **Priority:** ${priority}`,
  ];

  if (parent) {
    const parentKey = parent.key as string;
    const parentSummary = (parent.fields as Record<string, string>)?.summary ?? "";
    lines.push(`**Parent:** ${parentKey} — ${parentSummary}`);
  }

  lines.push("");

  if (descriptionText) {
    lines.push("## Description");
    lines.push(descriptionText);
    lines.push("");
  }

  if (acItems.length > 0) {
    lines.push("## Acceptance Criteria");
    acItems.forEach((ac, i) => lines.push(`${i + 1}. ${ac}`));
    lines.push("");
  }

  // Subtasks
  const subtasks = fields?.subtasks as Array<Record<string, unknown>> | undefined;
  if (subtasks && subtasks.length > 0) {
    lines.push("## Subtasks");
    for (const sub of subtasks) {
      const subFields = sub.fields as Record<string, unknown>;
      const subStatus = (subFields?.status as Record<string, string>)?.name ?? "";
      lines.push(`- [${subStatus}] ${sub.key}: ${subFields?.summary}`);
    }
    lines.push("");
  }

  // Recent comments (last 3)
  const commentData = fields?.comment as Record<string, unknown> | undefined;
  const comments = commentData?.comments as Array<Record<string, unknown>> | undefined;
  if (comments && comments.length > 0) {
    lines.push("## Recent Comments");
    const recent = comments.slice(-3);
    for (const c of recent) {
      const author = (c.author as Record<string, string>)?.displayName ?? "Unknown";
      const body = extractTextFromAdf(c.body);
      lines.push(`**${author}:** ${body.slice(0, 200)}${body.length > 200 ? "…" : ""}`);
    }
    lines.push("");
  }

  // Available transitions
  const transitions = await client.issues.getTransitions({ issueIdOrKey: ticketId });
  if (transitions.transitions && transitions.transitions.length > 0) {
    lines.push("## Available Transitions");
    for (const t of transitions.transitions) {
      lines.push(`- ${t.name}`);
    }
  }

  console.log(lines.join("\n"));
}
