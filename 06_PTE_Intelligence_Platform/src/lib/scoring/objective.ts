import { getDatabase } from '@/lib/db';
import crypto from 'crypto';

/**
 * Pure TypeScript Objective Scoring Engine for Next.js.
 * Implements deterministic Pearson scoring rubrics:
 * 1. FIB: +1 per blank (case/punctuation normalized)
 * 2. Negative Marking: +1 correct, -1 incorrect, floored at 0
 * 3. Re-order Paragraphs: +1 per contiguous adjacent pair
 * 4. Write From Dictation: +1 per correct word
 * 5. Single Choice: Binary 1 or 0
 */

export function normalizeText(text: string): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
}

export interface FibResult {
  scoring_rule: string;
  raw_score: number;
  max_score: number;
  percentage: number;
  breakdown: Array<{
    blank_index: number;
    user_input: string;
    canonical: string;
    is_correct: boolean;
    points: number;
  }>;
}

export function scoreFib(userAnswers: string[], canonicalAnswers: string[]): FibResult {
  const maxScore = canonicalAnswers.length;
  let rawScore = 0;
  const breakdown = [];

  for (let i = 0; i < maxScore; i++) {
    const userVal = normalizeText(userAnswers[i] || '');
    const canonicalVal = normalizeText(canonicalAnswers[i] || '');
    const isCorrect = userVal === canonicalVal;
    if (isCorrect) rawScore += 1;

    breakdown.push({
      blank_index: i + 1,
      user_input: userVal,
      canonical: canonicalVal,
      is_correct: isCorrect,
      points: isCorrect ? 1 : 0
    });
  }

  return {
    scoring_rule: 'PARTIAL_CREDIT_PER_BLANK',
    raw_score: rawScore,
    max_score: maxScore,
    percentage: maxScore > 0 ? Math.round((rawScore / maxScore) * 1000) / 10 : 0,
    breakdown
  };
}

export interface NegativeMarkingResult {
  scoring_rule: string;
  raw_score: number;
  max_score: number;
  correct_count: number;
  incorrect_count: number;
  unfloored_calculation: number;
  floor_applied: boolean;
  percentage: number;
}

export function scoreNegativeMarking(userSelected: string[], correctOptions: string[]): NegativeMarkingResult {
  const normUser = new Set(userSelected.map(normalizeText).filter(Boolean));
  const normCorrect = new Set(correctOptions.map(normalizeText).filter(Boolean));

  let correctCount = 0;
  let incorrectCount = 0;

  normUser.forEach((pick) => {
    if (normCorrect.has(pick)) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  });

  const unfloored = correctCount - incorrectCount;
  const rawScore = Math.max(0, unfloored);
  const maxScore = normCorrect.size;

  return {
    scoring_rule: 'NEGATIVE_MARKING_FLOORED_AT_ZERO',
    raw_score: rawScore,
    max_score: maxScore,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    unfloored_calculation: unfloored,
    floor_applied: unfloored < 0,
    percentage: maxScore > 0 ? Math.round((rawScore / maxScore) * 1000) / 10 : 0
  };
}

export interface ReorderResult {
  scoring_rule: string;
  raw_score: number;
  max_score: number;
  matched_pairs: string[];
  unmatched_pairs: string[];
  percentage: number;
}

export function scoreReorder(userOrder: string[], canonicalOrder: string[]): ReorderResult {
  if (canonicalOrder.length < 2) {
    return { scoring_rule: 'ADJACENT_PAIR_MATCHING', raw_score: 0, max_score: 0, matched_pairs: [], unmatched_pairs: [], percentage: 0 };
  }

  const canonicalPairs = new Set<string>();
  for (let i = 0; i < canonicalOrder.length - 1; i++) {
    canonicalPairs.add(`${normalizeText(canonicalOrder[i])} -> ${normalizeText(canonicalOrder[i + 1])}`);
  }

  const userPairs: string[] = [];
  for (let i = 0; i < userOrder.length - 1; i++) {
    userPairs.push(`${normalizeText(userOrder[i])} -> ${normalizeText(userOrder[i + 1])}`);
  }

  const matchedPairs: string[] = [];
  const unmatchedPairs: string[] = [];

  userPairs.forEach((pair) => {
    if (canonicalPairs.has(pair)) {
      matchedPairs.push(pair);
    } else {
      unmatchedPairs.push(pair);
    }
  });

  const rawScore = matchedPairs.length;
  const maxScore = canonicalPairs.size;

  return {
    scoring_rule: 'ADJACENT_PAIR_MATCHING',
    raw_score: rawScore,
    max_score: maxScore,
    matched_pairs: matchedPairs,
    unmatched_pairs: unmatchedPairs,
    percentage: maxScore > 0 ? Math.round((rawScore / maxScore) * 1000) / 10 : 0
  };
}

