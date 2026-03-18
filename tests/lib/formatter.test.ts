import { describe, it, expect } from "bun:test";
import { formatTicketRow, formatSprintTable, formatTicketDetail, parseDuration } from "../../src/lib/formatter";

describe("formatTicketRow", () => {
  it("formats a ticket row", () => {
    const row = formatTicketRow({ key: "PROJ-1", summary: "Fix bug", status: "In Progress", priority: "High", sprint: "Sprint 42" });
    expect(row).toContain("PROJ-1");
    expect(row).toContain("Fix bug");
    expect(row).toContain("In Progress");
  });
});

describe("formatSprintTable", () => {
  it("renders a markdown table header", () => {
    const table = formatSprintTable([]);
    expect(table).toContain("| Key |");
    expect(table).toContain("| Summary |");
    expect(table).toContain("| Status |");
  });

  it("renders ticket rows", () => {
    const table = formatSprintTable([
      { key: "PROJ-1", summary: "Fix bug", status: "To Do", priority: "High", sprint: "Sprint 42" },
    ]);
    expect(table).toContain("PROJ-1");
    expect(table).toContain("Fix bug");
  });
});

describe("formatTicketDetail", () => {
  it("includes key and summary in output", () => {
    const result = formatTicketDetail({
      key: "PROJ-1",
      fields: {
        summary: "Fix the bug",
        status: { name: "In Progress" },
        priority: { name: "High" },
      },
    });
    expect(result).toContain("PROJ-1");
    expect(result).toContain("Fix the bug");
    expect(result).toContain("In Progress");
  });
});

describe("parseDuration", () => {
  it("parses minutes", () => {
    expect(parseDuration("30m")).toBe(1800);
  });

  it("parses hours", () => {
    expect(parseDuration("2h")).toBe(7200);
  });

  it("parses hours and minutes", () => {
    expect(parseDuration("1h30m")).toBe(5400);
  });

  it("throws on invalid format", () => {
    expect(() => parseDuration("2d")).toThrow();
  });
});
