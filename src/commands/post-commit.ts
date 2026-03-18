import { addCommit, setActiveTicket } from "../lib/session-tracker.js";
import { getCurrentBranchTicket } from "../lib/ticket-detector.js";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

export async function run(): Promise<void> {
  const sessionId = getArg("--session");
  if (!sessionId) {
    // Called silently from hook — no error output needed
    process.exit(0);
  }

  // Get latest commit info from git (sync — fast, no race condition)
  const proc = Bun.spawnSync(["git", "log", "-1", "--format=%H|%s|%aI"]);
  const output = new TextDecoder().decode(proc.stdout).trim();

  if (!proc.success || !output) {
    // No commits yet or not a git repo — exit silently
    process.exit(0);
  }

  const [hash, message, timestamp] = output.split("|");
  if (!hash || !message) {
    process.exit(0);
  }

  // Detect ticket from current branch
  const ticketId = await getCurrentBranchTicket();

  // Append commit to session
  await addCommit(sessionId, {
    hash,
    message,
    timestamp: timestamp ?? new Date().toISOString(),
    ticketId,
  });

  // If this is the first commit on a ticket branch, set as active ticket
  if (ticketId) {
    await setActiveTicket(sessionId, ticketId);
  }
}
