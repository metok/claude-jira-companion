import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";
import type { SessionTracker, TrackedCommit } from "../types.js";

function getSessionsDir(): string {
  const base = process.env.CLAUDE_JIRA_CONFIG_DIR ?? join(os.homedir(), ".claude-jira");
  return join(base, "sessions");
}

function getSessionPath(sessionId: string): string {
  return join(getSessionsDir(), `${sessionId}.json`);
}

export async function readSession(sessionId: string): Promise<SessionTracker | null> {
  try {
    const raw = await readFile(getSessionPath(sessionId), "utf8");
    return JSON.parse(raw) as SessionTracker;
  } catch {
    return null;
  }
}

export async function writeSession(session: SessionTracker): Promise<void> {
  const dir = getSessionsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(getSessionPath(session.sessionId), JSON.stringify(session, null, 2));
}

export async function addCommit(sessionId: string, commit: TrackedCommit): Promise<void> {
  const existing = await readSession(sessionId) ?? {
    sessionId,
    startedAt: new Date().toISOString(),
    activeTicketId: null,
    commits: [],
  };
  existing.commits.push(commit);
  await writeSession(existing);
}

export async function setActiveTicket(sessionId: string, ticketId: string): Promise<void> {
  const existing = await readSession(sessionId) ?? {
    sessionId,
    startedAt: new Date().toISOString(),
    activeTicketId: null,
    commits: [],
  };
  existing.activeTicketId = ticketId;
  await writeSession(existing);
}
