import { NextResponse } from 'next/server';
import { practiceSessionService } from '@/lib/services/practice-session';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeCode = searchParams.get('type_code') || undefined;
    const excludeId = searchParams.get('exclude_id') || undefined;

    const item = practiceSessionService.getRandomItem(typeCode, excludeId);
    const counts = practiceSessionService.getBankCounts();
    const availableForType = typeCode ? (counts[typeCode.toUpperCase()] || 0) : 0;
    const totalBankSize = Object.values(counts).reduce((a, b) => a + b, 0);

    if (!item) {
      return NextResponse.json({
        success: false,
        error: 'No question found for the specified criteria'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item,
      available_for_type: availableForType,
      total_bank_size: totalBankSize,
      counts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
