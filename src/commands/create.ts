import { getClient } from "../lib/jira-client.js";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

export async function run(): Promise<void> {
  const project = getArg("--project");
  const summary = getArg("--summary");
  const type = getArg("--type") ?? "Task";
  const priority = getArg("--priority") ?? "Medium";
  const description = getArg("--description");

  if (!project || !summary) {
    console.error('Usage: bun run src/cli.ts create --project PROJ --summary "Title" [--type Task] [--priority Medium] [--description "..."]');
    process.exit(1);
  }

  const client = await getClient();
  const issue = await client.issues.createIssue({
    fields: {
      project: { key: project },
      summary,
      issuetype: { name: type },
      priority: { name: priority },
      ...(description && {
        description: {
          type: "doc",
          version: 1,
          content: [{ type: "paragraph", content: [{ type: "text", text: description }] }],
        },
      }),
    },
  });

  console.log(`✓ Created ${issue.key}: ${summary}`);
}
