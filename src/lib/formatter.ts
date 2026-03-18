export interface TicketRow {
  key: string;
  summary: string;
  status: string;
  priority: string;
  sprint: string;
}

export function formatTicketRow(ticket: TicketRow): string {
  return `| ${ticket.key} | ${ticket.summary} | ${ticket.status} | ${ticket.priority} | ${ticket.sprint} |`;
}

export function formatSprintTable(tickets: TicketRow[]): string {
  const header = "| Key | Summary | Status | Priority | Sprint |\n|-----|---------|--------|----------|--------|";
  if (tickets.length === 0) return header;
  const rows = tickets.map(formatTicketRow).join("\n");
  return `${header}\n${rows}`;
}

export function formatTicketDetail(issue: {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    priority?: { name: string };
    description?: unknown;
    comment?: { comments: Array<{ body: unknown; author: { displayName: string } }> };
    subtasks?: Array<{ key: string; fields: { summary: string; status: { name: string } } }>;
  };
}): string {
  const lines: string[] = [
    `# ${issue.key}: ${issue.fields.summary}`,
    `**Status:** ${issue.fields.status.name}`,
    `**Priority:** ${issue.fields.priority?.name ?? "None"}`,
    "",
  ];

  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    lines.push("## Subtasks");
    for (const sub of issue.fields.subtasks) {
      lines.push(`- [${sub.fields.status.name}] ${sub.key}: ${sub.fields.summary}`);
    }
    lines.push("");
  }

  if (issue.fields.comment && issue.fields.comment.comments.length > 0) {
    lines.push("## Recent Comments");
    const recent = issue.fields.comment.comments.slice(-3);
    for (const c of recent) {
      lines.push(`**${c.author.displayName}:** ${JSON.stringify(c.body)}`);
    }
  }

  return lines.join("\n");
}

/** Parses "30m", "2h", "1h30m" → seconds */
export function parseDuration(input: string): number {
  const hourMatch = input.match(/(\d+)h/);
  const minMatch = input.match(/(\d+)m/);
  if (!hourMatch && !minMatch) {
    throw new Error(`Invalid duration "${input}". Use formats like "30m", "2h", "1h30m"`);
  }
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;
  return (hours * 3600) + (minutes * 60);
}
