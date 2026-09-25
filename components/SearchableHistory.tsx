'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  FileCheck, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  Trash2, 
  Clock, 
  Eye, 
  X,
  FileText,
  Tag
} from 'lucide-react';
import { Meeting } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface SearchableHistoryProps {
  meetings: Meeting[];
  onSelectMeeting: (m: Meeting) => void;
  onDeleteMeeting: (id: string) => Promise<void>;
}

export const SearchableHistory: React.FC<SearchableHistoryProps> = ({
  meetings,
  onSelectMeeting,
  onDeleteMeeting,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMeetingForPreview, setSelectedMeetingForPreview] = useState<Meeting | null>(null);

  // Extract all categories
  const allCategories = ['All', ...Array.from(new Set(meetings.flatMap((m) => m.decisions.map((d) => d.category))))];

  // Filter meetings based on search
  const filteredMeetings = meetings.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && selectedCategory === 'All') return true;

    const matchesCategory =
      selectedCategory === 'All' || m.decisions.some((d) => d.category === selectedCategory);

    if (!matchesCategory) return false;
    if (!q) return true;

    const inTitle = m.title.toLowerCase().includes(q);
    const inSummary = m.summary.toLowerCase().includes(q);
    const inTranscript = m.raw_transcript.toLowerCase().includes(q);
    const inDecisions = m.decisions.some((d) => d.decision_text.toLowerCase().includes(q) || (d.source_quote && d.source_quote.toLowerCase().includes(q)));
    const inActions = m.action_items.some(
      (a) =>
        a.task.toLowerCase().includes(q) ||
        a.owner_name.toLowerCase().includes(q) ||
        (a.source_quote && a.source_quote.toLowerCase().includes(q))
    );

    return inTitle || inSummary || inTranscript || inDecisions || inActions;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Header Bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Searchable Decision & Meeting Archive</h3>
            <p className="text-xs text-slate-400">
              Instant keyword search across past transcripts, decisions, owners, and action items
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {filteredMeetings.length} of {meetings.length} Meetings
          </span>
        </div>

        {/* Search input & Filter Tags */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search e.g. 'auth overhaul', 'Priya', 'database migration', 'vendor contract'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {allCategories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meeting Cards Grid */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No meeting records found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try searching for another keyword or process a new meeting transcript from the tab above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{new Date(m.meeting_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onSelectMeeting(m)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-semibold transition"
                    >
                      Load in Reviewer
                    </button>
                    <button
                      onClick={() => onDeleteMeeting(m.id)}
                      title="Delete meeting"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                  {m.title}
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{m.summary}</p>

                {/* Highlights: Decisions & Action Items Count */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span className="font-semibold">{m.decisions.length} Decisions</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="font-semibold">{m.action_items.length} Action Items</span>
                  </div>
                </div>

                {/* Match snippet if searching */}
                {searchQuery && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                    <span className="text-amber-400 font-semibold">Match Found: </span>
                    {m.raw_transcript.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                      <span className="italic">
                        &ldquo;
                        {m.raw_transcript.substring(
                          Math.max(0, m.raw_transcript.toLowerCase().indexOf(searchQuery.toLowerCase()) - 30),
                          Math.min(m.raw_transcript.length, m.raw_transcript.toLowerCase().indexOf(searchQuery.toLowerCase()) + 70)
                        )}
                        ...&rdquo;
                      </span>
                    ) : (
                      <span>In structured items</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action item owners preview */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>
                    Owners: {Array.from(new Set(m.action_items.map((a) => a.owner_name))).join(', ') || 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMeetingForPreview(m)}
                  className="text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <span>Quick View</span>
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {selectedMeetingForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-white">{selectedMeetingForPreview.title}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(selectedMeetingForPreview.meeting_date).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedMeetingForPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              <div>
                <h5 className="font-bold text-slate-200 uppercase tracking-wider mb-1">Executive Summary</h5>
                <p className="leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {selectedMeetingForPreview.summary}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Decisions ({selectedMeetingForPreview.decisions.length})
                </h5>
                <div className="space-y-2">
                  {selectedMeetingForPreview.decisions.map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="font-semibold text-slate-100">{d.decision_text}</div>
                      {d.rationale && <div className="text-slate-400">Rationale: {d.rationale}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Action Items ({selectedMeetingForPreview.action_items.length})
                </h5>
                <div className="space-y-2">
                  {selectedMeetingForPreview.action_items.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{a.task}</span>
                        <span className="text-amber-400 font-medium">{formatDate(a.deadline)}</span>
                      </div>
                      <div className="text-slate-400">
                        Assigned to: <span className="text-slate-200 font-medium">{a.owner_name}</span> ({a.category})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Raw Transcript Excerpt</h5>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedMeetingForPreview.raw_transcript}
                </pre>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end space-x-2">
              <button
                onClick={() => {
                  onSelectMeeting(selectedMeetingForPreview);
                  setSelectedMeetingForPreview(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Open in Full Reviewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
