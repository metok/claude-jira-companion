import { describe, it, expect } from "bun:test";
import { buildSuggestion, type TicketContext } from "../../src/lib/suggestion-builder.js";
import type { SessionTracker } from "../../src/types.js";

const SESSION_WITH_COMMITS: SessionTracker = {
  sessionId: "sess-123",
  startedAt: "2026-03-18T10:00:00Z",
  activeTicketId: "PROJ-123",
  commits: [
    { hash: "abc1234", message: "fix auth timeout", timestamp: "2026-03-18T10:30:00Z", ticketId: "PROJ-123" },
    { hash: "def5678", message: "add retry logic", timestamp: "2026-03-18T11:00:00Z", ticketId: "PROJ-123" },
  ],
};

const SESSION_NO_TICKET: SessionTracker = {
  sessionId: "sess-456",
  startedAt: "2026-03-18T10:00:00Z",
  activeTicketId: null,
  commits: [],
};

const TICKET_CONTEXT: TicketContext = {
  key: "PROJ-123",
  summary: "Fix authentication timeout",
  status: "In Progress",
  acItems: ["System retries failed auth requests automatically", "User sees no error for transient failures"],
};

describe("buildSuggestion", () => {
  it("returns null when no active ticket", () => {
    expect(buildSuggestion(SESSION_NO_TICKET, null)).toBeNull();
  });

  it("returns null when no commits in session", () => {
    const emptySession: SessionTracker = { ...SESSION_WITH_COMMITS, commits: [] };
    expect(buildSuggestion(emptySession, TICKET_CONTEXT)).toBeNull();
  });

  it("includes ticket key and summary in output", () => {
    const result = buildSuggestion(SESSION_WITH_COMMITS, TICKET_CONTEXT);
    expect(result).toContain("PROJ-123");
    expect(result).toContain("Fix authentication timeout");
  });

  it("lists commits in output", () => {
    const result = buildSuggestion(SESSION_WITH_COMMITS, TICKET_CONTEXT);
    expect(result).toContain("fix auth timeout");
    expect(result).toContain("add retry logic");
  });

  it("includes acceptance criteria when present", () => {
    const result = buildSuggestion(SESSION_WITH_COMMITS, TICKET_CONTEXT);
    expect(result).toContain("System retries failed auth requests automatically");
    expect(result).toContain("User sees no error for transient failures");
  });

  it("still generates output when ticket has no ACs", () => {
    const noAcContext: TicketContext = { ...TICKET_CONTEXT, acItems: [] };
    const result = buildSuggestion(SESSION_WITH_COMMITS, noAcContext);
    expect(result).not.toBeNull();
    expect(result).toContain("PROJ-123");
  });

  it("output uses business language headers", () => {
    const result = buildSuggestion(SESSION_WITH_COMMITS, TICKET_CONTEXT);
    expect(result).toContain("Suggested Jira Updates");
    expect(result).toContain("Commits this session");
  });
});
