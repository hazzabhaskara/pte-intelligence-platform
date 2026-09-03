import { getDatabase, queryAll, queryOne } from '@/lib/db';
import crypto from 'crypto';

export interface CreateSessionOptions {
  session_mode?: 'DRILL' | 'SECTION_TEST' | 'FULL_MOCK';
  type_code?: string;
  section?: string;
}

export interface RecordResponseOptions {
  attempt_id: string;
  item_id: string;
  submitted_text?: string;
  recorded_audio_path?: string | null;
  time_spent_seconds?: number;
}

export interface FinishSessionOptions {
  attempt_id: string;
  total_duration_seconds: number;
}

export interface SessionQuestion {
  item_id: string;
  type_code: string;
  type_name: string;
  section: string;
  prompt_text: string;
  cefr_level: string;
  estimated_time_seconds: number;
  default_prep_seconds: number;
  default_response_seconds: number;
  min_word_limit: number | null;
  max_word_limit: number | null;
  accepted_canonical_text: string | null;
}

/**
 * Deep Module: Practice Session Service
 * Encapsulates session lifecycles, question sequencing, ACID database persistence,
 * response recording, and scoring aggregation.
 */
export const practiceSessionService = {
  /**
   * Creates a new attempt session and retrieves the sequenced questions.
   */
  createSession(options: CreateSessionOptions): { attempt_id: string; mode: string; questions: SessionQuestion[] } {
    const db = getDatabase();
    const mode = options.session_mode || 'DRILL';
    const attemptId = `ATT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    db.prepare(`
      INSERT INTO attempts (attempt_id, session_mode, started_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(attemptId, mode);

    // Build question query based on test mode
    let questionsQuery = `
      SELECT 
        oei.item_id,
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
        oei.estimated_time_seconds,
        qt.default_prep_seconds,
        qt.default_response_seconds,
        qt.min_word_limit,
        qt.max_word_limit,
        ak.accepted_canonical_text
      FROM original_exercise_items oei
      JOIN question_types qt ON oei.type_code = qt.type_code
      LEFT JOIN answer_keys ak ON oei.item_id = ak.item_id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (mode === 'DRILL' && options.type_code) {
      conditions.push(`oei.type_code = ?`);
      params.push(options.type_code.toUpperCase());
    } else if (mode === 'SECTION_TEST' && options.section) {
      conditions.push(`qt.part_section = ?`);
      params.push(options.section);
    }

    if (conditions.length > 0) {
      questionsQuery += ` WHERE ` + conditions.join(' AND ');
    }

    // Limit questions based on mode with random distribution
    if (mode === 'DRILL') {
      questionsQuery += ` ORDER BY RANDOM() LIMIT 5`;
    } else if (mode === 'SECTION_TEST') {
      questionsQuery += ` ORDER BY RANDOM() LIMIT 10`;
    } else {
      // FULL_MOCK
      questionsQuery += ` ORDER BY RANDOM() LIMIT 20`;
    }

    let questions = queryAll<SessionQuestion>(questionsQuery, params);

    // If no questions match specific filter, fallback to any available questions
    if (questions.length === 0) {
      const fallbackQuery = `
        SELECT 
          oei.item_id,
          oei.type_code,
          qt.name as type_name,
          'Practice Section' as section,
          oei.prompt_text,
          oei.cefr_level,
          oei.estimated_time_seconds,
          qt.default_prep_seconds,
          qt.default_response_seconds,
          qt.min_word_limit,
          qt.max_word_limit,
          ak.accepted_canonical_text
        FROM original_exercise_items oei
        JOIN question_types qt ON oei.type_code = qt.type_code
        LEFT JOIN answer_keys ak ON oei.item_id = ak.item_id
        LIMIT 5
      `;
      questions = queryAll<SessionQuestion>(fallbackQuery);
    }

    return {
      attempt_id: attemptId,
      mode,
      questions
    };
  },

  /**
   * Records a user's response to a specific question item in an attempt.
   */
  recordResponse(options: RecordResponseOptions): { response_id: string; attempt_id: string; item_id: string } {
    const db = getDatabase();
    const responseId = `RESP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    db.prepare(`
      INSERT INTO user_responses (
        response_id, attempt_id, item_id, submitted_text,
        recorded_audio_path, time_spent_seconds, response_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      responseId,
      options.attempt_id,
      options.item_id,
      options.submitted_text || '',
      options.recorded_audio_path || null,
      options.time_spent_seconds || 0
    );

    return {
      response_id: responseId,
      attempt_id: options.attempt_id,
      item_id: options.item_id
    };
  },

  /**
   * Concludes an attempt session, computes score and readiness status, and updates the database.
   */
  finishSession(options: FinishSessionOptions): {
    attempt_id: string;
    calculated_overall_score: number;
    speaking_score: number;
    writing_score: number;
    reading_score: number;
    listening_score: number;
    readiness_status: string;
    response_count: number;
    completed_at: string;
  } {
    const db = getDatabase();

    // Check existing attempt
    const attempt = queryOne<any>(`SELECT * FROM attempts WHERE attempt_id = ?`, [options.attempt_id]);
    if (!attempt) {
      throw new Error(`Attempt ${options.attempt_id} not found.`);
    }

    // Count user responses
    const countRow = db.prepare('SELECT count(*) as count FROM user_responses WHERE attempt_id = ?').get(options.attempt_id) as any;
    const responseCount = countRow ? countRow.count : 0;

    // Provisional scoring calculation
    const estimatedScore = responseCount > 0 ? Math.min(90, Math.max(24, 32 + (responseCount * 1.5))) : 0;
    const readinessStatus = estimatedScore >= 36 ? 'ON_TRACK_SAFE' : (estimatedScore >= 24 ? 'LEGAL_MINIMUM_REACHED' : 'NEEDS_PRACTICE');

    db.prepare(`
      UPDATE attempts
      SET 
        completed_at = CURRENT_TIMESTAMP,
        total_duration_seconds = ?,
        calculated_overall_score = ?,
        speaking_score = ?,
        writing_score = ?,
        reading_score = ?,
        listening_score = ?,
        readiness_status = ?
      WHERE attempt_id = ?
    `).run(
      options.total_duration_seconds,
      estimatedScore,
      estimatedScore,
      estimatedScore,
      estimatedScore,
      estimatedScore,
      readinessStatus,
      options.attempt_id
    );

    return {
      attempt_id: options.attempt_id,
      calculated_overall_score: estimatedScore,
      speaking_score: estimatedScore,
      writing_score: estimatedScore,
      reading_score: estimatedScore,
      listening_score: estimatedScore,
      readiness_status: readinessStatus,
      response_count: responseCount,
      completed_at: new Date().toISOString()
    };
  },

  /**
   * Retrieves recent attempt sessions with response counts.
   */
  listRecentSessions(limit: number = 20): any[] {
    return queryAll(`
      SELECT 
        a.attempt_id,
        a.session_mode,
        a.started_at,
        a.completed_at,
        a.total_duration_seconds,
        a.calculated_overall_score,
        a.speaking_score,
        a.writing_score,
        a.reading_score,
        a.listening_score,
        a.readiness_status,
        COUNT(ur.response_id) as response_count
      FROM attempts a
      LEFT JOIN user_responses ur ON a.attempt_id = ur.attempt_id
      GROUP BY a.attempt_id
      ORDER BY a.started_at DESC
      LIMIT ?
    `, [limit]);
  },

  /**
   * Retrieves attempt details by attempt ID.
   */
  getAttemptDetails(attemptId: string): any {
    const attempt = queryOne(`SELECT * FROM attempts WHERE attempt_id = ?`, [attemptId]);
    if (!attempt) return null;

    const responses = queryAll(`
      SELECT 
        ur.*,
        oei.prompt_text,
        oei.type_code,
        ae.item_score,
        ae.max_possible_score
      FROM user_responses ur
      JOIN original_exercise_items oei ON ur.item_id = oei.item_id
      LEFT JOIN ai_evaluations ae ON ur.response_id = ae.response_id
      WHERE ur.attempt_id = ?
    `, [attemptId]);

    return {
      ...attempt,
      responses
    };
  },

  /**
   * Retrieves a single random practice item, optionally filtered by type_code
   * and excluding a specific item_id (so the user gets a fresh question when shuffling).
   */
  getRandomItem(typeCode?: string, excludeItemId?: string): SessionQuestion | null {
    let query = `
      SELECT 
        oei.item_id,
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
        oei.estimated_time_seconds,
        qt.default_prep_seconds,
        qt.default_response_seconds,
        qt.min_word_limit,
        qt.max_word_limit,
        ak.accepted_canonical_text
      FROM original_exercise_items oei
      JOIN question_types qt ON oei.type_code = qt.type_code
      LEFT JOIN answer_keys ak ON oei.item_id = ak.item_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (typeCode) {
      conditions.push(`oei.type_code = ?`);
      params.push(typeCode.toUpperCase());
    }
    if (excludeItemId) {
      conditions.push(`oei.item_id != ?`);
      params.push(excludeItemId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY RANDOM() LIMIT 1`;
    return queryOne<SessionQuestion>(query, params) || null;
  },

  /**
   * Retrieves the question count breakdown per type code.
   */
  getBankCounts(): Record<string, number> {
    const rows = queryAll<{ type_code: string; count: number }>(`
      SELECT type_code, count(*) as count
      FROM original_exercise_items
      GROUP BY type_code
    `);
    const map: Record<string, number> = {};
    rows.forEach(r => { map[r.type_code] = r.count; });
    return map;
  }
};
