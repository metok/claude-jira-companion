/** Recursively extract plain text from a Jira ADF node */
export function extractTextFromAdf(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string") return node;
  if (typeof node !== "object") return "";

  const n = node as Record<string, unknown>;

  // Text leaf node
  if (n.type === "text" && typeof n.text === "string") {
    return n.text;
  }

  // Collect text from all children
  const parts: string[] = [];

  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      const text = extractTextFromAdf(child);
      if (text) parts.push(text);
    }
  }

  // Add spacing for block-level nodes
  const blockTypes = new Set(["paragraph", "heading", "listItem", "bulletList", "orderedList", "blockquote"]);
  const separator = blockTypes.has(n.type as string) ? "\n" : " ";

  return parts.join(separator).trim();
}

/**
 * Find acceptance criteria items in plain text.
 * Looks for a section headed "Acceptance Criteria" (case-insensitive)
 * and returns bullet/numbered list items under it.
 */
export function findAcceptanceCriteria(text: string): string[] {
  const lines = text.split("\n");
  const acHeaderPattern = /^#+\s*acceptance\s*criteria/i;
  const nextHeaderPattern = /^#+\s/;
  const listItemPattern = /^[\s]*[-*•]|^[\s]*\d+\./;

  let inAcSection = false;
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (acHeaderPattern.test(trimmed)) {
      inAcSection = true;
      continue;
    }

    if (inAcSection) {
      // Stop at next heading
      if (nextHeaderPattern.test(trimmed) && trimmed !== "") {
        break;
      }
      // Collect list items
      if (listItemPattern.test(trimmed)) {
        const item = trimmed.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
        if (item) items.push(item);
      }
    }
  }

  return items;
}
