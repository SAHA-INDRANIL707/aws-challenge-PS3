import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Meeting } from '@/lib/types';

// In-memory persistent fallback if Supabase DB is in setup mode
let memoryMeetings: Meeting[] = [];

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: meetingsData, error } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          raw_transcript,
          summary,
          key_topics,
          created_at,
          decisions (
            id,
            decision_text,
            category,
            rationale,
            source_quote,
            status,
            created_at
          ),
          action_items (
            id,
            task,
            owner_name,
            owner_email,
            deadline,
            priority,
            category,
            source_quote,
            status,
            synced_tools,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && meetingsData) {
        return NextResponse.json({ success: true, data: meetingsData });
      }
    }

    // Return in-memory meetings if Supabase is not connected
    return NextResponse.json({ success: true, data: memoryMeetings });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: memoryMeetings });
  }
}

export async function POST(req: NextRequest) {
  try {
    const meeting: Meeting = await req.json();

    if (!meeting.title || !meeting.raw_transcript) {
      return NextResponse.json({ error: 'Title and transcript are required' }, { status: 400 });
    }

    const meetingId = meeting.id || `mtg-${Date.now()}`;
    const newMeeting: Meeting = {
      ...meeting,
      id: meetingId,
      created_at: meeting.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: mtgErr } = await supabase.from('meetings').insert([
          {
            id: meetingId,
            user_id: meeting.user_id || 'default_user',
            title: meeting.title,
            meeting_date: meeting.meeting_date || new Date().toISOString(),
            raw_transcript: meeting.raw_transcript,
            summary: meeting.summary,
            key_topics: meeting.key_topics,
          },
        ]);

        if (!mtgErr) {
          if (meeting.decisions && meeting.decisions.length > 0) {
            await supabase.from('decisions').insert(
              meeting.decisions.map((d) => ({
                id: d.id,
                meeting_id: meetingId,
                decision_text: d.decision_text,
                category: d.category,
                rationale: d.rationale,
                source_quote: d.source_quote,
                status: d.status || 'approved',
              }))
            );
          }

          if (meeting.action_items && meeting.action_items.length > 0) {
            await supabase.from('action_items').insert(
              meeting.action_items.map((a) => ({
                id: a.id,
                meeting_id: meetingId,
                task: a.task,
                owner_name: a.owner_name,
                owner_email: a.owner_email,
                deadline: a.deadline,
                priority: a.priority,
                category: a.category,
                source_quote: a.source_quote,
                status: a.status || 'pending',
                synced_tools: a.synced_tools,
              }))
            );
          }
        }
      } catch (dbErr) {
        console.warn('Supabase insert warning, saving to memory fallback:', dbErr);
      }
    }

    // Save to memory cache as well
    memoryMeetings = [newMeeting, ...memoryMeetings.filter((m) => m.id !== newMeeting.id)];

    return NextResponse.json({ success: true, data: newMeeting });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save meeting' }, { status: 500 });
  }
}
