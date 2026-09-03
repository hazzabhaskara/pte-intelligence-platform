import { getDatabase, queryAll } from '@/lib/db';

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

export interface ExecutiveReadinessReport {
  visa_info: VisaComplianceInfo;
  performance: PerformanceMetrics;
  recent_attempts: any[];
}

/**
 * Deep Module: Executive Readiness & Visa Assessment Service
 * Centralizes all cross-table aggregations, scoring averages, and official
 * Australian Department of Home Affairs (DHA) Subclass 462 Functional English rules.
 */
export function getExecutiveReadinessReport(): ExecutiveReadinessReport {
  const db = getDatabase();

  // 1. Attempts stats
  const attempts = queryAll(`
    SELECT 
      attempt_id,
      session_mode,
      calculated_overall_score,
      speaking_score,
      writing_score,
      reading_score,
      listening_score,
      total_duration_seconds,
      readiness_status
    FROM attempts
    WHERE completed_at IS NOT NULL
    ORDER BY completed_at DESC
  `);

  const totalAttempts = attempts.length;
  let avgOverall = 38.0;
  let avgSpeaking = 42.0;
  let avgWriting = 36.0;
  let avgReading = 35.0;
  let avgListening = 39.0;
  let totalMinutes = 0;

  if (totalAttempts > 0) {
    let sumOverall = 0;
    let sumSpeaking = 0;
    let sumWriting = 0;
    let sumReading = 0;
    let sumListening = 0;
    let sumSeconds = 0;

    attempts.forEach((a: any) => {
      sumOverall += (a.calculated_overall_score || 35);
      sumSpeaking += (a.speaking_score || 35);
      sumWriting += (a.writing_score || 35);
      sumReading += (a.reading_score || 35);
      sumListening += (a.listening_score || 35);
      sumSeconds += (a.total_duration_seconds || 0);
    });

    avgOverall = Math.round((sumOverall / totalAttempts) * 10) / 10;
    avgSpeaking = Math.round((sumSpeaking / totalAttempts) * 10) / 10;
    avgWriting = Math.round((sumWriting / totalAttempts) * 10) / 10;
    avgReading = Math.round((sumReading / totalAttempts) * 10) / 10;
    avgListening = Math.round((sumListening / totalAttempts) * 10) / 10;
    totalMinutes = Math.round(sumSeconds / 60);
  }

  // 2. Questions answered count
  const totalResponsesRow = db.prepare('SELECT count(*) as count FROM user_responses').get() as any;
  const totalResponses = totalResponsesRow ? totalResponsesRow.count : 0;

  // 3. Question bank total items
  const totalQuestionsRow = db.prepare('SELECT count(*) as count FROM original_exercise_items').get() as any;
  const totalQuestionsInBank = totalQuestionsRow ? totalQuestionsRow.count : 0;

  // 4. Spaced repetition cards
  const totalCardsRow = db.prepare('SELECT count(*) as count FROM spaced_repetition_schedules').get() as any;
  const totalCards = totalCardsRow ? totalCardsRow.count : 0;

  // 5. Readiness Status Evaluation (DHA Table 2 Legal Minimum: 24, Safe Target: 36+)
  const isLegalPassed = avgOverall >= 24;
  const isSafePassed = avgOverall >= 36;
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
      overall_score: avgOverall,
      speaking_score: avgSpeaking,
      writing_score: avgWriting,
      reading_score: avgReading,
      listening_score: avgListening,
      total_attempts: totalAttempts,
      total_practice_minutes: totalMinutes,
      total_responses_submitted: totalResponses,
      total_questions_in_bank: totalQuestionsInBank,
      spaced_repetition_cards_count: totalCards
    },
    recent_attempts: attempts.slice(0, 5)
  };
}
