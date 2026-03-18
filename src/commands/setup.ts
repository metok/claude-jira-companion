import { writeConfig, configExists, readConfig } from "../lib/config.js";
import { DEFAULT_PREFERENCES } from "../types.js";

function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  return new Promise(resolve => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.resume();
    process.stdin.on("data", chunk => {
      input += chunk;
      if (input.includes("\n")) {
        process.stdin.pause();
        resolve(input.trim());
      }
    });
  });
}

export async function run(): Promise<void> {
  const existing = (await configExists()) ? await readConfig() : null;

  console.log("=== Jira Companion Setup ===\n");
  console.log("You'll need a Jira API token. Generate one at:");
  console.log("https://id.atlassian.com/manage-profile/security/api-tokens\n");

  const host = await prompt(`Jira host (e.g. company.atlassian.net) [${existing?.auth.host ?? ""}]: `);
  const email = await prompt(`Atlassian email [${existing?.auth.email ?? ""}]: `);
  const apiToken = await prompt("API token: ");

  const config = {
    auth: {
      host: host || existing?.auth.host || "",
      email: email || existing?.auth.email || "",
      apiToken: apiToken || existing?.auth.apiToken || "",
    },
    preferences: existing?.preferences ?? DEFAULT_PREFERENCES,
  };

  if (!config.auth.host || !config.auth.email || !config.auth.apiToken) {
    console.error("Error: host, email, and apiToken are all required.");
    process.exit(1);
  }

  await writeConfig(config);
  console.log("\n✓ Configuration saved to ~/.claude-jira/config.json");
  console.log("Run: bun run src/cli.ts my-tickets — to verify it works");
}
