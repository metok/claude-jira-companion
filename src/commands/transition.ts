import { getClient } from "../lib/jira-client.js";

export async function run(): Promise<void> {
  const ticketId = process.argv[3];
  const statusFlag = process.argv[4];
  const statusName = process.argv[5];

  if (!ticketId || statusFlag !== "--status" || !statusName) {
    console.error('Usage: bun run src/cli.ts transition PROJ-123 --status "In Review"');
    process.exit(1);
  }

  const client = await getClient();

  const { transitions } = await client.issues.getTransitions({ issueIdOrKey: ticketId });
  const match = transitions?.find(t => t.name?.toLowerCase() === statusName.toLowerCase());

  if (!match || !match.id) {
    const available = transitions?.map(t => t.name).join(", ");
    console.error(`Status "${statusName}" not found. Available: ${available}`);
    process.exit(1);
  }

  await client.issues.doTransition({
    issueIdOrKey: ticketId,
    transition: { id: match.id },
  });

  console.log(`✓ ${ticketId} transitioned to "${match.name}"`);
}
