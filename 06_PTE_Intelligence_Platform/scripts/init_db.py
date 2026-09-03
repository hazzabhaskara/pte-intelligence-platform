#!/usr/bin/env python3
"""
Initialize SQLite Database with Complete 30-Table Schema and Essential Seed Data.
Target: data/app_storage.sqlite3
"""

import os
import sqlite3
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"

SCHEMA_SQL = """
-- 1. SOURCE
CREATE TABLE IF NOT EXISTS sources (
    source_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publisher VARCHAR(128) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_tier VARCHAR(16) NOT NULL CHECK(source_tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
    reliability_score REAL NOT NULL CHECK(reliability_score BETWEEN 0.0 AND 1.0),
    license_status VARCHAR(64) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    last_crawled_at TIMESTAMP,
    next_crawl_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SOURCE_SNAPSHOT
CREATE TABLE IF NOT EXISTS source_snapshots (
    snapshot_id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL REFERENCES sources(source_id) ON DELETE CASCADE,
    content_hash VARCHAR(64) NOT NULL,
    http_etag VARCHAR(128),
    http_last_modified VARCHAR(128),
    extracted_text TEXT,
    extracted_metadata JSON,
    raw_payload_path TEXT,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLAIM
CREATE TABLE IF NOT EXISTS claims (
    claim_id VARCHAR(64) PRIMARY KEY,
    source_snapshot_id VARCHAR(64) REFERENCES source_snapshots(snapshot_id) ON DELETE SET NULL,
    claim_text TEXT NOT NULL,
    domain_topic VARCHAR(64) NOT NULL,
    classification VARCHAR(32) NOT NULL,
    authority_reference TEXT,
    remediation_action TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SCRAPING_JOB
CREATE TABLE IF NOT EXISTS scraping_jobs (
    job_id VARCHAR(64) PRIMARY KEY,
    mode VARCHAR(16) NOT NULL CHECK(mode IN ('TRUSTED', 'DISCOVERY')),
    target_url TEXT NOT NULL,
    status VARCHAR(32) NOT NULL CHECK(status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED', 'QUARANTINED')),
    items_crawled INTEGER DEFAULT 0,
    items_quarantined INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. REVIEW_QUEUE
CREATE TABLE IF NOT EXISTS review_queue (
    review_id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) REFERENCES scraping_jobs(job_id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    extracted_payload JSON NOT NULL,
    duplicate_similarity REAL DEFAULT 0.0,
    copyright_flag BOOLEAN DEFAULT FALSE,
    confidence_score REAL DEFAULT 0.0,
    ai_recommendation VARCHAR(16) CHECK(ai_recommendation IN ('APPROVE', 'EDIT', 'REJECT', 'FLAG')),
    review_status VARCHAR(16) DEFAULT 'PENDING' CHECK(review_status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')),
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. PTE_SPECIFICATION_VERSION
CREATE TABLE IF NOT EXISTS pte_specification_versions (
    spec_version VARCHAR(32) PRIMARY KEY,
    effective_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    statutory_functional_score INTEGER NOT NULL,
    safe_target_score INTEGER NOT NULL DEFAULT 36,
    total_parts INTEGER NOT NULL DEFAULT 3,
    total_question_types INTEGER NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SKILL_SUBSKILL
CREATE TABLE IF NOT EXISTS skills_subskills (
    subskill_id VARCHAR(64) PRIMARY KEY,
    parent_skill VARCHAR(16) NOT NULL CHECK(parent_skill IN ('Speaking', 'Writing', 'Reading', 'Listening')),
    subskill_name VARCHAR(64) NOT NULL,
    description TEXT,
    gse_benchmark_range VARCHAR(32)
);

-- 8. QUESTION_TYPE
CREATE TABLE IF NOT EXISTS question_types (
    type_code VARCHAR(16) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    part_section VARCHAR(16) NOT NULL CHECK(part_section IN ('PART_1', 'PART_2', 'PART_3')),
    primary_skill VARCHAR(16) NOT NULL,
    cross_scoring_skill VARCHAR(16),
    scoring_mode VARCHAR(16) NOT NULL CHECK(scoring_mode IN ('PARTIAL_CREDIT', 'NEGATIVE_MARKING', 'BINARY')),
    default_prep_seconds INTEGER DEFAULT 0,
    default_response_seconds INTEGER NOT NULL,
    timer_type VARCHAR(16) NOT NULL CHECK(timer_type IN ('ITEM_INDEPENDENT', 'SECTION_SHARED')),
    template_risk_level VARCHAR(16) NOT NULL CHECK(template_risk_level IN ('NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    min_word_limit INTEGER,
    max_word_limit INTEGER,
    is_post_aug_2025_new BOOLEAN DEFAULT FALSE
);

-- 9. TOPIC
CREATE TABLE IF NOT EXISTS topics (
    topic_id VARCHAR(64) PRIMARY KEY,
    broad_domain VARCHAR(64) NOT NULL,
    topic_title VARCHAR(128) NOT NULL,
    vocabulary_collocations JSON,
    australia_practical_flag BOOLEAN DEFAULT FALSE
);

-- 10. DIFFICULTY
CREATE TABLE IF NOT EXISTS difficulty_levels (
    difficulty_id VARCHAR(16) PRIMARY KEY,
    gse_min INTEGER NOT NULL,
    gse_max INTEGER NOT NULL,
    wpm_speed_range VARCHAR(32),
    lexical_complexity_tier VARCHAR(16)
);

-- 11. CEFR_MAPPING
CREATE TABLE IF NOT EXISTS cefr_mappings (
    cefr_code VARCHAR(8) PRIMARY KEY,
    gse_equivalent_min INTEGER NOT NULL,
    gse_equivalent_max INTEGER NOT NULL,
    whv_readiness_status VARCHAR(32) NOT NULL
);

-- 12. TARGET_SCORE
CREATE TABLE IF NOT EXISTS target_scores (
    target_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    overall_min INTEGER NOT NULL,
    purpose_description TEXT NOT NULL
);

-- 13. QUESTION_BLUEPRINT
CREATE TABLE IF NOT EXISTS question_blueprints (
    blueprint_id VARCHAR(64) PRIMARY KEY,
    type_code VARCHAR(16) NOT NULL REFERENCES question_types(type_code),
    topic_id VARCHAR(64) REFERENCES topics(topic_id),
    target_difficulty VARCHAR(16) REFERENCES difficulty_levels(difficulty_id),
    prompt_structural_pattern TEXT NOT NULL,
    grammatical_focus TEXT,
    distractor_generation_rules JSON,
    audio_requirements JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. ORIGINAL_EXERCISE_ITEM
CREATE TABLE IF NOT EXISTS original_exercise_items (
    item_id VARCHAR(64) PRIMARY KEY,
    blueprint_id VARCHAR(64) REFERENCES question_blueprints(blueprint_id),
    type_code VARCHAR(16) NOT NULL REFERENCES question_types(type_code),
    prompt_text TEXT NOT NULL,
    prompt_image_path TEXT,
    prompt_audio_path TEXT,
    transcript_reference TEXT,
    cefr_level VARCHAR(8) REFERENCES cefr_mappings(cefr_code),
    difficulty_level VARCHAR(16) REFERENCES difficulty_levels(difficulty_id),
    estimated_time_seconds INTEGER NOT NULL,
    uniqueness_hash VARCHAR(64) NOT NULL,
    copyright_status VARCHAR(32) DEFAULT 'ORIGINAL_AI_SYNTHESIZED',
    approval_status VARCHAR(16) DEFAULT 'DRAFT' CHECK(approval_status IN ('DRAFT', 'APPROVED', 'REJECTED', 'FLAGGED')),
    generation_model VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. EXERCISE_VARIANT
CREATE TABLE IF NOT EXISTS exercise_variants (
    variant_id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES original_exercise_items(item_id) ON DELETE CASCADE,
    variant_label VARCHAR(32) NOT NULL,
    prompt_variation_text TEXT,
    audio_asset_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. ANSWER_KEY
CREATE TABLE IF NOT EXISTS answer_keys (
    key_id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES original_exercise_items(item_id) ON DELETE CASCADE,
    accepted_canonical_text TEXT NOT NULL,
    alternate_spellings JSON,
    key_order INTEGER DEFAULT 1,
    points_weight REAL DEFAULT 1.0
);

-- 17. DISTRACTOR
CREATE TABLE IF NOT EXISTS distractors (
    distractor_id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES original_exercise_items(item_id) ON DELETE CASCADE,
    distractor_text TEXT NOT NULL,
    distractor_archetype VARCHAR(32),
    penalty_weight REAL DEFAULT 1.0
);

-- 18. RUBRIC
CREATE TABLE IF NOT EXISTS rubrics (
    rubric_id VARCHAR(64) PRIMARY KEY,
    type_code VARCHAR(16) NOT NULL REFERENCES question_types(type_code),
    metric_name VARCHAR(64) NOT NULL,
    max_score INTEGER NOT NULL,
    criteria_definitions JSON NOT NULL,
    zero_score_triggers JSON
);

-- 19. ACCENT_AUDIO_METADATA
CREATE TABLE IF NOT EXISTS accent_audio_metadata (
    audio_id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) REFERENCES original_exercise_items(item_id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    accent_variety VARCHAR(16) NOT NULL CHECK(accent_variety IN ('AUSTRALIAN', 'BRITISH', 'AMERICAN', 'INTERNATIONAL')),
    speaker_gender VARCHAR(8) CHECK(speaker_gender IN ('MALE', 'FEMALE', 'MULTI')),
    words_per_minute REAL,
    audio_sample_rate INTEGER DEFAULT 16000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. ATTEMPT
CREATE TABLE IF NOT EXISTS attempts (
    attempt_id VARCHAR(64) PRIMARY KEY,
    session_mode VARCHAR(16) NOT NULL CHECK(session_mode IN ('DRILL', 'SECTION_TEST', 'FULL_MOCK')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_duration_seconds INTEGER,
    calculated_overall_score REAL,
    speaking_score REAL,
    writing_score REAL,
    reading_score REAL,
    listening_score REAL,
    confidence_interval_min REAL,
    confidence_interval_max REAL,
    readiness_status VARCHAR(32)
);

-- 21. USER_RESPONSE
CREATE TABLE IF NOT EXISTS user_responses (
    response_id VARCHAR(64) PRIMARY KEY,
    attempt_id VARCHAR(64) NOT NULL REFERENCES attempts(attempt_id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES original_exercise_items(item_id),
    recorded_audio_path TEXT,
    submitted_text TEXT,
    time_spent_seconds REAL NOT NULL,
    response_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. TRANSCRIPT
CREATE TABLE IF NOT EXISTS transcripts (
    transcript_id VARCHAR(64) PRIMARY KEY,
    response_id VARCHAR(64) NOT NULL REFERENCES user_responses(response_id) ON DELETE CASCADE,
    full_transcript_text TEXT NOT NULL,
    word_timestamps JSON NOT NULL,
    pause_events JSON,
    calculated_wpm REAL,
    stt_model_used VARCHAR(32) NOT NULL
);

-- 23. AI_EVALUATION
CREATE TABLE IF NOT EXISTS ai_evaluations (
    eval_id VARCHAR(64) PRIMARY KEY,
    response_id VARCHAR(64) NOT NULL REFERENCES user_responses(response_id) ON DELETE CASCADE,
    item_score REAL NOT NULL,
    max_possible_score REAL NOT NULL,
    breakdown_json JSON NOT NULL,
    structured_feedback_id TEXT NOT NULL,
    confidence_rating REAL NOT NULL,
    template_detection_flag BOOLEAN DEFAULT FALSE,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. ERROR_EVENT
CREATE TABLE IF NOT EXISTS error_events (
    error_id VARCHAR(64) PRIMARY KEY,
    response_id VARCHAR(64) REFERENCES user_responses(response_id) ON DELETE CASCADE,
    error_type VARCHAR(32) NOT NULL,
    detected_token VARCHAR(64),
    suggested_correction VARCHAR(64),
    remedial_drill_recommended VARCHAR(64)
);

-- 25. OFFICIAL_SCORE_REPORT
CREATE TABLE IF NOT EXISTS official_score_reports (
    report_id VARCHAR(64) PRIMARY KEY,
    report_date DATE NOT NULL,
    overall_score INTEGER NOT NULL,
    speaking_score INTEGER NOT NULL,
    writing_score INTEGER NOT NULL,
    reading_score INTEGER NOT NULL,
    listening_score INTEGER NOT NULL,
    verified_document_path TEXT,
    personal_bias_offset REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 26. STUDY_PLAN
CREATE TABLE IF NOT EXISTS study_plans (
    plan_id VARCHAR(64) PRIMARY KEY,
    track_type VARCHAR(16) NOT NULL CHECK(track_type IN ('PTE_ACADEMIC', 'AUSTRALIA_PRACTICAL')),
    duration_weeks INTEGER NOT NULL CHECK(duration_weeks IN (2, 4, 8, 12)),
    daily_allocated_minutes INTEGER NOT NULL DEFAULT 60,
    exam_target_date DATE,
    diagnostic_initial_score REAL,
    current_day_index INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27. SPACED_REPETITION_SCHEDULE
CREATE TABLE IF NOT EXISTS spaced_repetition_schedules (
    schedule_id VARCHAR(64) PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES study_plans(plan_id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES original_exercise_items(item_id),
    repetition_interval_days INTEGER DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    streak_count INTEGER DEFAULT 0,
    next_review_date DATE NOT NULL,
    last_reviewed_at TIMESTAMP
);

-- 28. MODEL_RUN
CREATE TABLE IF NOT EXISTS model_runs (
    run_id VARCHAR(64) PRIMARY KEY,
    model_name VARCHAR(64) NOT NULL,
    task_type VARCHAR(32) NOT NULL,
    duration_ms INTEGER NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 29. BACKUP
CREATE TABLE IF NOT EXISTS backups (
    backup_id VARCHAR(64) PRIMARY KEY,
    backup_type VARCHAR(16) NOT NULL CHECK(backup_type IN ('FULL', 'DATA_ONLY', 'AUDIO_ONLY')),
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 30. APPLICATION_SETTING
CREATE TABLE IF NOT EXISTS application_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(16) DEFAULT 'STRING',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def seed_defaults(conn: sqlite3.Connection):
    cursor = conn.cursor()
    
    # 1. Application Settings
    settings = [
        ("app_name", "PTE Academic Personal Intelligence Platform", "STRING", "Application Title"),
        ("target_visa", "Australia Subclass 462 Work and Holiday", "STRING", "Primary Target Visa"),
        ("target_english_level", "Functional English", "STRING", "Immigration English Standard"),
        ("statutory_minimum_score", "24", "INTEGER", "Official DHA Minimum Score for post-Aug 7, 2025 tests"),
        ("practice_safe_target", "36", "INTEGER", "Platform Safe Target with scoring buffer"),
        ("ui_language", "id", "STRING", "User Interface Language (Bahasa Indonesia)"),
        ("exercise_language", "en", "STRING", "Test Prompt & Response Language"),
        ("ollama_host", "http://localhost:11434", "STRING", "Localhost Ollama Endpoint"),
        ("default_ollama_model", "qwen2.5:7b-instruct", "STRING", "Default Local Evaluation Model"),
        ("mic_silence_timeout_sec", "3", "INTEGER", "Auto-stop microphone duration"),
        ("database_driver", "sqlite_wal", "STRING", "Active Database Engine")
    ]
    cursor.executemany(
        "INSERT OR REPLACE INTO application_settings (setting_key, setting_value, data_type, description) VALUES (?, ?, ?, ?)",
        settings
    )

    # 2. PTE Specification Version (Post-August 7, 2025)
    cursor.execute("""
    INSERT OR REPLACE INTO pte_specification_versions 
    (spec_version, effective_date, is_active, statutory_functional_score, safe_target_score, total_parts, total_question_types, change_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "2.1.0", "2025-08-07", True, 24, 36, 3, 22,
        "Incorporates Australia DHA August 7, 2025 legislative update (score 24) and Pearson new question types: RTS & SGD."
    ))

    # 3. CEFR Mappings
    cefr_data = [
        ("A1", 10, 29, "BELOW_STANDARD"),
        ("A2", 30, 42, "FUNCTIONAL_BORDERLINE"),
        ("B1", 43, 58, "SAFE_COMPETENT"),
        ("B2", 59, 75, "VOCATIONAL_PROFICIENT"),
        ("C1", 76, 84, "SUPERIOR"),
        ("C2", 85, 90, "EXPERT")
    ]
    cursor.executemany(
        "INSERT OR REPLACE INTO cefr_mappings (cefr_code, gse_equivalent_min, gse_equivalent_max, whv_readiness_status) VALUES (?, ?, ?, ?)",
        cefr_data
    )

    # 4. Difficulty Levels
    diff_data = [
        ("EASY", 10, 35, "110-130", "ELEMENTARY"),
        ("MEDIUM", 36, 50, "130-150", "INTERMEDIATE"),
        ("HARD", 51, 65, "150-170", "UPPER_INTERMEDIATE"),
        ("EXTREME", 66, 90, "170-190", "ADVANCED")
    ]
    cursor.executemany(
        "INSERT OR REPLACE INTO difficulty_levels (difficulty_id, gse_min, gse_max, wpm_speed_range, lexical_complexity_tier) VALUES (?, ?, ?, ?, ?)",
        diff_data
    )

    # 5. Question Types (22 Scored + 1 Unscored)
    types_data = [
        ("PI", "Personal Introduction", "PART_1", "None", None, "BINARY", 25, 30, "ITEM_INDEPENDENT", "NONE", None, None, False),
        ("RA", "Read Aloud", "PART_1", "Speaking", "Reading", "PARTIAL_CREDIT", 35, 40, "ITEM_INDEPENDENT", "NONE", 40, 60, False),
        ("RS", "Repeat Sentence", "PART_1", "Speaking", "Listening", "PARTIAL_CREDIT", 0, 15, "ITEM_INDEPENDENT", "NONE", 7, 16, False),
        ("DI", "Describe Image", "PART_1", "Speaking", None, "PARTIAL_CREDIT", 25, 40, "ITEM_INDEPENDENT", "HIGH", None, None, False),
        ("RL", "Re-tell Lecture", "PART_1", "Speaking", "Listening", "PARTIAL_CREDIT", 10, 40, "ITEM_INDEPENDENT", "HIGH", None, None, False),
        ("ASQ", "Answer Short Question", "PART_1", "Speaking", "Listening", "BINARY", 0, 10, "ITEM_INDEPENDENT", "NONE", 1, 3, False),
        ("RTS", "Respond to a Situation", "PART_1", "Speaking", None, "PARTIAL_CREDIT", 10, 40, "ITEM_INDEPENDENT", "CRITICAL", None, None, True),
        ("SGD", "Summarize Group Discussion", "PART_1", "Speaking", "Listening", "PARTIAL_CREDIT", 10, 120, "ITEM_INDEPENDENT", "HIGH", None, None, True),
        ("SWT", "Summarize Written Text", "PART_1", "Writing", "Reading", "PARTIAL_CREDIT", 0, 600, "ITEM_INDEPENDENT", "LOW", 5, 75, False),
        ("WE", "Write Essay", "PART_1", "Writing", None, "PARTIAL_CREDIT", 0, 1200, "ITEM_INDEPENDENT", "HIGH", 200, 300, False),
        ("RW_FIB", "Reading & Writing: Fill in Blanks", "PART_2", "Reading", "Writing", "PARTIAL_CREDIT", 0, 120, "SECTION_SHARED", "NONE", None, None, False),
        ("MCMA_R", "Multiple Choice (Multiple) Reading", "PART_2", "Reading", None, "NEGATIVE_MARKING", 0, 120, "SECTION_SHARED", "NONE", None, None, False),
        ("RO", "Re-order Paragraphs", "PART_2", "Reading", None, "PARTIAL_CREDIT", 0, 150, "SECTION_SHARED", "NONE", None, None, False),
        ("R_FIB", "Reading: Fill in the Blanks", "PART_2", "Reading", None, "PARTIAL_CREDIT", 0, 120, "SECTION_SHARED", "NONE", None, None, False),
        ("MCSA_R", "Multiple Choice (Single) Reading", "PART_2", "Reading", None, "BINARY", 0, 90, "SECTION_SHARED", "NONE", None, None, False),
        ("SST", "Summarize Spoken Text", "PART_3", "Listening", "Writing", "PARTIAL_CREDIT", 0, 600, "ITEM_INDEPENDENT", "MODERATE", 50, 70, False),
        ("MCMA_L", "Multiple Choice (Multiple) Listening", "PART_3", "Listening", None, "NEGATIVE_MARKING", 0, 90, "SECTION_SHARED", "NONE", None, None, False),
        ("L_FIB", "Fill in the Blanks (Listening)", "PART_3", "Listening", "Writing", "PARTIAL_CREDIT", 0, 90, "SECTION_SHARED", "NONE", None, None, False),
        ("HCS", "Highlight Correct Summary", "PART_3", "Listening", "Reading", "BINARY", 0, 90, "SECTION_SHARED", "NONE", None, None, False),
        ("MCSA_L", "Multiple Choice (Single) Listening", "PART_3", "Listening", None, "BINARY", 0, 60, "SECTION_SHARED", "NONE", None, None, False),
        ("SMW", "Select Missing Word", "PART_3", "Listening", None, "BINARY", 0, 60, "SECTION_SHARED", "NONE", None, None, False),
        ("HIW", "Highlight Incorrect Words", "PART_3", "Listening", "Reading", "NEGATIVE_MARKING", 0, 60, "SECTION_SHARED", "NONE", None, None, False),
        ("WFD", "Write From Dictation", "PART_3", "Listening", "Writing", "PARTIAL_CREDIT", 0, 60, "SECTION_SHARED", "NONE", 8, 16, False)
    ]
    cursor.executemany("""
    INSERT OR REPLACE INTO question_types 
    (type_code, name, part_section, primary_skill, cross_scoring_skill, scoring_mode, default_prep_seconds, default_response_seconds, timer_type, template_risk_level, min_word_limit, max_word_limit, is_post_aug_2025_new)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, types_data)

    conn.commit()

def init_database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    
    conn.executescript(SCHEMA_SQL)
    seed_defaults(conn)
    
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
    table_count = cursor.fetchone()[0]
    conn.close()
    
    print(f"Database successfully initialized at: {DB_PATH}")
    print(f"Total tables created and verified: {table_count}")

if __name__ == "__main__":
    init_database()
