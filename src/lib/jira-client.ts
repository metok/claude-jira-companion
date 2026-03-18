import { Version3Client } from "jira.js";
import { readConfig } from "./config.js";

let _client: Version3Client | null = null;

export async function getClient(): Promise<Version3Client> {
  if (_client) return _client;
  const config = await readConfig();
  _client = new Version3Client({
    host: `https://${config.auth.host}`,
    authentication: {
      basic: {
        email: config.auth.email,
        apiToken: config.auth.apiToken,
      },
    },
  });
  return _client;
}
