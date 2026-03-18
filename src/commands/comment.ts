import { getClient } from "../lib/jira-client.js";

export async function run(): Promise<void> {
  const ticketId = process.argv[3];
  const bodyFlag = process.argv[4];
  const body = process.argv[5];

  if (!ticketId || bodyFlag !== "--body" || !body) {
    console.error('Usage: bun run src/cli.ts comment PROJ-123 --body "comment text"');
    process.exit(1);
  }

  const client = await getClient();
  await client.issueComments.addComment({
    issueIdOrKey: ticketId,
    comment: {
      type: "doc",
      version: 1,
      content: [{ type: "paragraph", content: [{ type: "text", text: body }] }],
    },
  });

  console.log(`✓ Comment added to ${ticketId}`);
}
