#!/usr/bin/env python3
"""
Automated Test Suite for Scraper Engine & Quarantine Pipeline.
Verifies:
1. Robots.txt checking logic
2. Trusted Mode ingestion into sources & source_snapshots
3. Discovery Mode quarantine isolation into review_queue
4. Copyright & exam leak detection heuristics
5. SHA-256 content hashing accuracy
"""

import json
from pathlib import Path
import sqlite3
import sys
import unittest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts" / "worker"))

from scraper import (
    calculate_sha256,
    detect_copyright_and_leak_risk,
    check_robots_txt,
    run_trusted_scan,
    run_discovery_scan,
    ALLOWED_TRUSTED_DOMAINS
)

class TestScraperEngine(unittest.TestCase):

    def setUp(self):
        self.fixture_html = WORKSPACE_ROOT / "tests" / "fixtures" / "sample_dha_policy.html"
        self.fixture_url = f"file:///{str(self.fixture_html).replace(chr(92), '/')}"

    def test_sha256_calculation(self):
        sample = b"Hello PTE Academic 2026"
        expected = "8cdacd04f2fc6edf50cc69e859bbc0e9ca11d353d7423dfdf16efeb7b96d682f"
        self.assertEqual(calculate_sha256(sample), expected)

    def test_copyright_and_leak_detection(self):
        # 1. Clean academic text -> APPROVE
        clean_text = "The quick brown fox jumps over the lazy dog."
        audit_clean = detect_copyright_and_leak_risk(clean_text)
        self.assertFalse(audit_clean["flagged"])
        self.assertEqual(audit_clean["recommendation"], "APPROVE")

        # 2. Leaked questions claim -> REJECT
        leak_text = "Here are the actual exam leaks from Pearson PTE test centre 2026."
        audit_leak = detect_copyright_and_leak_risk(leak_text)
        self.assertTrue(audit_leak["flagged"])
        self.assertIn("POTENTIAL_EXAM_DUMP", audit_leak["flags"])
        self.assertEqual(audit_leak["recommendation"], "REJECT")

        # 3. Rigid template claim -> EDIT_WARNING
        template_text = "Memorize this universal essay template for 100% fluency."
        audit_tmpl = detect_copyright_and_leak_risk(template_text)
        self.assertTrue(audit_tmpl["flagged"])
        self.assertIn("RIGID_BOILERPLATE_TEMPLATE", audit_tmpl["flags"])
        self.assertEqual(audit_tmpl["recommendation"], "EDIT_WARNING")

    def test_robots_txt_allow_check(self):
        # Local file should always be allowed
        self.assertTrue(check_robots_txt(self.fixture_url))

    def test_trusted_mode_ingestion(self):
        # Scan local fixture URL
        results = run_trusted_scan(self.fixture_url)
        self.assertTrue(len(results) > 0)
        res = results[0]
        self.assertEqual(res["status"], "INGESTED_TRUSTED")
        self.assertIn("Functional English", res["title"])

        # Verify in SQLite DB
        db_path = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM sources WHERE verification_status = 'VERIFIED_TRUSTED'")
        count = cursor.fetchone()[0]
        conn.close()
        self.assertGreaterEqual(count, 1)

    def test_discovery_mode_quarantine_isolation(self):
        # Scan local fixture URL in Discovery Mode
        result = run_discovery_scan(self.fixture_url)
        self.assertEqual(result["status"], "QUARANTINED_FOR_REVIEW")
        self.assertTrue(result["review_id"].startswith("REV-"))

        # Verify review_queue record in SQLite
        db_path = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT review_status, duplicate_similarity FROM review_queue WHERE review_id = ?", (result["review_id"],))
        row = cursor.fetchone()
        conn.close()
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "PENDING")

if __name__ == "__main__":
    unittest.main(verbosity=2)
