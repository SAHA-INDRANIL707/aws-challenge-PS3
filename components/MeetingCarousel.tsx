'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  ListTodo,
  Tag,
  Users,
  Clock,
  Mail,
} from 'lucide-react';
import { Meeting } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface MeetingCarouselProps {
  meeting: Meeting;
  onOpenEmailAll: () => void;
}

/* ─── Slide 1: Meeting Minutes ──────────────────────────────── */
function MinutesSlide({ meeting }: { meeting: Meeting }) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
          Executive Summary
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {meeting.summary || 'No summary available.'}
        </p>
      </div>
      <div className="divider" />
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
          {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Decisions', value: meeting.decisions.length, color: 'var(--priority-low)' },
          { label: 'Actions',   value: meeting.action_items.length, color: 'var(--accent-hover)' },
          { label: 'Topics',    value: meeting.key_topics.length, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg p-3 text-center"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Slide 2: Decisions ─────────────────────────────────────── */
function DecisionsSlide({ meeting }: { meeting: Meeting }) {
  return (
    <div className="h-full flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
        Agreed Decisions · {meeting.decisions.length} total
      </p>
      <div className="space-y-3 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '260px' }}>
        {meeting.decisions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-4)' }}>No decisions recorded.</p>
        ) : (
          meeting.decisions.map((d, i) => (
            <div
              key={d.id}
              className="flex gap-3 p-3 rounded-lg"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--priority-low)' }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-1)' }}>
                  {d.decision_text}
                </p>
                {d.category && (
                  <span className="chip chip-green mt-1 inline-flex">{d.category}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Slide 3: Action Items ──────────────────────────────────── */
function ActionItemsSlide({ meeting }: { meeting: Meeting }) {
  const highCount   = meeting.action_items.filter((a) => a.priority === 'High').length;
  const mediumCount = meeting.action_items.filter((a) => a.priority === 'Medium').length;
  const lowCount    = meeting.action_items.filter((a) => a.priority === 'Low').length;

  return (
    <div className="h-full flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
        Action Items · {meeting.action_items.length} total
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'High',   count: highCount,   color: 'var(--priority-high)',   bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.2)' },
          { label: 'Medium', count: mediumCount, color: 'var(--priority-medium)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Low',    count: lowCount,    color: 'var(--priority-low)',    bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
        ].map(({ label, count, color, bg, border }) => (
          <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
            <p className="text-xl font-black" style={{ color }}>{count}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '180px' }}>
        {meeting.action_items.slice(0, 6).map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2 p-2.5 rounded-lg"
            style={{
              background: 'var(--bg-overlay)',
              borderLeft: `3px solid ${a.priority === 'High' ? 'var(--priority-high)' : a.priority === 'Medium' ? 'var(--priority-medium)' : 'var(--priority-low)'}`,
              border: '1px solid var(--border-subtle)',
              borderLeftWidth: '3px',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-snug truncate" style={{ color: 'var(--text-1)' }}>
                {a.task}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                {a.owner_name} · {formatDate(a.deadline)}
              </p>
            </div>
          </div>
        ))}
        {meeting.action_items.length > 6 && (
          <p className="text-[11px] text-center" style={{ color: 'var(--text-4)' }}>
            +{meeting.action_items.length - 6} more in the Action Items section below
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Slide 4: Key Topics ────────────────────────────────────── */
function KeyTopicsSlide({ meeting }: { meeting: Meeting }) {
  const wordMap: Record<string, number> = {};
  meeting.action_items.forEach((a) => {
    const cat = a.category || 'General';
    wordMap[cat] = (wordMap[cat] || 0) + 1;
  });
  const maxVal = Math.max(...Object.values(wordMap), 1);
  const paletteColors = [
    { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.22)' },
    { bg: 'rgba(52,211,153,0.10)', color: '#34d399', border: 'rgba(52,211,153,0.22)' },
    { bg: 'rgba(245,158,11,0.10)', color: '#fbbf24', border: 'rgba(245,158,11,0.22)' },
    { bg: 'rgba(244,63,94,0.10)',  color: '#fb7185', border: 'rgba(244,63,94,0.22)' },
    { bg: 'rgba(192,132,252,0.10)', color: '#c084fc', border: 'rgba(192,132,252,0.22)' },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
        Key Topics Discussed
      </p>
      <div className="flex flex-wrap gap-2">
        {meeting.key_topics.map((topic, i) => {
          const c = paletteColors[i % paletteColors.length];
          return (
            <span key={i} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
              {topic}
            </span>
          );
        })}
      </div>
      <div className="divider" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-3)' }}>
          Areas of Work
        </p>
        <div className="space-y-2.5">
          {Object.entries(wordMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-xs font-medium w-24 shrink-0 truncate" style={{ color: 'var(--text-2)' }}>{cat}</span>
              <div className="flex-1 rounded-full overflow-hidden h-1.5" style={{ background: 'var(--bg-overlay)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxVal) * 100}%`, background: 'var(--accent)' }} />
              </div>
              <span className="text-[11px] font-bold w-4 text-right shrink-0" style={{ color: 'var(--text-3)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 5: Attendees ─────────────────────────────────────── */
function AttendanceSlide({ meeting, onOpenEmailAll }: { meeting: Meeting; onOpenEmailAll: () => void }) {
  const owners = Array.from(
    new Map(meeting.action_items.map((a) => [a.owner_name, a])).values()
  );

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          Attendees &amp; Owners · {owners.length} people
        </p>
        <button
          onClick={onOpenEmailAll}
          className="flex items-center gap-1.5 text-xs font-medium transition"
          style={{ color: 'var(--accent-hover)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'; }}
        >
          <Mail className="w-3.5 h-3.5" />
          Email All
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '280px' }}>
        {owners.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-4)' }}>No owners identified yet.</p>
        ) : (
          owners.map((a) => {
            const myItems = meeting.action_items.filter((i) => i.owner_name === a.owner_name);
            const high    = myItems.filter((i) => i.priority === 'High').length;
            return (
              <div
                key={a.owner_name}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {a.owner_name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{a.owner_name}</p>
                  {a.owner_email ? (
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{a.owner_email}</p>
                  ) : (
                    <p className="text-[11px] italic" style={{ color: 'var(--text-4)' }}>
                      no email — add it in the action row below
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{myItems.length}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>task{myItems.length !== 1 ? 's' : ''}</p>
                  {high > 0 && <span className="chip chip-rose mt-1 inline-flex">{high} 🔥</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Slide Config ───────────────────────────────────────────── */
const SLIDES = [
  { id: 'minutes',    label: 'Meeting Minutes',  Icon: FileText },
  { id: 'decisions',  label: 'Decisions',         Icon: CheckCircle2 },
  { id: 'actions',    label: 'Action Items',      Icon: ListTodo },
  { id: 'topics',     label: 'Key Topics',        Icon: Tag },
  { id: 'attendance', label: 'Attendees',         Icon: Users },
];

/* ─── Carousel Shell ─────────────────────────────────────────── */
export const MeetingCarousel: React.FC<MeetingCarouselProps> = ({ meeting, onOpenEmailAll }) => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? SLIDES.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === SLIDES.length - 1 ? 0 : c + 1));

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>

      {/* Tab strip */}
      <div
        className="flex items-center overflow-x-auto border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)', scrollbarWidth: 'none' }}
      >
        {SLIDES.map(({ id, label, Icon }, i) => (
          <button
            key={id}
            onClick={() => setCurrent(i)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 shrink-0"
            style={
              current === i
                ? { color: 'var(--accent-hover)', borderBottomColor: 'var(--accent)', background: 'rgba(99,102,241,0.06)' }
                : { color: 'var(--text-3)', borderBottomColor: 'transparent' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Card body */}
      <div className="relative p-5" style={{ minHeight: '340px' }}>

        {/* Left nav arrow */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', color: 'var(--text-2)' }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLElement; b.style.background = 'var(--accent)'; b.style.color = '#fff'; b.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLElement; b.style.background = 'var(--bg-overlay)'; b.style.color = 'var(--text-2)'; b.style.borderColor = 'var(--border-dim)'; }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right nav arrow */}
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', color: 'var(--text-2)' }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLElement; b.style.background = 'var(--accent)'; b.style.color = '#fff'; b.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLElement; b.style.background = 'var(--bg-overlay)'; b.style.color = 'var(--text-2)'; b.style.borderColor = 'var(--border-dim)'; }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Slide content */}
        <div className="px-8 animate-fade-up" key={current}>
          {current === 0 && <MinutesSlide    meeting={meeting} />}
          {current === 1 && <DecisionsSlide  meeting={meeting} />}
          {current === 2 && <ActionItemsSlide meeting={meeting} />}
          {current === 3 && <KeyTopicsSlide  meeting={meeting} />}
          {current === 4 && <AttendanceSlide meeting={meeting} onOpenEmailAll={onOpenEmailAll} />}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-200"
            style={{
              width: current === i ? '20px' : '6px',
              height: '6px',
              background: current === i ? 'var(--accent)' : 'var(--bg-overlay)',
              border: `1px solid ${current === i ? 'var(--accent)' : 'var(--border-dim)'}`,
            }}
          />
        ))}
        <span className="ml-2 text-[10px] font-semibold" style={{ color: 'var(--text-4)' }}>
          {current + 1} / {SLIDES.length}
        </span>
      </div>
    </div>
  );
};
