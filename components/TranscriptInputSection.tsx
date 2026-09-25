'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Trash2,
  Play,
  Clock,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_TRANSCRIPTS, SampleTranscript } from '@/lib/sampleData';

interface TranscriptInputSectionProps {
  transcript: string;
  setTranscript: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error?: string | null;
}

export const TranscriptInputSection: React.FC<TranscriptInputSectionProps> = ({
  transcript,
  setTranscript,
  onAnalyze,
  isAnalyzing,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'samples' | 'upload'>('paste');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const estimatedReadingTime = Math.ceil(wordCount / 180);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const cleaned = text
          .replace(/WEBVTT[\r\n]+/g, '')
          .replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/g, '')
          .replace(/^\d+$/gm, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        setTranscript(cleaned || text);
        setActiveTab('paste');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const loadSample = (sample: SampleTranscript) => {
    setTranscript(sample.transcript);
    setActiveTab('paste');
  };

  const tabStyle = (tab: string) =>
    activeTab === tab
      ? { background: 'var(--bg-overlay)', color: 'var(--text-1)', borderColor: 'var(--border-mid)' }
      : { background: 'transparent', color: 'var(--text-3)', borderColor: 'transparent' };

  return (
    <div className="w-full space-y-3 animate-fade-up">
      {/* Tab Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div
          className="flex items-center p-1 rounded-lg gap-0.5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {[
            { id: 'paste', icon: <FileText className="w-3.5 h-3.5" />, label: 'Paste / Edit' },
            { id: 'upload', icon: <Upload className="w-3.5 h-3.5" />, label: 'Upload File' },
            { id: 'samples', icon: <Zap className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />, label: 'Samples' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border"
              style={tabStyle(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
          {wordCount > 0 && (
            <>
              <span
                className="px-2 py-1 rounded-md font-semibold"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)' }}
              >
                {wordCount.toLocaleString()} words
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{estimatedReadingTime}m
              </span>
            </>
          )}
          {transcript && (
            <button
              onClick={() => { setTranscript(''); setSelectedFileName(null); }}
              title="Clear"
              className="p-1.5 rounded-md transition"
              style={{ color: 'var(--text-4)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fb7185'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-4)'; }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl p-12 text-center transition-all"
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-dim)'}`,
            background: dragActive ? 'rgba(99,102,241,0.06)' : 'var(--bg-surface)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.vtt,.srt,.doc,.docx"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
          />
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent-hover)' }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {selectedFileName ? `Selected: ${selectedFileName}` : 'Drop your transcript here'}
          </h4>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>
            .txt · .vtt · .srt — Zoom, Teams, Google Meet, Otter.ai
          </p>
          <button
            type="button"
            className="btn-ghost mt-4 text-xs mx-auto"
          >
            Browse from computer
          </button>
        </div>
      )}

      {/* Sample Presets */}
      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger">
          {SAMPLE_TRANSCRIPTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => loadSample(sample)}
              className="group cursor-pointer p-4 rounded-xl transition-all"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="chip chip-blue">Preset</span>
                <Play className="w-3.5 h-3.5 transition-colors" style={{ color: 'var(--text-4)' }} />
              </div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{sample.name}</h4>
              <p className="text-xs line-clamp-2" style={{ color: 'var(--text-3)' }}>{sample.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      {activeTab === 'paste' && (
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here…&#10;e.g. Alex: Let's finalize the NextAuth setup by Friday.&#10;     Priya: I'll handle the database migration by Thursday."
            rows={11}
            className="field-input font-mono text-sm leading-relaxed resize-y"
            style={{ borderRadius: '0.75rem', padding: '1rem', minHeight: '220px' }}
          />

          {error && (
            <div
              className="mt-2 p-3 rounded-lg flex items-center gap-2 text-xs"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.22)', color: '#fb7185' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* CTA Row */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
            style={{ background: 'var(--priority-low)' }}
          />
          Qwen AI Ready · Groq API
        </div>

        {/* PRIMARY CTA — only this button uses the accent */}
        <button
          onClick={onAnalyze}
          disabled={!transcript.trim() || isAnalyzing}
          className="btn-primary"
        >
          {isAnalyzing ? (
            <>
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
              />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Extract Decisions &amp; Action Items
            </>
          )}
        </button>
      </div>
    </div>
  );
};
