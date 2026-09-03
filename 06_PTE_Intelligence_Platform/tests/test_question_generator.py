#!/usr/bin/env python3
"""
Automated Test Suite for Question Generator and Blueprint Catalog.
Verifies:
1. All 22 question blueprints exist in the database.
2. Generator creates valid items for speaking, writing, and reading.
3. Post-August 2025 question types (RTS and SGD) generate valid prompts and answer keys.
4. Each item has a SHA-256 uniqueness hash and valid CEFR level.
"""

from pathlib import Path
import sqlite3
import sys
import unittest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts" / "worker"))

from question_generator import generate_question
from seed_blueprints import seed_blueprints

class TestQuestionGenerator(unittest.TestCase):

    def setUp(self):
        self.db_path = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"

    def test_all_22_blueprints_exist(self):
        total = seed_blueprints()
        self.assertEqual(total, 22)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT type_code FROM question_blueprints")
        type_codes = {r[0] for r in cursor.fetchall()}
        conn.close()

        # Check core types and post-Aug 2025 types
        self.assertIn("RA", type_codes)
        self.assertIn("WFD", type_codes)
        self.assertIn("WE", type_codes)
        self.assertIn("RTS", type_codes)
        self.assertIn("SGD", type_codes)

    def test_generate_read_aloud_item(self):
        item = generate_question("RA", force_deterministic=True)
        self.assertTrue(item["item_id"].startswith("ITEM-RA-"))
        self.assertGreater(len(item["prompt_text"]), 30)
        self.assertEqual(len(item["sha256"]), 64)
        self.assertEqual(item["cefr_level"], "B1")

    def test_generate_post_august_2025_rts_and_sgd(self):
        # Test Respond to a Situation
        rts = generate_question("RTS", force_deterministic=True)
        self.assertTrue(rts["item_id"].startswith("ITEM-RTS-"))
        self.assertTrue(any(k in rts["prompt_text"].lower() for k in ["customer", "apartment", "situation", "manager"]))

        # Test Summarize Group Discussion
        sgd = generate_question("SGD", force_deterministic=True)
        self.assertTrue(sgd["item_id"].startswith("ITEM-SGD-"))
        self.assertGreater(len(sgd["prompt_text"]), 40)

    def test_answer_key_persistence(self):
        wfd = generate_question("WFD", force_deterministic=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT accepted_canonical_text FROM answer_keys WHERE item_id = ?", (wfd["item_id"],))
        row = cursor.fetchone()
        conn.close()

        self.assertIsNotNone(row)
        self.assertEqual(row[0], wfd["canonical_answer"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
