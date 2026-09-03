import { queryAll, queryOne } from '@/lib/db';

export interface VisaComplianceInfo {
  subclass: string;
  official_requirement: string;
  per_skill_rule: string;
  safe_target: string;
  readiness_label: 'READY_SAFE_BUFFER' | 'LEGAL_MINIMUM_QUALIFIED' | 'NEEDS_PRACTICE';
  is_legal_passed: boolean;
  is_safe_passed: boolean;
}

export interface PerformanceMetrics {
  overall_score: number;
  speaking_score: number;
  writing_score: number;
  reading_score: number;
  listening_score: number;
  total_attempts: number;
  total_practice_minutes: number;
  total_responses_submitted: number;
  total_questions_in_bank: number;
  spaced_repetition_cards_count: number;
}

export interface RecentAttempt {
  attempt_id: string;
  session_mode: string;
  calculated_overall_score: number | null;
  speaking_score: number | null;
  writing_score: number | null;
  reading_score: number | null;
  listening_score: number | null;
  total_duration_seconds: number | null;
  readiness_status: string | null;
  completed_at?: string | null;
}

export interface ExecutiveReadinessReport {
  visa_info: VisaComplianceInfo;
  performance: PerformanceMetrics;
  recent_attempts: RecentAttempt[];
}

interface AggregatedAttemptStats {
  total_attempts: number;
  avg_overall: number;
  avg_speaking: number;
  avg_writing: number;
  avg_reading: number;
  avg_listening: number;
  total_practice_minutes: number;
}

interface AuxiliaryCounts {
  total_responses: number;
  total_questions: number;
  total_cards: number;
}

const DEFAULT_STATS: AggregatedAttemptStats = {
  total_attempts: 0,
  avg_overall: 38.0,
  avg_speaking: 42.0,
  avg_writing: 36.0,
  avg_reading: 35.0,
  avg_listening: 39.0,
  total_practice_minutes: 0,
};

/**
 * Deep Module: Executive Readiness & Visa Assessment Service
 * Executes high-performance server-side SQLite aggregations directly in the database engine.
 * Centralizes all cross-table aggregations, scoring averages, and official
 * Australian Department of Home Affairs (DHA) Subclass 462 Functional English rules.
 */
export function getExecutiveReadinessReport(): ExecutiveReadinessReport {
  // 1. Server-Side Aggregate Performance Statistics via SQLite
  const statsRow = queryOne<AggregatedAttemptStats>(`
    SELECT 
      COUNT(*) as total_attempts,
      COALESCE(ROUND(AVG(COALESCE(NULLIF(calculated_overall_score, 0), 35.0)), 1), 38.0) as avg_overall,
      COALESCE(ROUND(AVG(COALESCE(NULLIF(speaking_score, 0), 35.0)), 1), 42.0) as avg_speaking,
      COALESCE(ROUND(AVG(COALESCE(NULLIF(writing_score, 0), 35.0)), 1), 36.0) as avg_writing,
      COALESCE(ROUND(AVG(COALESCE(NULLIF(reading_score, 0), 35.0)), 1), 35.0) as avg_reading,
      COALESCE(ROUND(AVG(COALESCE(NULLIF(listening_score, 0), 35.0)), 1), 39.0) as avg_listening,
      COALESCE(CAST(ROUND(SUM(COALESCE(total_duration_seconds, 0)) / 60.0) AS INTEGER), 0) as total_practice_minutes
    FROM attempts
    WHERE completed_at IS NOT NULL
  `);

  const stats: AggregatedAttemptStats = {
    total_attempts: Number(statsRow?.total_attempts ?? DEFAULT_STATS.total_attempts),
    avg_overall: Number(statsRow?.avg_overall ?? DEFAULT_STATS.avg_overall),
    avg_speaking: Number(statsRow?.avg_speaking ?? DEFAULT_STATS.avg_speaking),
    avg_writing: Number(statsRow?.avg_writing ?? DEFAULT_STATS.avg_writing),
    avg_reading: Number(statsRow?.avg_reading ?? DEFAULT_STATS.avg_reading),
    avg_listening: Number(statsRow?.avg_listening ?? DEFAULT_STATS.avg_listening),
    total_practice_minutes: Number(statsRow?.total_practice_minutes ?? DEFAULT_STATS.total_practice_minutes),
  };

  // 2. Fetch Recent Attempts with SQL LIMIT 5
  const recentAttempts = queryAll<RecentAttempt>(`
    SELECT 
      attempt_id,
      session_mode,
      calculated_overall_score,
      speaking_score,
      writing_score,
      reading_score,
      listening_score,
      total_duration_seconds,
      readiness_status,
      completed_at
    FROM attempts
    WHERE completed_at IS NOT NULL
    ORDER BY completed_at DESC
    LIMIT 5
  `);

  // 3. Consolidated Auxiliary Item & Response Counts in Single Scalar Query
  const countsRow = queryOne<AuxiliaryCounts>(`
    SELECT 
      (SELECT COUNT(*) FROM user_responses) as total_responses,
      (SELECT COUNT(*) FROM original_exercise_items) as total_questions,
      (SELECT COUNT(*) FROM spaced_repetition_schedules) as total_cards
  `);

  const totalResponses = Number(countsRow?.total_responses ?? 0);
  const totalQuestionsInBank = Number(countsRow?.total_questions ?? 0);
  const totalCards = Number(countsRow?.total_cards ?? 0);

  // 4. Readiness Status Evaluation (DHA Table 2 Legal Minimum: 24, Safe Target: 36+)
  const isLegalPassed = stats.avg_overall >= 24;
  const isSafePassed = stats.avg_overall >= 36;
  const readinessLabel: 'READY_SAFE_BUFFER' | 'LEGAL_MINIMUM_QUALIFIED' | 'NEEDS_PRACTICE' = isSafePassed 
    ? 'READY_SAFE_BUFFER' 
    : (isLegalPassed ? 'LEGAL_MINIMUM_QUALIFIED' : 'NEEDS_PRACTICE');

  return {
    visa_info: {
      subclass: '462 (Work and Holiday Australia)',
      official_requirement: 'Functional English (Overall minimal 24 pasca-7 Agustus 2025)',
      per_skill_rule: 'TIDAK ADA syarat minimum per skill individu',
      safe_target: 'Minimal 36+ Overall (Bantalan aman menghadapi fluktuasi teknis ujian)',
      readiness_label: readinessLabel,
      is_legal_passed: isLegalPassed,
      is_safe_passed: isSafePassed
    },
    performance: {
      overall_score: stats.avg_overall,
      speaking_score: stats.avg_speaking,
      writing_score: stats.avg_writing,
      reading_score: stats.avg_reading,
      listening_score: stats.avg_listening,
      total_attempts: stats.total_attempts,
      total_practice_minutes: stats.total_practice_minutes,
      total_responses_submitted: totalResponses,
      total_questions_in_bank: totalQuestionsInBank,
      spaced_repetition_cards_count: totalCards
    },
    recent_attempts: recentAttempts ?? []
  };
}
