#!/usr/bin/env python3
"""
Automated Test Suite for AI Speaking & Writing Evaluation (Fase 6).
Verifies:
1. WPM calculation and oral fluency categorization
2. Pronunciation fidelity and omission detection
3. Summarize Written Text (SWT) form criteria (single sentence, 5-75 words)
4. Essay rubric scoring and template detection heuristics
"""

from pathlib import Path
import sys
import unittest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts" / "worker"))

from stt_worker import (
    calculate_wpm,
    evaluate_oral_fluency,
    analyze_pronunciation_fidelity,
    analyze_speech_response
)
from ai_evaluator import (
    evaluate_swt_form,
    evaluate_essay_deterministic
)

class TestAiEvaluation(unittest.TestCase):

    def test_wpm_calculation(self):
        # 10 words in 5.0 seconds = 120 WPM
        wpm = calculate_wpm(10, 5.0)
        self.assertEqual(wpm, 120.0)

    def test_fluency_rating(self):
        # Optimal pace (120-165 WPM)
        opt = evaluate_oral_fluency(135.0)
        self.assertEqual(opt["status"], "OPTIMAL_NATURAL_PACE")
        self.assertEqual(opt["fluency_score"], 5.0)

        # Slow / hesitant pace
        slow = evaluate_oral_fluency(75.0)
        self.assertEqual(slow["status"], "HESITANT_SLOW")
        self.assertLess(slow["fluency_score"], 4.0)

    def test_pronunciation_fidelity(self):
        prompt = "Solar energy adoption has accelerated significantly."
        spoken = "Solar energy adoption accelerated significantly." # Omitted "has"

        res = analyze_pronunciation_fidelity(spoken, prompt)
        self.assertEqual(res["total_ref_words"], 6)
        self.assertEqual(res["matched_words_count"], 5)
        self.assertIn("has", res["omitted_words"])
        self.assertGreater(res["accuracy_percentage"], 80.0)

    def test_swt_form_single_sentence(self):
        # Valid SWT: exactly one sentence, 15 words
        valid_swt = "Although renewable energy requires significant initial investments, its long-term benefits for climate stabilization are undeniable."
        res_valid = evaluate_swt_form(valid_swt)
        self.assertEqual(res_valid["form_score"], 1)
        self.assertTrue(res_valid["is_single_sentence"])

        # Invalid SWT: two sentences
        invalid_swt = "Renewable energy is beneficial. However it costs a lot of money."
        res_invalid = evaluate_swt_form(invalid_swt)
        self.assertEqual(res_invalid["form_score"], 0)
        self.assertFalse(res_invalid["is_single_sentence"])

    def test_essay_evaluation_and_template_detection(self):
        prompt = "Discuss whether university should be free for all citizens."
        essay = (
            "In modern society the debate over higher education is crucial. Providing free education allows all students "
            "to pursue academic careers regardless of financial status. Furthermore, it creates equal opportunities.\n\n"
            "On the other hand on the other hand, running universities requires huge resources. Consequently, governments must balance budgets.\n\n"
            "In conclusion, a sustainable approach is offering targeted scholarships."
        )

        res = evaluate_essay_deterministic(essay, prompt)
        self.assertIn("dimensions", res)
        self.assertGreater(res["scaled_score"], 30.0)
        # Check template detection trigger
        self.assertTrue(res["template_detection_flag"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
