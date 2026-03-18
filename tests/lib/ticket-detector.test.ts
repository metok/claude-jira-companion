import { describe, it, expect } from "bun:test";
import { detectTicketFromBranch, isTicketId } from "../../src/lib/ticket-detector";

describe("detectTicketFromBranch", () => {
  it("extracts ticket from simple branch", () => {
    expect(detectTicketFromBranch("PROJ-123")).toBe("PROJ-123");
  });

  it("extracts ticket from feature branch", () => {
    expect(detectTicketFromBranch("PROJ-123-fix-auth-timeout")).toBe("PROJ-123");
  });

  it("extracts ticket from feature/prefix branch", () => {
    expect(detectTicketFromBranch("feature/PROJ-123-fix-auth")).toBe("PROJ-123");
  });

  it("returns null for main branch", () => {
    expect(detectTicketFromBranch("main")).toBeNull();
  });

  it("returns null for develop branch", () => {
    expect(detectTicketFromBranch("develop")).toBeNull();
  });

  it("handles multi-word project keys", () => {
    expect(detectTicketFromBranch("CLR-45-clearing-fix")).toBe("CLR-45");
  });
});

describe("isTicketId", () => {
  it("validates correct ticket IDs", () => {
    expect(isTicketId("PROJ-123")).toBe(true);
    expect(isTicketId("CLR-1")).toBe(true);
    expect(isTicketId("ABC123-45")).toBe(true);
  });

  it("rejects invalid ticket IDs", () => {
    expect(isTicketId("proj-123")).toBe(false); // lowercase
    expect(isTicketId("PROJ123")).toBe(false);  // no dash
    expect(isTicketId("123")).toBe(false);
  });
});