export interface WfdResult {
  scoring_rule: string;
  raw_score: number;
  max_score: number;
  matched_words: string[];
  missing_words: string[];
  extra_words: string[];
  percentage: number;
}

export function scoreWfd(userSentence: string, canonicalSentence: string): WfdResult {
  const tokenize = (s: string) => s.trim().split(/\s+/).map(normalizeText).filter(Boolean);

  const userTokens = tokenize(userSentence);
  const canonicalTokens = tokenize(canonicalSentence);

  const userPool = [...userTokens];
  const matchedWords: string[] = [];
  const missingWords: string[] = [];

  canonicalTokens.forEach((word) => {
    const idx = userPool.indexOf(word);
    if (idx !== -1) {
      matchedWords.push(word);
      userPool.splice(idx, 1);
    } else {
      missingWords.push(word);
    }
  });

  const rawScore = matchedWords.length;
  const maxScore = canonicalTokens.length;

  return {
    scoring_rule: 'PARTIAL_CREDIT_PER_WORD',
    raw_score: rawScore,
    max_score: maxScore,
    matched_words: matchedWords,
    missing_words: missingWords,
    extra_words: userPool,
    percentage: maxScore > 0 ? Math.round((rawScore / maxScore) * 1000) / 10 : 0
  };
}

export interface EvaluateObjectiveInput {
  type_code: string;
  user_submission: any;
  canonical_data: any;
  response_id?: string | null;
}

export interface ObjectiveScoreSummary {
  scoring_rule: string;
  raw_score: number;
  max_score: number;
  percentage: number;
  eval_id: string | null;
  breakdown?: any;
}

/**
 * Deep Module Interface: Evaluates any objective question response,
 * normalizes formats, routes to the appropriate rubric, and persists to DB if needed.
 */
export function evaluateObjective(input: EvaluateObjectiveInput): ObjectiveScoreSummary {
  const { type_code, user_submission, canonical_data, response_id = null } = input;
  const tc = String(type_code || '').toUpperCase();
  let result: any = null;

  if (['R_FIB', 'L_FIB', 'RW_FIB'].includes(tc)) {
    const userList = Array.isArray(user_submission) ? user_submission : [user_submission];
    const canonList = Array.isArray(canonical_data) ? canonical_data : [canonical_data];
    result = scoreFib(userList, canonList);
  } else if (['R_MCM', 'L_MCM', 'HIW'].includes(tc)) {
    const userList = Array.isArray(user_submission) ? user_submission : [user_submission];
    const canonList = Array.isArray(canonical_data) ? canonical_data : [canonical_data];
    result = scoreNegativeMarking(userList, canonList);
  } else if (tc === 'RO') {
    const userList = Array.isArray(user_submission) ? user_submission : [user_submission];
    const canonList = Array.isArray(canonical_data) ? canonical_data : [canonical_data];
    result = scoreReorder(userList, canonList);
  } else if (tc === 'WFD') {
    result = scoreWfd(String(user_submission || ''), String(canonical_data || ''));
  } else {
    // Default single choice / binary comparison
    const isMatch = String(user_submission || '').trim().toLowerCase() === String(canonical_data || '').trim().toLowerCase();
    result = {
      scoring_rule: 'BINARY_SINGLE_CHOICE',
      raw_score: isMatch ? 1 : 0,
      max_score: 1,
      percentage: isMatch ? 100 : 0
    };
  }

  // Persist into ai_evaluations if response_id is supplied
  let evalId: string | null = null;
  if (response_id) {
    try {
      const db = getDatabase();
      evalId = `EVAL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const feedbackText = `Scoring rule: ${result.scoring_rule}. Score: ${result.raw_score} / ${result.max_score} (${result.percentage}%).`;

      db.prepare(`
        INSERT INTO ai_evaluations (
          eval_id, response_id, item_score, max_possible_score, breakdown_json,
          structured_feedback_id, confidence_rating, template_detection_flag, evaluated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1.0, 0, CURRENT_TIMESTAMP)
      `).run(
        evalId,
        response_id,
        result.raw_score,
        result.max_score,
        JSON.stringify(result),
        feedbackText
      );
    } catch (dbErr) {
      console.error('Error persisting evaluation:', dbErr);
    }
  }

  return {
    scoring_rule: result.scoring_rule,
    raw_score: result.raw_score,
    max_score: result.max_score,
    percentage: result.percentage,
    eval_id: evalId,
    breakdown: result
  };
}

