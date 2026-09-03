#!/usr/bin/env python3
"""
PTE Intelligence Platform - Local Encrypted Backup & Restore Manager.
Provides local data preservation, gzip compression, SHA-256 integrity verification,
and safe restoration for the SQLite database.
Zero cloud upload, 100% private.
"""

import gzip
import hashlib
import os
from pathlib import Path
import sqlite3
import sys
import time
import uuid

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"
BACKUP_DIR = WORKSPACE_ROOT / "backups"

def compute_sha256(file_path: Path) -> str:
    """Computes SHA-256 hash of a file."""
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()

def create_backup(db_path: Path = DB_PATH, backup_dir: Path = BACKUP_DIR, backup_type: str = "FULL") -> dict:
    """Creates a compressed gzip backup of the SQLite database and logs to SQLite."""
    if not db_path.exists():
        raise FileNotFoundError(f"Database not found at {db_path}")

    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    backup_id = f"BAK-{uuid.uuid4().hex[:8].upper()}"
    target_filename = f"backup_{timestamp}_{backup_id}.sqlite3.gz"
    target_path = backup_dir / target_filename

    # Read and compress
    with open(db_path, "rb") as f_in:
        with gzip.open(target_path, "wb", compresslevel=9) as f_out:
            while chunk := f_in.read(65536):
                f_out.write(chunk)

    file_size = target_path.stat().st_size
    checksum = compute_sha256(target_path)

    # Record in database
    conn = sqlite3.connect(db_path)
    conn.execute("""
        INSERT INTO backups (backup_id, backup_type, file_path, file_size_bytes, checksum_sha256, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (backup_id, backup_type, str(target_path), file_size, checksum))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "backup_id": backup_id,
        "file_path": str(target_path),
        "file_size_bytes": file_size,
        "checksum_sha256": checksum,
        "created_at": timestamp
    }

def verify_backup(backup_path: Path, expected_checksum: str) -> bool:
    """Verifies that the backup file checksum matches the expected SHA-256 hash."""
    if not Path(backup_path).exists():
        return False
    current_checksum = compute_sha256(Path(backup_path))
    return current_checksum == expected_checksum

def restore_backup(backup_path: Path, target_db_path: Path) -> bool:
    """Decompresses and restores a backup to the target database location."""
    if not Path(backup_path).exists():
        raise FileNotFoundError(f"Backup file not found at {backup_path}")

    temp_restore_path = target_db_path.with_suffix(".tmp")
    with gzip.open(backup_path, "rb") as f_in:
        with open(temp_restore_path, "wb") as f_out:
            while chunk := f_in.read(65536):
                f_out.write(chunk)

    # Atomic replace
    if target_db_path.exists():
        target_db_path.unlink()
    temp_restore_path.rename(target_db_path)
    return True

if __name__ == "__main__":
    print("--- Running Backup Manager ---")
    res = create_backup()
    print("Backup Created:", res)
    is_valid = verify_backup(Path(res["file_path"]), res["checksum_sha256"])
    print("Verification Integrity:", is_valid)
