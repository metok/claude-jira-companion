import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import os from "node:os";
import type { JiraConfig } from "../types.js";

function getConfigDir(): string {
  return process.env.CLAUDE_JIRA_CONFIG_DIR ?? join(os.homedir(), ".claude-jira");
}

function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

export async function configExists(): Promise<boolean> {
  try {
    await access(getConfigPath());
    return true;
  } catch {
    return false;
  }
}

export async function readConfig(): Promise<JiraConfig> {
  const path = getConfigPath();
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as JiraConfig;
  } catch {
    throw new Error("Jira companion not configured. Run: bun run src/cli.ts setup");
  }
}

export async function writeConfig(config: JiraConfig): Promise<void> {
  const path = getConfigPath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(config, null, 2), { mode: 0o600 });
}
