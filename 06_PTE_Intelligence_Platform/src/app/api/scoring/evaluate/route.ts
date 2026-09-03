import { NextResponse } from 'next/server';
import { evaluateObjective } from '@/lib/scoring/objective';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type_code, user_submission, canonical_data, response_id = null } = body;

    if (!type_code) {
      return NextResponse.json({ success: false, error: 'type_code is required' }, { status: 400 });
    }

    const evaluation = evaluateObjective({
      type_code,
      user_submission,
      canonical_data,
      response_id
    });

    return NextResponse.json({
      success: true,
      type_code: String(type_code).toUpperCase(),
      eval_id: evaluation.eval_id,
      result: evaluation.breakdown
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
