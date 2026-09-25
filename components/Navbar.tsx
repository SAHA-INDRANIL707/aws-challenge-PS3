'use client';

import React from 'react';
import {
  Zap,
  History,
  Settings,
  LogOut,
  Calendar,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { IntegrationConfig } from '@/lib/types';

interface NavbarProps {
  activeTab: 'process' | 'history';
  setActiveTab: (tab: 'process' | 'history') => void;
  openSettings: () => void;
  integrations: IntegrationConfig;
  meetingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  integrations,
  meetingCount,
}) => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b" style={{ borderColor: 'var(--border-dim)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-1)' }}>SyncPulse</span>
            <span
              className="ml-2 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent-hover)' }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav
          className="flex items-center gap-0.5 p-1 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => setActiveTab('process')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
            style={
              activeTab === 'process'
                ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 10px var(--accent-glow)' }
                : { color: 'var(--text-3)' }
            }
          >
            <Zap className="w-3.5 h-3.5" />
            Process
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
            style={
              activeTab === 'history'
                ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 10px var(--accent-glow)' }
                : { color: 'var(--text-3)' }
            }
          >
            <History className="w-3.5 h-3.5" />
            Archive
            {meetingCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-2)' }}
              >
                {meetingCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Integration dots */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <span title="Google Calendar">
              <Calendar className={`w-3.5 h-3.5 ${integrations.google.connected ? 'text-emerald-400' : 'opacity-20'}`} style={{ color: integrations.google.connected ? undefined : 'var(--text-4)' }} />
            </span>
            <span title="Jira">
              <Layers className={`w-3.5 h-3.5 ${integrations.jira.connected ? 'text-blue-400' : ''}`} style={{ color: integrations.jira.connected ? undefined : 'var(--text-4)', opacity: integrations.jira.connected ? 1 : 0.25 }} />
            </span>
            <span title="Slack">
              <MessageSquare className="w-3.5 h-3.5" style={{ color: integrations.slack.connected ? '#a78bfa' : 'var(--text-4)', opacity: integrations.slack.connected ? 1 : 0.25 }} />
            </span>
          </div>

          <button onClick={openSettings} className="btn-ghost text-xs">
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {session?.user && (
            <div className="flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-7 h-7 rounded-full"
                  style={{ outline: '1px solid var(--accent)' }}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'var(--accent)' }}
                >
                  {(session.user.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1.5 rounded-lg transition"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fb7185'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)'; }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
