#!/usr/bin/env python3
"""
Automated Test Suite for Objective Scoring Engine (Fase 5).
Verifies exact compliance with official Pearson rules:
1. Fill in the Blanks partial credit
2. Negative Marking with strict floor at 0 (never negative)
3. Re-order Paragraphs adjacent pair matching
4. Write From Dictation word-level partial credit
"""

from pathlib import Path
import sys
import unittest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts" / "scoring"))

from objective_engine import (
    score_fib,
    score_negative_marking,
    score_reorder_paragraphs,
    score_write_from_dictation,
    score_single_choice
)

class TestObjectiveScoring(unittest.TestCase):

    def test_fib_partial_credit(self):
        user_answers = ["remarkable", "efficient", "WRONG_WORD", "emissions"]
        canonical_answers = ["remarkable", "efficient", "alternative", "emissions"]

        res = score_fib(user_answers, canonical_answers)
        self.assertEqual(res["raw_score"], 3)
        self.assertEqual(res["max_score"], 4)
        self.assertEqual(res["percentage"], 75.0)

    def test_negative_marking_floored_at_zero(self):
        # Case 1: 2 correct, 0 wrong -> 2 - 0 = 2 pts
        res1 = score_negative_marking(["A", "B"], ["A", "B"])
        self.assertEqual(res1["raw_score"], 2)
        self.assertFalse(res1["floor_applied"])

        # Case 2: 1 correct, 1 wrong -> 1 - 1 = 0 pts
        res2 = score_negative_marking(["A", "C"], ["A", "B"])
        self.assertEqual(res2["raw_score"], 0)
        self.assertFalse(res2["floor_applied"])

        # Case 3 (Critical Floor Test): 1 correct, 2 wrong -> 1 - 2 = -1, but floored to 0!
        res3 = score_negative_marking(["A", "C", "D"], ["A", "B"])
        self.assertEqual(res3["raw_score"], 0)
        self.assertEqual(res3["unfloored_calculation"], -1)
        self.assertTrue(res3["floor_applied"])

    def test_reorder_adjacent_pairs(self):
        canonical = ["A", "B", "C", "D"] # 3 pairs: (A,B), (B,C), (C,D)

        # User has A, B, D, C -> pairs: (A,B), (B,D), (D,C). Only (A,B) matches.
        res = score_reorder_paragraphs(["A", "B", "D", "C"], canonical)
        self.assertEqual(res["raw_score"], 1)
        self.assertEqual(res["max_score"], 3)
        self.assertIn("a -> b", res["matched_pairs"])

    def test_wfd_partial_credit(self):
        canonical = "The library orientation session will commence at ten o'clock."
        user = "The library orientation will start at ten o'clock."
        # Missing: "session", "commence". Extra: "start". Matched: "the", "library", "orientation", "will", "at", "ten", "o'clock" (7 words)

        res = score_write_from_dictation(user, canonical)
        self.assertGreaterEqual(res["raw_score"], 6)
        self.assertIn("session", res["missing_words"])
        self.assertIn("start", res["extra_words"])

    def test_single_choice_binary(self):
        self.assertEqual(score_single_choice("B", "B")["raw_score"], 1)
        self.assertEqual(score_single_choice("A", "B")["raw_score"], 0)

if __name__ == "__main__":
    unittest.main(verbosity=2)
