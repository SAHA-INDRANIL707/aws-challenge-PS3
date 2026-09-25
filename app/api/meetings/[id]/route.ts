import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('meetings').delete().eq('id', id);
    }
    return NextResponse.json({ success: true, message: `Meeting ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete meeting' }, { status: 500 });
  }
}
