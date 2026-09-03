import { NextResponse } from 'next/server';
import { getDatabase, queryAll } from '@/lib/db';
import { STUDY_PLANS, AUSTRALIA_PRACTICAL_MODULES } from '@/lib/curriculum/study_plans';
import crypto from 'crypto';

export async function GET() {
  try {
    const db = getDatabase();

    // Check or get active study plan
    let activePlan = db.prepare('SELECT * FROM study_plans WHERE is_active = 1 LIMIT 1').get() as any;

    if (!activePlan) {
      // Initialize default 4-week master plan
      const planId = `PLAN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      db.prepare(`
        INSERT INTO study_plans (plan_id, track_type, duration_weeks, daily_allocated_minutes, current_day_index, is_active)
        VALUES (?, 'PTE_ACADEMIC', 4, 90, 1, 1)
      `).run(planId);
      activePlan = {
        plan_id: planId,
        track_type: 'PTE_ACADEMIC',
        duration_weeks: 4,
        daily_allocated_minutes: 90,
        current_day_index: 1,
        is_active: 1
      };
    }

    // Remediation priority ranking
    const remediationPriorities = [
      { type_code: 'WFD', name: 'Write From Dictation', impact: 'Tertinggi (Listening & Writing)', weight: 1.0, current_acc: 75, status: 'REINFORCE_SAFE' },
      { type_code: 'RA',  name: 'Read Aloud', impact: 'Sangat Tinggi (Speaking & Reading)', weight: 0.95, current_acc: 88, status: 'REINFORCE_SAFE' },
      { type_code: 'RS',  name: 'Repeat Sentence', impact: 'Tinggi (Speaking & Listening)', weight: 0.90, current_acc: 65, status: 'NEEDS_PRACTICE' },
      { type_code: 'RW_FIB', name: 'Reading & Writing FIB', impact: 'Tinggi (Reading & Writing)', weight: 0.88, current_acc: 55, status: 'REMEDIATION_URGENT' },
      { type_code: 'RTS', name: 'Respond to a Situation ⭐', impact: 'Sedang (Speaking pasca-Agustus 2025)', weight: 0.75, current_acc: 80, status: 'REINFORCE_SAFE' },
      { type_code: 'SGD', name: 'Summarize Group Discussion ⭐', impact: 'Sedang (Speaking pasca-Agustus 2025)', weight: 0.75, current_acc: 70, status: 'NEEDS_PRACTICE' }
    ];

    return NextResponse.json({
      success: true,
      active_plan: activePlan,
      study_plans: STUDY_PLANS,
      remediation_priorities: remediationPriorities,
      australia_modules: AUSTRALIA_PRACTICAL_MODULES
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { duration_weeks = 4 } = body;

    const db = getDatabase();
    // Deactivate previous plans
    db.prepare('UPDATE study_plans SET is_active = 0').run();

    const planId = `PLAN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    db.prepare(`
      INSERT INTO study_plans (plan_id, track_type, duration_weeks, daily_allocated_minutes, current_day_index, is_active)
      VALUES (?, 'PTE_ACADEMIC', ?, 90, 1, 1)
    `).run(planId, Number(duration_weeks));

    return NextResponse.json({
      success: true,
      plan_id: planId,
      duration_weeks: Number(duration_weeks)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
