export interface JiraAuth {
  host: string;       // e.g. "company.atlassian.net"
  email: string;
  apiToken: string;
}

export interface JiraPreferences {
  showSprintOnStart: boolean;
  autoDetectTicketFromBranch: boolean;
  maxSprintTickets: number;
}

export interface JiraConfig {
  auth: JiraAuth;
  preferences: JiraPreferences;
}

export const DEFAULT_PREFERENCES: JiraPreferences = {
  showSprintOnStart: true,
  autoDetectTicketFromBranch: true,
  maxSprintTickets: 20,
};

export interface TrackedCommit {
  hash: string;
  message: string;
  timestamp: string;
  ticketId: string | null;
}

export interface SessionTracker {
  sessionId: string;
  startedAt: string;
  activeTicketId: string | null;
  commits: TrackedCommit[];
}
