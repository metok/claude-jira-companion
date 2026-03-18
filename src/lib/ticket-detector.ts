const TICKET_REGEX = /\b([A-Z][A-Z0-9]+-\d+)\b/;
const TICKET_ID_REGEX = /^[A-Z][A-Z0-9]+-\d+$/;

export function detectTicketFromBranch(branchName: string): string | null {
  const match = branchName.match(TICKET_REGEX);
  return match ? match[1] : null;
}

export function isTicketId(value: string): boolean {
  return TICKET_ID_REGEX.test(value);
}

export async function getCurrentBranchTicket(): Promise<string | null> {
  const proc = Bun.spawn(["git", "branch", "--show-current"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const branch = (await new Response(proc.stdout).text()).trim();
  await proc.exited;
  if (!branch) return null;
  return detectTicketFromBranch(branch);
}
