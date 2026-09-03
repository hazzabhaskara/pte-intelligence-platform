import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

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
        ss.extracted_metadata
      FROM sources s
      LEFT JOIN source_snapshots ss ON s.source_id = ss.source_id
      ORDER BY s.source_tier ASC, s.title ASC
    `);

    const claims = queryAll(`
      SELECT 
        c.claim_id,
        c.source_snapshot_id,
        c.claim_text,
        c.domain_topic,
        c.classification,
        c.authority_reference,
        c.remediation_action,
        c.verified_at
      FROM claims c
      ORDER BY c.claim_id ASC
    `);

    return NextResponse.json({
      success: true,
      sources,
      claims
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Database query error'
    }, { status: 500 });
  }
}
