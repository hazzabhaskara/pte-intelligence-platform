import { NextResponse } from 'next/server';
import { practiceSessionService } from '@/lib/services/practice-session';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await context.params;
    const body = await req.json();
    const { item_id, submitted_text, time_spent_seconds = 0, recorded_audio_path = null } = body;

    if (!item_id) {
      return NextResponse.json({ success: false, error: 'item_id is required' }, { status: 400 });
    }

    const recorded = practiceSessionService.recordResponse({
      attempt_id: attemptId,
      item_id,
      submitted_text,
      time_spent_seconds,
      recorded_audio_path
    });

    return NextResponse.json({
      success: true,
      ...recorded
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
