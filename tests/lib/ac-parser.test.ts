import { describe, it, expect } from "bun:test";
import { extractTextFromAdf, findAcceptanceCriteria } from "../../src/lib/ac-parser.js";

const SIMPLE_ADF = {
  type: "doc",
  version: 1,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Fix the authentication timeout issue." }],
    },
  ],
};

const ADF_WITH_ACS = {
  type: "doc",
  version: 1,
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Acceptance Criteria" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "System retries failed auth requests automatically" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "User sees no error for transient failures" }],
            },
          ],
        },
      ],
    },
  ],
};

describe("extractTextFromAdf", () => {
  it("extracts text from a simple paragraph", () => {
    const result = extractTextFromAdf(SIMPLE_ADF);
    expect(result).toContain("Fix the authentication timeout issue.");
  });

  it("extracts text from nested ADF nodes", () => {
    const result = extractTextFromAdf(ADF_WITH_ACS);
    expect(result).toContain("Acceptance Criteria");
    expect(result).toContain("System retries failed auth requests automatically");
    expect(result).toContain("User sees no error for transient failures");
  });

  it("returns empty string for null/undefined input", () => {
    expect(extractTextFromAdf(null)).toBe("");
    expect(extractTextFromAdf(undefined)).toBe("");
  });

  it("returns empty string for plain string description", () => {
    expect(extractTextFromAdf("plain text description")).toBe("plain text description");
  });
});

describe("findAcceptanceCriteria", () => {
  it("finds AC items under Acceptance Criteria heading", () => {
    const text = "## Acceptance Criteria\n- Item one\n- Item two\n\n## Other section\n- Not AC";
    const result = findAcceptanceCriteria(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain("Item one");
    expect(result[1]).toContain("Item two");
  });

  it("returns empty array when no AC section found", () => {
    const text = "No acceptance criteria here. Just a description.";
    expect(findAcceptanceCriteria(text)).toEqual([]);
  });

  it("handles 'Acceptance criteria' case-insensitively", () => {
    const text = "## acceptance criteria\n- Item A";
    const result = findAcceptanceCriteria(text);
    expect(result).toHaveLength(1);
  });

  it("handles numbered lists under AC heading", () => {
    const text = "## Acceptance Criteria\n1. First item\n2. Second item";
    const result = findAcceptanceCriteria(text);
    expect(result).toHaveLength(2);
  });
});
