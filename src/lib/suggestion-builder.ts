import type { SessionTracker } from "../types.js";

export interface TicketContext {
  key: string;
  summary: string;
  status: string;
  acItems: string[];
}

/**
 * Build a business-language suggestion block for Claude to present to the user.
 * Returns null if there is nothing meaningful to suggest (no commits or no ticket).
 */
export function buildSuggestion(
  session: SessionTracker,
  ticket: TicketContext | null,
): string | null {
  if (!ticket || !session.activeTicketId) return null;
  if (session.commits.length === 0) return null;

  const lines: string[] = [];

  lines.push(`## Suggested Jira Updates for ${ticket.key}`);
  lines.push("");
  lines.push(`**Ticket:** ${ticket.key} — ${ticket.summary} (currently: ${ticket.status})`);
  lines.push("");

  // Commits this session
  lines.push(`**Commits this session (${session.commits.length}):**`);
  for (const c of session.commits) {
    lines.push(`- \`${c.hash.slice(0, 7)}\`: ${c.message}`);
  }
  lines.push("");

  // Acceptance criteria (for Claude to reason against)
  if (ticket.acItems.length > 0) {
    lines.push("**Acceptance Criteria (to reference when writing the comment):**");
    for (const ac of ticket.acItems) {
      lines.push(`- ${ac}`);
    }
    lines.push("");
  }

  // Suggested actions
  lines.push("**Suggested actions — review and confirm each:**");
  lines.push("1. **Add comment** — summarize progress against acceptance criteria in business language");
  lines.push("2. **Transition** — consider moving to 'In Review' if work is complete");
  lines.push("3. **Log time** — optionally record time spent this session");
  lines.push("");
  lines.push("Use `/jira` commands to execute. Nothing will update Jira until you confirm.");

  return lines.join("\n");
}
