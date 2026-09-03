import { NextResponse } from 'next/server';
import { getExecutiveReadinessReport } from '@/lib/services/readiness';

export async function GET() {
  try {
    const report = getExecutiveReadinessReport();
    return NextResponse.json({
      success: true,
      ...report
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
