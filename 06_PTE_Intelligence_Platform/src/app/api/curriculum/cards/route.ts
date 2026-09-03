import { NextResponse } from 'next/server';
import { getDatabase, queryAll } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const db = getDatabase();

    // Fetch existing cards
    let cards = queryAll(`
      SELECT 
        srs.schedule_id,
        srs.plan_id,
        srs.item_id,
        srs.repetition_interval_days,
        srs.ease_factor,
        srs.streak_count,
        srs.next_review_date,
        srs.last_reviewed_at,
        oei.type_code,
        oei.prompt_text,
        ak.accepted_canonical_text
      FROM spaced_repetition_schedules srs
      JOIN original_exercise_items oei ON srs.item_id = oei.item_id
      LEFT JOIN answer_keys ak ON oei.item_id = ak.item_id
      ORDER BY srs.next_review_date ASC
      LIMIT 10
    `);

    // If empty, auto-seed with exercise items
    if (cards.length === 0) {
      const items = queryAll('SELECT item_id FROM original_exercise_items LIMIT 5');
      const activePlan = db.prepare('SELECT plan_id FROM study_plans WHERE is_active = 1 LIMIT 1').get() as any;
      const planId = activePlan ? activePlan.plan_id : 'PLAN-DEFAULT';

      for (const item of items) {
        const schedId = `SCHED-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        db.prepare(`
          INSERT INTO spaced_repetition_schedules (
            schedule_id, plan_id, item_id, repetition_interval_days, ease_factor, streak_count, next_review_date
          ) VALUES (?, ?, ?, 1, 2.5, 0, DATE('now'))
        `).run(schedId, planId, item.item_id);
      }

      // Re-fetch
      cards = queryAll(`
        SELECT 
          srs.schedule_id,
          srs.plan_id,
          srs.item_id,
          srs.repetition_interval_days,
          srs.ease_factor,
          srs.streak_count,
          srs.next_review_date,
          oei.type_code,
          oei.prompt_text,
          ak.accepted_canonical_text
        FROM spaced_repetition_schedules srs
        JOIN original_exercise_items oei ON srs.item_id = oei.item_id
        LEFT JOIN answer_keys ak ON oei.item_id = ak.item_id
      `);
    }

    return NextResponse.json({ success: true, cards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schedule_id, quality_rating = 4 } = body;

    if (!schedule_id) {
      return NextResponse.json({ success: false, error: 'schedule_id is required' }, { status: 400 });
    }

    const db = getDatabase();
    const card = db.prepare('SELECT * FROM spaced_repetition_schedules WHERE schedule_id = ?').get(schedule_id) as any;

    if (!card) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    const q = Math.max(0, Math.min(5, Number(quality_rating)));
    let repetition = card.streak_count || 0;
    let interval = card.repetition_interval_days || 1;
    let ef = card.ease_factor || 2.5;

    // SM-2 algorithm calculation
    if (q < 3) {
      repetition = 0;
      interval = 1;
    } else {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }
      repetition += 1;
    }

    const deltaEf = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    ef = Math.round(Math.max(1.3, ef + deltaEf) * 100) / 100;

    // Update in database
    db.prepare(`
      UPDATE spaced_repetition_schedules
      SET repetition_interval_days = ?,
          ease_factor = ?,
          streak_count = ?,
          next_review_date = DATE('now', '+' || ? || ' days'),
          last_reviewed_at = CURRENT_TIMESTAMP
      WHERE schedule_id = ?
    `).run(interval, ef, repetition, interval, schedule_id);

    return NextResponse.json({
      success: true,
      schedule_id,
      repetition_interval_days: interval,
      ease_factor: ef,
      streak_count: repetition,
      quality_rated: q
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
