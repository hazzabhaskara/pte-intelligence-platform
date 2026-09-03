import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const blueprints = queryAll(`
      SELECT 
        qb.blueprint_id,
        qb.type_code,
        qt.name as type_name,
        CASE qt.part_section
          WHEN 'PART_1' THEN 'Speaking & Writing'
          WHEN 'PART_2' THEN 'Reading'
          WHEN 'PART_3' THEN 'Listening'
          ELSE qt.part_section
        END as section,
        qt.primary_skill as target_skills,
        qb.target_difficulty,
        qb.prompt_structural_pattern,
        qb.grammatical_focus,
        qb.distractor_generation_rules,
        qb.audio_requirements,
        qb.created_at
      FROM question_blueprints qb
      JOIN question_types qt ON qb.type_code = qt.type_code
      ORDER BY qt.part_section ASC, qb.type_code ASC
    `);

    return NextResponse.json({ success: true, blueprints });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
