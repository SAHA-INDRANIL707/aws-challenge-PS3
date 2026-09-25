'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Check, 
  Users, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles,
  ClipboardPaste,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Meeting } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface EmailAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  googleAccessToken?: string;
  onSuccess: (sentCount: number) => void;
}

export const EmailAllModal: React.FC<EmailAllModalProps> = ({
  isOpen,
  onClose,
  meeting,
  googleAccessToken,
  onSuccess,
}) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [pasteBulkMode, setPasteBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync recipient list on open
  useEffect(() => {
    if (isOpen) {
      const extracted = Array.from(
        new Set(
          meeting.action_items
            .map((a) => a.owner_email)
            .filter((email): email is string => Boolean(email && email.includes('@')))
        )
      );
      setRecipients(extracted);
      setErrorMessage(null);
    }
  }, [isOpen, meeting]);

  if (!isOpen) return null;

  // Add single email
  const handleAddEmail = () => {
    const trimmed = newEmailInput.trim();
    if (trimmed && trimmed.includes('@')) {
      if (!recipients.includes(trimmed)) {
        setRecipients([...recipients, trimmed]);
      }
      setNewEmailInput('');
      setErrorMessage(null);
    } else if (trimmed) {
      setErrorMessage('Please enter a valid email address.');
    }
  };

  // Import bulk pasted emails
  const handleImportBulk = () => {
    if (!bulkText.trim()) return;
    const extractedEmails = bulkText
      .split(/[\s,;\n\r]+/)
      .map((e) => e.trim().replace(/^<|>$/g, ''))
      .filter((e) => e.includes('@') && e.includes('.'));

    const merged = Array.from(new Set([...recipients, ...extractedEmails]));
    setRecipients(merged);
    setBulkText('');
    setPasteBulkMode(false);
  };

  // Import all emails currently in action items
  const handleImportFromActionItems = () => {
    const extracted = Array.from(
      new Set(
        meeting.action_items
          .map((a) => a.owner_email)
          .filter((email): email is string => Boolean(email && email.includes('@')))
      )
    );
    setRecipients(Array.from(new Set([...recipients, ...extracted])));
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setRecipients(recipients.filter((e) => e !== emailToRemove));
  };

  const handleSendAll = async () => {
    if (recipients.length === 0) {
      setErrorMessage('Please add at least one recipient email address.');
      return;
    }
    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/actions/email-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting,
          recipients,
          customNote,
          googleAccessToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSentSuccess(true);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        onSuccess(data.sentCount || recipients.length);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Failed to send broadcast email.');
      }
    } catch (err: any) {
      console.error('Email broadcast failed:', err);
      setErrorMessage(err.message || 'Failed to send emails.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Meeting Summary to Attendees</h3>
              <p className="text-xs text-slate-400">Send executive summary, decisions, and action items to all participants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Recipients Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Recipient Emails ({recipients.length})</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleImportFromActionItems}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Sync from Action Items</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setPasteBulkMode(!pasteBulkMode)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center space-x-1 hover:underline"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>{pasteBulkMode ? 'Hide Bulk Paste' : 'Paste Email List'}</span>
                </button>
              </div>
            </div>

            {/* Bulk Paste Box if toggled */}
            {pasteBulkMode && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2 animate-fadeIn">
                <span className="text-[11px] text-slate-400 block">
                  Paste emails separated by commas, spaces, or newlines:
                </span>
                <textarea
                  placeholder="alex@company.com, priya@company.com, marcus@company.com"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleImportBulk}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Import All
                  </button>
                </div>
              </div>
            )}

            {/* Recipients Pill List */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 min-h-[55px]">
              {recipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-200 border border-purple-500/30 text-xs font-medium"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="p-0.5 text-slate-400 hover:text-rose-400 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {recipients.length === 0 && (
                <span className="text-xs text-slate-500 italic">
                  No recipient emails added yet. Enter emails below or import them.
                </span>
              )}
            </div>

            {/* Add Single Email Input */}
            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Enter attendee email (e.g. colleague@company.com)"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAddEmail}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Email</span>
              </button>
            </div>
          </div>

          {/* Optional Organizer Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Organizer Note (Optional)
            </label>
            <textarea
              placeholder="e.g. Great meeting everyone! Please review your deliverables and deadlines below."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Email Preview Digest */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Content Preview</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Subject: [Meeting Summary & Actions] {meeting.title}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-300 space-y-3 max-h-44 overflow-y-auto leading-relaxed">
              <div>
                <span className="font-bold text-slate-200 block text-[11px] text-purple-400">
                  📋 EXECUTIVE SUMMARY:
                </span>
                <p className="text-slate-300 mt-0.5">{meeting.summary}</p>
              </div>

              <div>
                <span className="font-bold text-slate-200 block text-[11px] text-emerald-400">
                  🎯 DECISIONS ({meeting.decisions.length}):
                </span>
                {meeting.decisions.map((d, i) => (
                  <div key={d.id} className="text-slate-400">
                    {i + 1}. {d.decision_text}
                  </div>
                ))}
              </div>

              <div>
                <span className="font-bold text-slate-200 block text-[11px] text-blue-400">
                  ⚡ ACTION ITEMS ({meeting.action_items.length}):
                </span>
                {meeting.action_items.map((a, i) => (
                  <div key={a.id} className="text-slate-400">
                    {i + 1}. {a.task} — 👤 {a.owner_name} ({formatDate(a.deadline)})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {recipients.length} attendee{recipients.length !== 1 ? 's' : ''} will receive this summary.
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSendAll}
              disabled={isSending || recipients.length === 0}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all duration-200 ${
                isSending || recipients.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching to All...</span>
                </>
              ) : sentSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Dispatched Successfully!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Send to All {recipients.length} Attendees</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
