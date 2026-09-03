import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeCode = searchParams.get('type');
    const section = searchParams.get('section');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let sql = `
      SELECT 
        oei.item_id,
        oei.blueprint_id,
        oei.type_code,
        qt.name as type_name,
        CASE qt.part_section
          WHEN 'PART_1' THEN 'Speaking & Writing'
          WHEN 'PART_2' THEN 'Reading'
          WHEN 'PART_3' THEN 'Listening'
          ELSE qt.part_section
        END as section,
        oei.prompt_text,
        oei.cefr_level,
        oei.difficulty_level,
        oei.estimated_time_seconds,
        oei.uniqueness_hash,
        oei.copyright_status,
        oei.approval_status,
        oei.generation_model,
        oei.created_at,
        ak.accepted_canonical_text,
        ak.alternate_spellings
      FROM original_exercise_items oei
      JOIN question_types qt ON oei.type_code = qt.type_code
      LEFT JOIN answer_keys ak ON oei.item_id = ak.item_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (typeCode && typeCode !== 'ALL') {
      sql += ` AND oei.type_code = ?`;
      params.push(typeCode);
    }
    if (section && section !== 'ALL') {
      const partMap: Record<string, string> = {
        'Speaking & Writing': 'PART_1',
        'Reading': 'PART_2',
        'Listening': 'PART_3'
      };
      if (partMap[section]) {
        sql += ` AND qt.part_section = ?`;
        params.push(partMap[section]);
      }
    }

    sql += ` ORDER BY oei.created_at DESC LIMIT ?`;
    params.push(limit);

    const questions = queryAll(sql, params);

    return NextResponse.json({ success: true, count: questions.length, questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const typeCode = body.type_code || 'RA';
    const topic = body.topic ? String(body.topic).trim() : null;
    const forceDeterministic = body.force_deterministic ? '--force-deterministic' : '';

    const generatorScript = path.resolve(process.cwd(), 'scripts', 'worker', 'question_generator.py');
    let cmd = `python "${generatorScript}" --type "${typeCode}" ${forceDeterministic}`;
    if (topic) {
      cmd += ` --topic "${topic}"`;
    }

    const { stdout, stderr } = await execAsync(cmd, { timeout: 35000 });

    const match = stdout.match(/--- Generated Item ---\s*([\s\S]*)/);
    let itemData = null;
    if (match && match[1]) {
      try {
        itemData = JSON.parse(match[1].trim());
      } catch (e) {
        itemData = stdout;
      }
    }

    return NextResponse.json({
      success: true,
      item: itemData || { raw: stdout }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
