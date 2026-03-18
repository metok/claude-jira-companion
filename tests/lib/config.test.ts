import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { readConfig, writeConfig, configExists } from "../../src/lib/config";
import { rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";

const TEST_CONFIG_DIR = join(os.tmpdir(), "claude-jira-test-" + Date.now());

// Override config dir for tests
process.env.CLAUDE_JIRA_CONFIG_DIR = TEST_CONFIG_DIR;

describe("config", () => {
  beforeEach(async () => {
    await mkdir(TEST_CONFIG_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_CONFIG_DIR, { recursive: true, force: true });
    delete process.env.CLAUDE_JIRA_CONFIG_DIR;
    process.env.CLAUDE_JIRA_CONFIG_DIR = TEST_CONFIG_DIR;
  });

  it("configExists returns false when no config file", async () => {
    expect(await configExists()).toBe(false);
  });

  it("writeConfig then readConfig round-trips correctly", async () => {
    const config = {
      auth: { host: "test.atlassian.net", email: "user@test.com", apiToken: "token123" },
      preferences: { showSprintOnStart: true, autoDetectTicketFromBranch: true, maxSprintTickets: 20 },
    };
    await writeConfig(config);
    const result = await readConfig();
    expect(result).toEqual(config);
  });

  it("configExists returns true after write", async () => {
    await writeConfig({
      auth: { host: "x.atlassian.net", email: "x@x.com", apiToken: "x" },
      preferences: { showSprintOnStart: true, autoDetectTicketFromBranch: true, maxSprintTickets: 20 },
    });
    expect(await configExists()).toBe(true);
  });

  it("readConfig throws when config missing", async () => {
    expect(readConfig()).rejects.toThrow("not configured");
  });
});
