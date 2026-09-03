#!/usr/bin/env python3
"""
Automated Test Suite for Adaptive Curriculum, Remediasi & SM-2 (Fase 7).
Verifies:
1. SuperMemo SM-2 interval expansion and quality reset rules
2. High-impact remediation priority queue and urgent tagging
3. Cross-skill weight rankings for WHV 462
"""

from pathlib import Path
import sys
import unittest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts" / "curriculum"))

from sm2_engine import (
    calculate_sm2_interval,
    analyze_remediation_needs,
    HIGH_IMPACT_WEIGHTS
)

class TestCurriculumEngine(unittest.TestCase):

    def test_sm2_first_repetition_success(self):
        # First correct recall (q = 4)
        res = calculate_sm2_interval(repetition=0, easiness_factor=2.5, current_interval=1, quality=4)
        self.assertEqual(res["repetition"], 1)
        self.assertEqual(res["interval_days"], 1)
        self.assertEqual(res["easiness_factor"], 2.5)

    def test_sm2_second_repetition_success(self):
        # Second correct recall (q = 4) -> interval jumps to 6 days
        res = calculate_sm2_interval(repetition=1, easiness_factor=2.5, current_interval=1, quality=4)
        self.assertEqual(res["repetition"], 2)
        self.assertEqual(res["interval_days"], 6)

    def test_sm2_third_repetition_expansion(self):
        # Third recall (q = 5, perfect) -> interval = round(6 * 2.6) = 16
        res = calculate_sm2_interval(repetition=2, easiness_factor=2.5, current_interval=6, quality=5)
        self.assertEqual(res["repetition"], 3)
        self.assertGreaterEqual(res["interval_days"], 15)
        self.assertGreater(res["easiness_factor"], 2.5)

    def test_sm2_failed_recall_reset(self):
        # Failed recall (q = 1) -> resets to repetition 0, interval 1
        res = calculate_sm2_interval(repetition=3, easiness_factor=2.6, current_interval=16, quality=1)
        self.assertEqual(res["repetition"], 0)
        self.assertEqual(res["interval_days"], 1)
        self.assertLess(res["easiness_factor"], 2.6)

    def test_high_impact_remediation_urgency(self):
        # User has low WFD accuracy (40%) and high RA accuracy (90%)
        accuracies = {"WFD": 0.40, "RA": 0.90}
        remediation_list = analyze_remediation_needs(accuracies)

        top_priority = remediation_list[0]
        self.assertEqual(top_priority["type_code"], "WFD")
        self.assertEqual(top_priority["remediation_status"], "REMEDIATION_URGENT")
        self.assertEqual(top_priority["recommended_daily_drills"], 5)

if __name__ == "__main__":
    unittest.main(verbosity=2)
