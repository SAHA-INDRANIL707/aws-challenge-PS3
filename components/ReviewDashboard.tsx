'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Layers,
  Mail,
  MessageSquare,
  Clock,
  Tag,
  FileCheck,
  Download,
  Save,
  Quote,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Send,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Meeting, Decision, ActionItem, IntegrationConfig } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { EmailAllModal } from './EmailAllModal';
import { MeetingCarousel } from './MeetingCarousel';

interface ReviewDashboardProps {
  meeting: Meeting;
  setMeeting: React.Dispatch<React.SetStateAction<Meeting | null>>;
  onSaveToDatabase: () => Promise<void>;
  isSaving: boolean;
  integrations: IntegrationConfig;
  googleAccessToken?: string;
}

/* ─── Small helpers ──────────────────────────────────────────── */
const priorityColor = (p: string) => {
  if (p === 'High')   return 'var(--priority-high)';
  if (p === 'Medium') return 'var(--priority-medium)';
  return 'var(--priority-low)';
};

const priorityChip = (p: string) => {
  if (p === 'High')   return 'chip chip-rose';
  if (p === 'Medium') return 'chip chip-amber';
  return 'chip chip-green';
};

function Avatar({ name }: { name: string }) {
  return (
    <span
      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
      style={{ background: 'var(--accent)', color: '#fff' }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({
  meeting,
  setMeeting,
  onSaveToDatabase,
  isSaving,
  integrations,
  googleAccessToken,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'synced' | 'high'>('all');
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});
  const [loadingAction, setLoadingAction] = useState<Record<string, boolean>>({});
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [isEmailAllModalOpen, setIsEmailAllModalOpen] = useState(false);
  const [emailAllBroadcastCount, setEmailAllBroadcastCount] = useState<number | null>(null);

  const uniqueAttendeeEmails = Array.from(
    new Set(
      meeting.action_items
        .map((a) => a.owner_email)
        .filter((e): e is string => Boolean(e && e.includes('@')))
    )
  );

  const toggleQuote = (id: string) =>
    setExpandedQuotes((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ── mutations ── */
  const updateDecision = (id: string, updates: Partial<Decision>) =>
    setMeeting((prev) =>
      prev ? { ...prev, decisions: prev.decisions.map((d) => (d.id === id ? { ...d, ...updates } : d)) } : null
    );

  const deleteDecision = (id: string) =>
    setMeeting((prev) =>
      prev ? { ...prev, decisions: prev.decisions.filter((d) => d.id !== id) } : null
    );

  const addManualDecision = () => {
    const d: Decision = {
      id: `dec-${Date.now()}`,
      decision_text: 'New agreed decision…',
      category: 'General',
      rationale: 'Added during review',
      status: 'approved',
    };
    setMeeting((prev) => (prev ? { ...prev, decisions: [...prev.decisions, d] } : null));
  };

  const updateActionItem = (id: string, updates: Partial<ActionItem>) =>
    setMeeting((prev) =>
      prev
        ? { ...prev, action_items: prev.action_items.map((i) => (i.id === id ? { ...i, ...updates } : i)) }
        : null
    );

  const deleteActionItem = (id: string) =>
    setMeeting((prev) =>
      prev ? { ...prev, action_items: prev.action_items.filter((i) => i.id !== id) } : null
    );

  const addManualActionItem = () => {
    const item: ActionItem = {
      id: `act-${Date.now()}`,
      task: 'New follow-up task…',
      owner_name: 'Team Member',
      owner_email: 'member@company.com',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'Medium',
      category: 'General',
      status: 'pending',
      synced_tools: {
        calendar: { synced: false },
        jira: { synced: false },
        slack: { synced: false },
        email: { synced: false },
      },
    };
    setMeeting((prev) => (prev ? { ...prev, action_items: [...prev.action_items, item] } : null));
  };

  /* ── sync handlers ── */
  const handleCalendarSync = async (item: ActionItem) => {
    const key = `${item.id}-calendar`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/actions/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.task,
          description: `Assigned to: ${item.owner_name}\nPriority: ${item.priority}\n\n${item.source_quote || ''}`,
          deadline: item.deadline,
          attendees: item.owner_email ? [item.owner_email] : [],
          accessToken: googleAccessToken,
        }),
      });
      const r = await res.json();
      if (r.success) {
        updateActionItem(item.id, {
          synced_tools: { ...item.synced_tools, calendar: { synced: true, event_id: r.eventId, event_url: r.htmlLink, synced_at: r.syncedAt } },
        });
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.8 } });
      }
    } catch { /* noop */ } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleJiraSync = async (item: ActionItem) => {
    const key = `${item.id}-jira`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/actions/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: item.task,
          description: `Owner: ${item.owner_name}\nPriority: ${item.priority}\n\n${item.source_quote || ''}`,
          priority: item.priority,
          dueDate: item.deadline,
          jiraHost: integrations.jira.host,
          jiraEmail: integrations.jira.email,
          jiraApiToken: integrations.jira.apiToken,
          projectKey: integrations.jira.projectKey || 'PROJ',
        }),
      });
      const r = await res.json();
      if (r.success) {
        updateActionItem(item.id, {
          synced_tools: { ...item.synced_tools, jira: { synced: true, issue_key: r.issueKey, issue_url: r.issueUrl, synced_at: r.syncedAt } },
        });
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.8 } });
      }
    } catch { /* noop */ } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleEmailOwner = async (item: ActionItem) => {
    if (!item.owner_email?.includes('@')) {
      alert(`Add an email address for ${item.owner_name} first.`);
      return;
    }
    const key = `${item.id}-email`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/actions/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: item.owner_email,
          ownerName: item.owner_name,
          task: item.task,
          deadline: item.deadline,
          priority: item.priority,
          sourceQuote: item.source_quote,
          googleAccessToken,
        }),
      });
      const r = await res.json();
      if (r.success) {
        updateActionItem(item.id, {
          synced_tools: { ...item.synced_tools, email: { synced: true, sent_to: r.sentTo, sent_at: r.sentAt } },
        });
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.8 } });
      }
    } catch { /* noop */ } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSlackSync = async (item: ActionItem) => {
    const key = `${item.id}-slack`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/actions/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: item.task,
          ownerName: item.owner_name,
          deadline: item.deadline,
          priority: item.priority,
          category: item.category,
          webhookUrl: integrations.slack.webhookUrl,
          channel: integrations.slack.channel,
        }),
      });
      const r = await res.json();
      if (r.success) {
        updateActionItem(item.id, {
          synced_tools: { ...item.synced_tools, slack: { synced: true, channel: r.channel, message_ts: r.messageTs, synced_at: r.syncedAt } },
        });
      }
    } catch { /* noop */ } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleBulkSync = async () => {
    setBulkSyncing(true);
    for (const item of meeting.action_items) {
      if (!item.synced_tools.calendar.synced) await handleCalendarSync(item);
      if (!item.synced_tools.jira.synced) await handleJiraSync(item);
    }
    setBulkSyncing(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  const exportMinutes = () => {
    const md = `# ${meeting.title}
**Date:** ${new Date(meeting.meeting_date).toLocaleDateString()}

## Summary
${meeting.summary}

### Key Topics
${meeting.key_topics.map((t) => `- ${t}`).join('\n')}

---

## Decisions (${meeting.decisions.length})
${meeting.decisions
  .map(
    (d, i) => `### ${i + 1}. ${d.decision_text}
- **Category:** ${d.category}
- **Rationale:** ${d.rationale || 'N/A'}
- *Source:* "${d.source_quote || ''}"`
  )
  .join('\n\n')}

---

## Action Items (${meeting.action_items.length})
${meeting.action_items
  .map(
    (a, i) => `### ${i + 1}. [${a.priority}] ${a.task}
- **Owner:** ${a.owner_name} (${a.owner_email || 'No email'})
- **Due:** ${formatDate(a.deadline)}
- **Category:** ${a.category}
- *Transcript:* "${a.source_quote || ''}"`
  )
  .join('\n\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.toLowerCase().replace(/\s+/g, '_')}_minutes.md`;
    a.click();
  };

  const filteredActionItems = meeting.action_items.filter((item) => {
    if (activeFilter === 'pending') return !item.synced_tools.calendar.synced && !item.synced_tools.jira.synced;
    if (activeFilter === 'synced')  return item.synced_tools.calendar.synced || item.synced_tools.jira.synced;
    if (activeFilter === 'high')    return item.priority === 'High';
    return true;
  });

  /* ── render ── */
  return (
    <div className="space-y-6 animate-fade-up">

      {/* ─── Header Card ──────────────────────────────────────── */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}
      >
        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent-hover)' }}>
              AI Analysis Complete · Review &amp; Dispatch
            </p>
            <input
              type="text"
              value={meeting.title}
              onChange={(e) =>
                setMeeting((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              className="w-full text-xl font-bold bg-transparent focus:outline-none"
              style={{ color: 'var(--text-1)', borderBottom: '1px solid transparent' }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = 'var(--accent)'; }}
              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderBottomColor = 'transparent'; }}
            />
          </div>

          {/* Toolbar — neutral ghost buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEmailAllModalOpen(true)}
              className="btn-ghost"
              title="Send summary to all participants"
            >
              <Send className="w-3.5 h-3.5" />
              Email All
              {uniqueAttendeeEmails.length > 0 && (
                <span className="chip chip-slate ml-0.5">{uniqueAttendeeEmails.length}</span>
              )}
            </button>

            <button onClick={exportMinutes} className="btn-ghost">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={handleBulkSync}
              disabled={bulkSyncing}
              className="btn-ghost"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              {bulkSyncing ? 'Syncing…' : 'Sync All'}
            </button>

            <button
              onClick={onSaveToDatabase}
              disabled={isSaving}
              className="btn-ghost"
            >
              <Save className="w-3.5 h-3.5" style={{ color: 'var(--priority-low)' }} />
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {emailAllBroadcastCount !== null && (
          <div
            className="p-3 rounded-lg flex items-center justify-between text-xs"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Meeting summary emailed to {emailAllBroadcastCount} attendees!
            </div>
            <button
              onClick={() => setEmailAllBroadcastCount(null)}
              style={{ color: 'var(--text-3)' }}
              className="hover:text-white transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ─── Summary Prose Block ──────────────────────────────── */}
        <div
          className="rounded-lg p-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              📋 Executive Summary
            </span>
            <button
              onClick={() => setIsEmailAllModalOpen(true)}
              className="flex items-center gap-1 text-[11px] transition"
              style={{ color: 'var(--accent-hover)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'; }}
            >
              <Send className="w-3 h-3" />
              Send to participants
            </button>
          </div>
          <textarea
            value={meeting.summary}
            onChange={(e) =>
              setMeeting((prev) => (prev ? { ...prev, summary: e.target.value } : null))
            }
            rows={2}
            className="w-full text-sm bg-transparent border-none focus:outline-none resize-none leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          />
        </div>

        {/* Key topics */}
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-4)' }} />
          {meeting.key_topics.map((topic, i) => (
            <span key={i} className="chip chip-blue">{topic}</span>
          ))}
        </div>
      </div>

      {/* ─── Meeting Insight Carousel ──────────────────────────── */}
      <MeetingCarousel
        meeting={meeting}
        onOpenEmailAll={() => setIsEmailAllModalOpen(true)}
      />

      {/* ─── Decisions Grid ───────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" style={{ color: 'var(--priority-low)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              Agreed Decisions
            </h3>
            <span className="chip chip-green">{meeting.decisions.length}</span>
          </div>
          <button onClick={addManualDecision} className="btn-ghost text-xs">
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
          {meeting.decisions.map((decision) => (
            <div key={decision.id} className="decision-card group">
              <div className="flex items-center justify-between mb-2">
                <span className="chip chip-green">{decision.category}</span>
                <button
                  onClick={() => deleteDecision(decision.id)}
                  className="btn-ghost-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={decision.decision_text}
                onChange={(e) => updateDecision(decision.id, { decision_text: e.target.value })}
                rows={2}
                className="w-full text-sm font-medium bg-transparent border-none focus:outline-none resize-none"
                style={{ color: 'var(--text-1)' }}
              />

              {decision.rationale && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Rationale: </span>
                  {decision.rationale}
                </p>
              )}

              {decision.source_quote && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => toggleQuote(decision.id)}
                    className="flex items-center gap-1 text-[11px] transition"
                    style={{ color: 'var(--accent-hover)' }}
                  >
                    <Quote className="w-3 h-3" />
                    {expandedQuotes[decision.id] ? 'Hide source' : 'View source'}
                    {expandedQuotes[decision.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {expandedQuotes[decision.id] && (
                    <blockquote
                      className="mt-2 p-2.5 rounded-lg text-xs font-mono italic animate-slide-in"
                      style={{ background: 'var(--bg-overlay)', color: 'var(--text-3)' }}
                    >
                      &ldquo;{decision.source_quote}&rdquo;
                    </blockquote>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Action Items List ─────────────────────────────────── */}
      <section className="space-y-3">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              Action Items &amp; Owners
            </h3>
            <span className="chip chip-blue">{meeting.action_items.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter pills */}
            <div
              className="flex items-center p-0.5 rounded-lg gap-0.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              {(['all', 'high', 'pending', 'synced'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all"
                  style={
                    activeFilter === f
                      ? { background: 'var(--bg-overlay)', color: 'var(--text-1)', border: '1px solid var(--border-dim)' }
                      : { color: 'var(--text-3)', border: '1px solid transparent' }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={addManualActionItem} className="btn-ghost text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Dense row list */}
        <div className="space-y-2 stagger">
          {filteredActionItems.map((item) => {
            const { calendar: cal, jira, slack, email } = item.synced_tools;
            return (
              <div
                key={item.id}
                className="action-row group"
                data-priority={item.priority}
                style={{ borderLeftColor: priorityColor(item.priority) }}
              >
                {/* Row: top line — title */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <textarea
                      value={item.task}
                      onChange={(e) => updateActionItem(item.id, { task: e.target.value })}
                      rows={1}
                      className="w-full text-sm font-semibold bg-transparent border-none focus:outline-none resize-none leading-snug"
                      style={{ color: 'var(--text-1)' }}
                    />

                    {/* Second line: owner + deadline + category */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* Owner with avatar */}
                      <div className="flex items-center gap-1.5">
                        <Avatar name={item.owner_name} />
                        <input
                          type="text"
                          value={item.owner_name}
                          onChange={(e) => updateActionItem(item.id, { owner_name: e.target.value })}
                          className="bg-transparent focus:outline-none text-xs font-semibold"
                          style={{ color: 'var(--text-2)', minWidth: '80px', maxWidth: '140px' }}
                        />
                      </div>
                      {/* Deadline */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" style={{ color: 'var(--text-4)' }} />
                        <input
                          type="date"
                          value={item.deadline ? item.deadline.split('T')[0] : ''}
                          onChange={(e) =>
                            updateActionItem(item.id, {
                              deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                            })
                          }
                          className="bg-transparent focus:outline-none text-xs cursor-pointer"
                          style={{ color: 'var(--text-3)', colorScheme: 'dark' }}
                        />
                      </div>
                      <span className="chip chip-slate">{item.category}</span>
                    </div>

                    {/* Email field — always visible, highlighted box */}
                    <div
                      className="flex items-center gap-2 mt-2.5 px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: item.owner_email?.includes('@') ? 'rgba(99,102,241,0.07)' : 'rgba(245,158,11,0.06)',
                        border: `1px solid ${item.owner_email?.includes('@') ? 'rgba(99,102,241,0.22)' : 'rgba(245,158,11,0.28)'}`,
                      }}
                    >
                      <Mail
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: item.owner_email?.includes('@') ? 'var(--accent-hover)' : '#f59e0b' }}
                      />
                      <input
                        type="email"
                        value={item.owner_email || ''}
                        placeholder={`Enter ${item.owner_name}'s email to send tasks…`}
                        onChange={(e) => updateActionItem(item.id, { owner_email: e.target.value })}
                        className="bg-transparent focus:outline-none text-xs flex-1"
                        style={{ color: item.owner_email?.includes('@') ? 'var(--text-1)' : 'var(--text-3)', minWidth: 0 }}
                      />
                      {item.owner_email?.includes('@') && (
                        <span className="text-[10px] font-semibold shrink-0" style={{ color: 'var(--priority-low)' }}>✓</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteActionItem(item.id)}
                    className="btn-ghost-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Source quote */}
                {item.source_quote && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleQuote(item.id)}
                      className="flex items-center gap-1 text-[11px] transition"
                      style={{ color: 'var(--text-4)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-hover)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-4)'; }}
                    >
                      <Quote className="w-3 h-3" />
                      {expandedQuotes[item.id] ? 'Hide context' : 'Source context'}
                      {expandedQuotes[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {expandedQuotes[item.id] && (
                      <blockquote
                        className="mt-1.5 p-2 rounded-lg text-xs font-mono italic animate-slide-in"
                        style={{ background: 'var(--bg-overlay)', color: 'var(--text-3)' }}
                      >
                        &ldquo;{item.source_quote}&rdquo;
                      </blockquote>
                    )}
                  </div>
                )}

                {/* Tool buttons row */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>

                  {/* Calendar */}
                  {cal.synced ? (
                    <a
                      href={cal.event_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost text-xs"
                      style={{ color: '#34d399' }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Cal Synced
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleCalendarSync(item)}
                      disabled={loadingAction[`${item.id}-calendar`]}
                      className="btn-ghost text-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
                      {loadingAction[`${item.id}-calendar`] ? 'Adding…' : 'Add to Calendar'}
                    </button>
                  )}

                  {/* Jira */}
                  {jira.synced ? (
                    <a
                      href={jira.issue_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost text-xs"
                      style={{ color: '#818cf8' }}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Jira #{jira.issue_key}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleJiraSync(item)}
                      disabled={loadingAction[`${item.id}-jira`]}
                      className="btn-ghost text-xs"
                    >
                      <Layers className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                      {loadingAction[`${item.id}-jira`] ? 'Creating…' : 'Jira Ticket'}
                    </button>
                  )}

                  {/* Email */}
                  {email.synced ? (
                    <span className="btn-ghost text-xs" style={{ color: '#c084fc' }}>
                      <Mail className="w-3.5 h-3.5" />
                      Email Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEmailOwner(item)}
                      disabled={loadingAction[`${item.id}-email`]}
                      className="btn-ghost text-xs"
                    >
                      <Mail className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />
                      {loadingAction[`${item.id}-email`] ? 'Sending…' : 'Email Owner'}
                    </button>
                  )}

                  {/* Slack */}
                  {slack.synced ? (
                    <span className="btn-ghost text-xs" style={{ color: '#f472b6' }}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      Slack ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSlackSync(item)}
                      disabled={loadingAction[`${item.id}-slack`]}
                      className="btn-ghost text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" style={{ color: '#f472b6' }} />
                      {loadingAction[`${item.id}-slack`] ? 'Posting…' : 'Slack'}
                    </button>
                  )}

                  <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-4)' }}>
                    {item.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Email All Modal */}
      <EmailAllModal
        isOpen={isEmailAllModalOpen}
        onClose={() => setIsEmailAllModalOpen(false)}
        meeting={meeting}
        googleAccessToken={googleAccessToken}
        onSuccess={(count) => setEmailAllBroadcastCount(count)}
      />
    </div>
  );
};
