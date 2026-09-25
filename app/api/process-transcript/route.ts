import { NextRequest, NextResponse } from 'next/server';
import { extractMeetingInsightsWithGroq } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, apiKey } = body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid meeting transcript text.' },
        { status: 400 }
      );
    }

    const insights = await extractMeetingInsightsWithGroq(transcript, apiKey);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error: any) {
    console.error('API /api/process-transcript error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process transcript with Groq AI' },
      { status: 500 }
    );
  }
}
