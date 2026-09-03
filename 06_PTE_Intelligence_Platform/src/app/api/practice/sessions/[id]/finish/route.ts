import { NextResponse } from 'next/server';
import { practiceSessionService } from '@/lib/services/practice-session';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await context.params;
    const body = await req.json();
    const { total_duration_seconds = 0 } = body;

    const result = practiceSessionService.finishSession({
      attempt_id: attemptId,
      total_duration_seconds
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
