import { NextResponse } from 'next/server';
import path from 'path';
import { queryAll } from '@/lib/db';
import { getExecutiveReadinessReport } from '@/lib/services/readiness';

// Mark route as dynamic to prevent static pre-rendering of database queries
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = getExecutiveReadinessReport();

    // Query backups to fulfill PROJECT.md § Interface Contracts
    let backups: Array<{ id: string; filename: string; size_kb: number; created_at: string }> = [];
    try {
      const rawBackups = queryAll<any>(`
        SELECT backup_id, file_path, file_size_bytes, created_at
        FROM backups
        ORDER BY created_at DESC
        LIMIT 10
      `);
      backups = (rawBackups || []).map((b) => ({
        id: String(b.backup_id),
        filename: b.file_path ? path.basename(b.file_path) : `${b.backup_id}.gz`,
        size_kb: Math.round((Number(b.file_size_bytes) || 0) / 1024),
        created_at: String(b.created_at || '')
      }));
    } catch {
      backups = [];
    }

    const overall = report.performance.overall_score;
    const status: 'OPTIMAL' | 'GOOD' | 'CRITICAL' =
      overall >= 36 ? 'OPTIMAL' : (overall >= 24 ? 'GOOD' : 'CRITICAL');

    const totalAttempts = report.performance.total_attempts;
    const confidence = totalAttempts >= 10 ? 0.95 : (totalAttempts > 0 ? 0.85 : 0.70);

    const formattedRecentAttempts = report.recent_attempts.map((a) => ({
      attempt_id: String(a.attempt_id),
      session_mode: String(a.session_mode),
      calculated_overall_score: Number(a.calculated_overall_score ?? 0),
      speaking_score: Number(a.speaking_score ?? 0),
      writing_score: Number(a.writing_score ?? 0),
      reading_score: Number(a.reading_score ?? 0),
      listening_score: Number(a.listening_score ?? 0),
      total_duration_seconds: Number(a.total_duration_seconds ?? 0),
      readiness_status: String(a.readiness_status ?? 'NEEDS_PRACTICE'),
      completed_at: a.completed_at ? String(a.completed_at) : undefined,
    }));

    return NextResponse.json({
      success: true,
      // Retain root fields for existing UI components (DashboardPage)
      visa_info: report.visa_info,
      performance: report.performance,
      recent_attempts: report.recent_attempts,
      // Conforms strictly to PROJECT.md § Interface Contracts
      data: {
        status,
        confidence,
        metrics: {
          total_exercises: report.performance.total_questions_in_bank,
          responses_evaluated: report.performance.total_responses_submitted,
          schedules_active: report.performance.spaced_repetition_cards_count,
        },
        performance: {
          overall_score: report.performance.overall_score,
          speaking_score: report.performance.speaking_score,
          writing_score: report.performance.writing_score,
          reading_score: report.performance.reading_score,
          listening_score: report.performance.listening_score,
          total_attempts: report.performance.total_attempts,
          total_practice_minutes: report.performance.total_practice_minutes,
        },
        recent_attempts: formattedRecentAttempts,
        backups
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

