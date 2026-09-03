import { NextResponse } from 'next/server';
import { getDatabase, queryAll } from '@/lib/db';

export async function GET() {
  try {
    const queue = queryAll(`
      SELECT 
        review_id,
        job_id,
        source_url,
        extracted_payload,
        duplicate_similarity,
        copyright_flag,
        confidence_score,
        ai_recommendation,
        review_status,
        reviewed_by,
        reviewed_at,
        created_at
      FROM review_queue
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ success: true, queue });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review_id, action, reviewed_by = 'user' } = body;

    if (!review_id || !action) {
      return NextResponse.json({ success: false, error: 'review_id and action are required' }, { status: 400 });
    }

    const validActions = ['APPROVED', 'REJECTED', 'FLAGGED', 'PENDING'];
    const targetStatus = action.toUpperCase();
    if (!validActions.includes(targetStatus)) {
      return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }

    const db = getDatabase();

    // Fetch review item
    const item = db.prepare('SELECT * FROM review_queue WHERE review_id = ?').get(review_id) as any;
    if (!item) {
      return NextResponse.json({ success: false, error: 'Review item not found' }, { status: 404 });
    }

    // Update status
    db.prepare(`
      UPDATE review_queue 
      SET review_status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE review_id = ?
    `).run(targetStatus, reviewed_by, review_id);

    // If APPROVED, promote into sources and source_snapshots
    if (targetStatus === 'APPROVED') {
      let payload = { title: item.source_url, text_excerpt: '', sha256: '' };
      try {
        payload = JSON.parse(item.extracted_payload);
      } catch (e) {}

      const sourceId = `SRC-COMM-${review_id.replace('REV-', '')}`;
      db.prepare(`
        INSERT OR REPLACE INTO sources 
        (source_id, title, publisher, url, source_tier, reliability_score, license_status, content_type, verification_status, last_crawled_at)
        VALUES (?, ?, 'Approved External Contributor', ?, 'Tier 3', 0.75, 'Community Educational Reference', 'Study Material', 'APPROVED_COMMUNITY', CURRENT_TIMESTAMP)
      `).run(sourceId, payload.title || item.source_url, item.source_url);

      const snapshotId = `SNAP-${review_id.replace('REV-', '')}`;
      db.prepare(`
        INSERT OR REPLACE INTO source_snapshots
        (snapshot_id, source_id, content_hash, extracted_text)
        VALUES (?, ?, ?, ?)
      `).run(snapshotId, sourceId, `sha256:${payload.sha256 || 'unknown'}`, payload.text_excerpt || '');
    }

    return NextResponse.json({ success: true, review_id, new_status: targetStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
