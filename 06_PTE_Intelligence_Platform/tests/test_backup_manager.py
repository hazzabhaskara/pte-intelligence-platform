#!/usr/bin/env python3
"""
Automated Test Suite for Local Backup & Restore Manager (Fase 8).
Verifies:
1. Gzip backup creation and file existence.
2. SHA-256 checksum hashing and verification.
3. Safe atomic database restore.
"""

from pathlib import Path
import shutil
import sqlite3
import sys
import unittest

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT / "scripts"))

from backup_manager import (
    create_backup,
    verify_backup,
    restore_backup,
    compute_sha256
)

class TestBackupManager(unittest.TestCase):

    def setUp(self):
        self.test_dir = WORKSPACE_ROOT / "backups" / "test_scratch"
        self.test_dir.mkdir(parents=True, exist_ok=True)
        self.dummy_db = self.test_dir / "test_storage.sqlite3"

        # Initialize dummy sqlite db
        conn = sqlite3.connect(self.dummy_db)
        conn.execute("CREATE TABLE backups (backup_id VARCHAR(64), backup_type VARCHAR(16), file_path TEXT, file_size_bytes BIGINT, checksum_sha256 VARCHAR(64), created_at TIMESTAMP);")
        conn.execute("CREATE TABLE test_data (id INTEGER PRIMARY KEY, msg TEXT);")
        conn.execute("INSERT INTO test_data (msg) VALUES ('PTE Academic 462 Safe Target 36');")
        conn.commit()
        conn.close()

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_backup_and_integrity_verification(self):
        res = create_backup(db_path=self.dummy_db, backup_dir=self.test_dir)
        self.assertTrue(res["success"])
        self.assertTrue(Path(res["file_path"]).exists())
        self.assertGreater(res["file_size_bytes"], 0)

        # Verify checksum matches
        is_valid = verify_backup(Path(res["file_path"]), res["checksum_sha256"])
        self.assertTrue(is_valid)

    def test_restore_database(self):
        res = create_backup(db_path=self.dummy_db, backup_dir=self.test_dir)
        backup_file = Path(res["file_path"])

        restored_target = self.test_dir / "restored.sqlite3"
        restored_ok = restore_backup(backup_file, restored_target)
        self.assertTrue(restored_ok)
        self.assertTrue(restored_target.exists())

        # Check restored content
        conn = sqlite3.connect(restored_target)
        cursor = conn.cursor()
        cursor.execute("SELECT msg FROM test_data LIMIT 1")
        row = cursor.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "PTE Academic 462 Safe Target 36")
        conn.close()

if __name__ == "__main__":
    unittest.main(verbosity=2)
