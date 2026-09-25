'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { TranscriptInputSection } from '@/components/TranscriptInputSection';
import { ReviewDashboard } from '@/components/ReviewDashboard';
import { SearchableHistory } from '@/components/SearchableHistory';
import { IntegrationsModal } from '@/components/IntegrationsModal';
import { LoginGate } from '@/components/LoginGate';
import { Meeting, ExtractedData, IntegrationConfig } from '@/lib/types';
import { Zap, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'process' | 'history'>('process');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [groqApiKey, setGroqApiKey] = useState('');

  const [integrations, setIntegrations] = useState<IntegrationConfig>({
    google: {
      connected: true,
      email: 'user@company.com',
      hasCalendarAccess: true,
      hasGmailAccess: true,
    },
    jira: {
      connected: false,
      host: '',
      email: '',
      apiToken: '',
      projectKey: 'PROJ',
    },
    slack: {
      connected: false,
      webhookUrl: '',
      channel: '#general',
    },
  });

  // Load saved meetings and configs
  useEffect(() => {
    if (session?.user?.email) {
      fetchMeetings();
      setIntegrations((prev) => ({
        ...prev,
        google: {
          connected: true,
          email: session.user?.email || '',
          hasCalendarAccess: true,
          hasGmailAccess: true,
        },
      }));
    }

    const savedKey = localStorage.getItem('syncpulse_groq_key');
    if (savedKey) setGroqApiKey(savedKey);

    const savedCfg = localStorage.getItem('syncpulse_integrations');
    if (savedCfg) {
      try {
        setIntegrations(JSON.parse(savedCfg));
      } catch (e) {
        console.warn('Config parse error', e);
      }
    }
  }, [session]);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (data.success && data.data) {
        setAllMeetings(data.data);
      }
    } catch (err) {
      console.warn('Error loading meetings:', err);
    }
  };

  // Analyze transcript with real Groq API
  const handleAnalyzeTranscript = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/process-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          apiKey: groqApiKey || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze transcript with Groq AI');
      }

      const extracted: ExtractedData = json.data;

      const newMeeting: Meeting = {
        id: `mtg-${Date.now()}`,
        user_id: session?.user?.email || 'default_user',
        title: extracted.title || 'Team Meeting Outcomes',
        meeting_date: new Date().toISOString(),
        raw_transcript: transcript,
        summary: extracted.summary || 'Meeting outcomes processed successfully.',
        key_topics: extracted.key_topics || ['General', 'Sprint'],
        decisions: (extracted.decisions || []).map((d, index) => ({
          id: `dec-${Date.now()}-${index}`,
          decision_text: d.decision_text,
          category: d.category || 'General',
          rationale: d.rationale || '',
          source_quote: d.source_quote || '',
          status: 'approved',
          created_at: new Date().toISOString(),
        })),
        action_items: (extracted.action_items || []).map((a, index) => ({
          id: `act-${Date.now()}-${index}`,
          task: a.task,
          owner_name: a.owner_name || 'Unassigned',
          owner_email: a.owner_email || '',
          deadline: a.deadline,
          priority: a.priority || 'Medium',
          category: a.category || 'General',
          source_quote: a.source_quote || '',
          status: 'pending',
          synced_tools: {
            calendar: { synced: false },
            jira: { synced: false },
            slack: { synced: false },
            email: { synced: false },
          },
          created_at: new Date().toISOString(),
        })),
        created_at: new Date().toISOString(),
      };

      setCurrentMeeting(newMeeting);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while processing transcript.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save to Supabase database
  const handleSaveToDatabase = async () => {
    if (!currentMeeting) return;
    setIsSaving(true);

    try {
      const meetingToSave = {
        ...currentMeeting,
        user_id: session?.user?.email || 'default_user',
      };

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingToSave),
      });

      const data = await res.json();
      if (data.success) {
        setAllMeetings((prev) => [meetingToSave, ...prev.filter((m) => m.id !== meetingToSave.id)]);
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete meeting
  const handleDeleteMeeting = async (id: string) => {
    try {
      await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      setAllMeetings((prev) => prev.filter((m) => m.id !== id));
      if (currentMeeting?.id === id) {
        setCurrentMeeting(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // 1. Loading Session State
  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--bg-base)', color: 'var(--text-3)' }}
      >
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-medium">Verifying session…</span>
      </div>
    );
  }

  // 2. Unauthenticated State (Requires Google Login First)
  if (!session) {
    return <LoginGate />;
  }

  const googleToken = (session.user as any)?.accessToken as string | undefined;

  // 3. Authenticated State
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-1)' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        integrations={integrations}
        meetingCount={allMeetings.length}
      />

      {/* Hero Banner — subtle, no gradients */}
      <div
        className="border-b py-6 px-4 sm:px-6 lg:px-8"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: 'rgba(99,102,241,0.10)', color: 'var(--accent-hover)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <Zap className="w-3 h-3" />
              {session.user?.name || session.user?.email}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>
              Turn transcripts into{' '}
              <span style={{ color: 'var(--accent-hover)' }}>decisions &amp; actions</span>
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
              Paste a raw transcript → Groq Qwen AI extracts decisions, owners, deadlines → dispatch to Calendar, Jira &amp; Slack.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
            {[
              { label: 'Google Calendar', color: '#34d399' },
              { label: 'Jira', color: '#818cf8' },
              { label: 'Slack', color: '#f472b6' },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">

        {activeTab === 'process' ? (
          <div className="space-y-6">
            {/* Input panel */}
            <div
              className="p-5 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}
            >
              <TranscriptInputSection
                transcript={transcript}
                setTranscript={setTranscript}
                onAnalyze={handleAnalyzeTranscript}
                isAnalyzing={isAnalyzing}
                error={errorMessage}
              />
            </div>

            {/* Review zone */}
            {currentMeeting && (
              <ReviewDashboard
                meeting={currentMeeting}
                setMeeting={setCurrentMeeting}
                onSaveToDatabase={handleSaveToDatabase}
                isSaving={isSaving}
                integrations={integrations}
                googleAccessToken={googleToken}
              />
            )}
          </div>
        ) : (
          <SearchableHistory
            meetings={allMeetings}
            onSelectMeeting={(m) => { setCurrentMeeting(m); setActiveTab('process'); }}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}
      </main>

      <IntegrationsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={integrations}
        groqKey={groqApiKey}
        onSaveGroqKey={(k) => {
          setGroqApiKey(k);
          localStorage.setItem('syncpulse_groq_key', k);
        }}
        onSaveConfig={(cfg) => {
          setIntegrations(cfg);
          localStorage.setItem('syncpulse_integrations', JSON.stringify(cfg));
        }}
      />
    </div>
  );
}
