import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const sources = queryAll(`
      SELECT 
        s.source_id,
        s.title,
        s.publisher,
        s.url,
        s.source_tier,
        s.reliability_score,
        s.license_status,
        s.content_type,
        s.verification_status,
        s.last_crawled_at,
        ss.content_hash,
        ss.http_etag,
        ss.http_last_modified
      FROM sources s
      LEFT JOIN source_snapshots ss ON s.source_id = ss.source_id
      ORDER BY s.source_tier ASC, s.last_crawled_at DESC
    `);

    const jobs = queryAll(`
      SELECT job_id, mode, target_url, status, items_crawled, items_quarantined, error_message, started_at, completed_at
      FROM scraping_jobs
      ORDER BY created_at DESC
      LIMIT 20
    `);

    return NextResponse.json({ success: true, sources, jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = body.mode === 'DISCOVERY' ? 'DISCOVERY' : 'TRUSTED';
    const url = body.url ? String(body.url).trim() : null;

    const scraperScript = path.resolve(process.cwd(), 'scripts', 'worker', 'scraper.py');
    let cmd = `python "${scraperScript}" --mode ${mode}`;
    if (url) {
      cmd += ` --url "${url}"`;
    }

    const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
    
    // Parse result from python output
    const match = stdout.match(/--- Worker Result ---\s*([\s\S]*)/);
    let workerResult = null;
    if (match && match[1]) {
      try {
        workerResult = JSON.parse(match[1].trim());
      } catch (e) {
        workerResult = stdout;
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      result: workerResult || stdout
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
