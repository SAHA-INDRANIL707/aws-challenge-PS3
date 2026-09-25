export type Priority = 'High' | 'Medium' | 'Low';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type DecisionStatus = 'approved' | 'rejected' | 'modified';

export interface Decision {
  id: string;
  meeting_id?: string;
  decision_text: string;
  category: string;
  rationale?: string;
  source_quote?: string;
  status?: DecisionStatus;
  created_at?: string;
}

export interface ToolSyncStatus {
  calendar: {
    synced: boolean;
    event_id?: string | null;
    event_url?: string | null;
    synced_at?: string | null;
  };
  jira: {
    synced: boolean;
    issue_key?: string | null;
    issue_url?: string | null;
    synced_at?: string | null;
  };
  slack: {
    synced: boolean;
    channel?: string | null;
    message_ts?: string | null;
    synced_at?: string | null;
  };
  email: {
    synced: boolean;
    sent_to?: string | null;
    sent_at?: string | null;
  };
}

export interface ActionItem {
  id: string;
  meeting_id?: string;
  task: string;
  owner_name: string;
  owner_email?: string;
  deadline?: string; // ISO date string
  priority: Priority;
  category: string;
  source_quote?: string;
  status: ActionStatus;
  synced_tools: ToolSyncStatus;
  created_at?: string;
}

export interface Meeting {
  id: string;
  user_id?: string;
  title: string;
  meeting_date: string;
  raw_transcript: string;
  summary: string;
  key_topics: string[];
  decisions: Decision[];
  action_items: ActionItem[];
  created_at: string;
}

export interface ExtractedData {
  title: string;
  summary: string;
  key_topics: string[];
  decisions: {
    decision_text: string;
    category: string;
    rationale?: string;
    source_quote?: string;
  }[];
  action_items: {
    task: string;
    owner_name: string;
    owner_email?: string;
    deadline?: string;
    priority: Priority;
    category: string;
    source_quote?: string;
  }[];
}

export interface IntegrationConfig {
  google: {
    connected: boolean;
    email?: string;
    hasCalendarAccess: boolean;
    hasGmailAccess: boolean;
  };
  jira: {
    connected: boolean;
    host?: string;
    email?: string;
    apiToken?: string;
    projectKey?: string;
  };
  slack: {
    connected: boolean;
    webhookUrl?: string;
    channel?: string;
  };
}
