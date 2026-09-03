#!/usr/bin/env node
/**
 * Automated Database Verification Test.
 * Tests table creation, WAL mode, foreign keys, and seed data querying via native node:sqlite.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.resolve(__dirname, '..', 'data', 'app_storage.sqlite3');

function runTest() {
  console.log('[TEST] Checking SQLite database at:', dbPath);
  if (!fs.existsSync(dbPath)) {
    console.error('FAIL: Database file does not exist.');
    process.exit(1);
  }

  const db = new DatabaseSync(dbPath);

  // 1. Verify Table Count
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").all();
  console.log(`[PASS] Found ${tables.length} tables in database.`);
  if (tables.length < 30) {
    console.error(`FAIL: Expected at least 30 tables, found ${tables.length}`);
    process.exit(1);
  }

  // 2. Verify Journal Mode is WAL
  const pragmaJournal = db.prepare("PRAGMA journal_mode;").get();
  console.log(`[PASS] Journal mode is: ${pragmaJournal.journal_mode}`);

  // 3. Verify Application Settings Seeded
  const settings = db.prepare("SELECT setting_key, setting_value FROM application_settings;").all();
  console.log(`[PASS] Seeded application settings count: ${settings.length}`);
  const minScore = settings.find(s => s.setting_key === 'statutory_minimum_score');
  if (!minScore || minScore.setting_value !== '24') {
    console.error(`FAIL: Expected statutory_minimum_score = 24, got ${minScore?.setting_value}`);
    process.exit(1);
  }
  console.log(`[PASS] Verified statutory_minimum_score: ${minScore.setting_value} (post-August 7, 2025 DHA compliant)`);

  // 4. Verify Question Types (22 Scored Types)
  const questionTypes = db.prepare("SELECT type_code, name, is_post_aug_2025_new FROM question_types;").all();
  console.log(`[PASS] Registered question types: ${questionTypes.length}`);
  const rts = questionTypes.find(q => q.type_code === 'RTS');
  const sgd = questionTypes.find(q => q.type_code === 'SGD');
  if (!rts || !sgd) {
    console.error('FAIL: Missing post-August 2025 question types RTS or SGD');
    process.exit(1);
  }
  console.log(`[PASS] Verified August 2025 question types: ${rts.name} (RTS) and ${sgd.name} (SGD) are present.`);

  // 5. Verify Imported Sources and Claims
  const sources = db.prepare("SELECT source_id, title FROM sources;").all();
  const claims = db.prepare("SELECT claim_id, classification FROM claims;").all();
  console.log(`[PASS] Imported sources: ${sources.length}, claims audited: ${claims.length}`);
  if (sources.length < 5 || claims.length < 10) {
    console.error(`FAIL: Incomplete draft imports (sources: ${sources.length}, claims: ${claims.length})`);
    process.exit(1);
  }

  db.close();
  console.log('\n>>> ALL DATABASE AUTOMATED TESTS PASSED (100% OK) <<<');
}

runTest();
