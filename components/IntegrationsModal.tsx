'use client';

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Layers, 
  MessageSquare, 
  Mail, 
  Key, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { IntegrationConfig } from '@/lib/types';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IntegrationConfig;
  groqKey: string;
  onSaveGroqKey: (key: string) => void;
  onSaveConfig: (cfg: IntegrationConfig) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  config,
  groqKey,
  onSaveGroqKey,
  onSaveConfig,
}) => {
  const [localGroqKey, setLocalGroqKey] = useState(groqKey);
  const [jiraHost, setJiraHost] = useState(config.jira.host || '');
  const [jiraEmail, setJiraEmail] = useState(config.jira.email || '');
  const [jiraToken, setJiraToken] = useState(config.jira.apiToken || '');
  const [jiraProject, setJiraProject] = useState(config.jira.projectKey || 'PROJ');
  const [slackWebhook, setSlackWebhook] = useState(config.slack.webhookUrl || '');
  const [slackChannel, setSlackChannel] = useState(config.slack.channel || '#general');
  const [googleConnected, setGoogleConnected] = useState(config.google.connected);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveGroqKey(localGroqKey);
    onSaveConfig({
      google: {
        connected: googleConnected,
        email: 'user@company.com',
        hasCalendarAccess: googleConnected,
        hasGmailAccess: googleConnected,
      },
      jira: {
        connected: Boolean(jiraHost && jiraEmail && jiraToken),
        host: jiraHost,
        email: jiraEmail,
        apiToken: jiraToken,
        projectKey: jiraProject,
      },
      slack: {
        connected: Boolean(slackWebhook),
        webhookUrl: slackWebhook,
        channel: slackChannel,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tool Integrations & API Settings</h3>
              <p className="text-xs text-slate-400">Connect destination platforms for automated meeting action items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Groq AI Section */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200">Groq AI Engine (Llama-3.3-70b)</span>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="gsk_... (or leave blank to use server environment key)"
              value={localGroqKey}
              onChange={(e) => setLocalGroqKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400">
              Groq delivers ultra-fast 500+ tokens/sec extraction for instant transcript parsing.
            </p>
          </div>

          {/* Google Workspace Section */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Google Calendar & Gmail OAuth</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${googleConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                {googleConnected ? 'Connected' : 'OAuth Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Allows the app to add action item deadlines to your Google Calendar and send assignment notifications on your behalf.
            </p>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setGoogleConnected(!googleConnected)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
                  googleConnected
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{googleConnected ? 'Connected (Click to Disconnect)' : 'Enable Google Integration'}</span>
              </button>
            </div>
          </div>

          {/* Jira Integration Section */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-slate-200">Atlassian Jira</span>
              </div>
              <span className="text-xs text-slate-400">Issue tracking</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Jira Domain URL</label>
                <input
                  type="text"
                  placeholder="https://company.atlassian.net"
                  value={jiraHost}
                  onChange={(e) => setJiraHost(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Default Project Key</label>
                <input
                  type="text"
                  placeholder="PROJ"
                  value={jiraProject}
                  onChange={(e) => setJiraProject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Jira Email</label>
                <input
                  type="email"
                  placeholder="dev@company.com"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Jira API Token</label>
                <input
                  type="password"
                  placeholder="Atlassian API token"
                  value={jiraToken}
                  onChange={(e) => setJiraToken(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Slack Integration Section */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-slate-200">Slack Notifications</span>
              </div>
              <span className="text-xs text-slate-400">Incoming Webhooks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Channel</label>
                <input
                  type="text"
                  placeholder="#general"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Configurations are saved locally in your active session.</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition hover:scale-105 active:scale-95"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-white" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Configurations'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
