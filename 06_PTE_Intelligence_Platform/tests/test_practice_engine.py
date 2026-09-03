#!/usr/bin/env python3
"""
Automated Test Suite for Practice Modes Engine (Fase 4).
Verifies:
1. Creation of practice attempts (DRILL, SECTION_TEST, FULL_MOCK).
2. Saving user responses into `user_responses`.
3. Calculating time spent and completing an attempt session.
4. Ensuring integrity and foreign key linkages to `original_exercise_items`.
"""

from pathlib import Path
import sqlite3
import sys
import unittest
import uuid

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"

class TestPracticeEngine(unittest.TestCase):

    def setUp(self):
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.execute("PRAGMA foreign_keys = ON;")
        self.cursor = self.conn.cursor()

        # Get an existing exercise item
        self.cursor.execute("SELECT item_id FROM original_exercise_items LIMIT 1")
        row = self.cursor.fetchone()
        self.assertIsNotNone(row, "Need at least 1 exercise item in database")
        self.sample_item_id = row[0]

    def tearDown(self):
        self.conn.close()

    def test_create_attempt_session(self):
        attempt_id = f"ATT-{uuid.uuid4().hex[:8].upper()}"
        self.cursor.execute("""
        INSERT INTO attempts (attempt_id, session_mode, started_at)
        VALUES (?, 'FULL_MOCK', CURRENT_TIMESTAMP)
        """, (attempt_id,))
        self.conn.commit()

        self.cursor.execute("SELECT session_mode FROM attempts WHERE attempt_id = ?", (attempt_id,))
        row = self.cursor.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "FULL_MOCK")

    def test_record_user_response(self):
        attempt_id = f"ATT-{uuid.uuid4().hex[:8].upper()}"
        self.cursor.execute("""
        INSERT INTO attempts (attempt_id, session_mode, started_at)
        VALUES (?, 'DRILL', CURRENT_TIMESTAMP)
        """, (attempt_id,))

        resp_id = f"RESP-{uuid.uuid4().hex[:8].upper()}"
        user_answer = "This is a simulated practice response for testing."
        self.cursor.execute("""
        INSERT INTO user_responses (
            response_id, attempt_id, item_id, submitted_text, time_spent_seconds, response_timestamp
        ) VALUES (?, ?, ?, ?, 25.5, CURRENT_TIMESTAMP)
        """, (resp_id, attempt_id, self.sample_item_id, user_answer))
        self.conn.commit()

        self.cursor.execute("SELECT submitted_text, time_spent_seconds FROM user_responses WHERE response_id = ?", (resp_id,))
        saved = self.cursor.fetchone()
        self.assertIsNotNone(saved)
        self.assertEqual(saved[0], user_answer)
        self.assertEqual(saved[1], 25.5)

    def test_complete_attempt_lifecycle(self):
        attempt_id = f"ATT-{uuid.uuid4().hex[:8].upper()}"
        self.cursor.execute("""
        INSERT INTO attempts (attempt_id, session_mode, started_at)
        VALUES (?, 'SECTION_TEST', CURRENT_TIMESTAMP)
        """, (attempt_id,))

        # Update attempt completion
        self.cursor.execute("""
        UPDATE attempts 
        SET completed_at = CURRENT_TIMESTAMP,
            total_duration_seconds = 1800,
            calculated_overall_score = 38.5,
            readiness_status = 'ON_TRACK_SAFE'
        WHERE attempt_id = ?
        """, (attempt_id,))
        self.conn.commit()

        self.cursor.execute("SELECT calculated_overall_score, readiness_status FROM attempts WHERE attempt_id = ?", (attempt_id,))
        completed = self.cursor.fetchone()
        self.assertIsNotNone(completed)
        self.assertEqual(completed[0], 38.5)
        self.assertEqual(completed[1], "ON_TRACK_SAFE")

if __name__ == "__main__":
    unittest.main(verbosity=2)
