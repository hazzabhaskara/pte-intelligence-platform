import { NextResponse } from 'next/server';
import { practiceSessionService } from '@/lib/services/practice-session';

export async function GET() {
  try {
    const attempts = practiceSessionService.listRecentSessions();
    return NextResponse.json({ success: true, attempts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = practiceSessionService.createSession({
      session_mode: body.session_mode,
      type_code: body.type_code,
      section: body.section
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
