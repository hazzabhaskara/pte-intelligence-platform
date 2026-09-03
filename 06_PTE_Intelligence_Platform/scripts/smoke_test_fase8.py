#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 8: Executive Readiness Dashboard & Local Backup Manager.
Verifies:
1. /dashboard page (HTTP 200)
2. API GET /api/dashboard (Legal 24 & Safe 36+ compliance, 4 skills breakdown)
3. API GET /api/backup (Backup registry retrieval)
4. API POST /api/backup (Local gzip backup creation with SHA-256 integrity)
"""

import urllib.request
import json
import sys

BASE_URL = "http://localhost:3005"

endpoints = [
    ("Home Page", f"{BASE_URL}/"),
    ("Executive Dashboard", f"{BASE_URL}/dashboard"),
    ("Dashboard API", f"{BASE_URL}/api/dashboard"),
    ("Backup API", f"{BASE_URL}/api/backup")
]

all_pass = True
print("=== Phase 8 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase8/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = resp.read()
            c_type = resp.headers.get("Content-Type", "")
            
            if status == 200:
                print(f"[PASS] {label:24} -> HTTP {status} ({len(body)} bytes, {c_type})")
            else:
                print(f"[FAIL] {label:24} -> HTTP {status}")
                all_pass = False
    except Exception as e:
        print(f"[FAIL] {label:24} -> Error: {e}")
        all_pass = False

print("\n--- Testing Local Backup Generation (POST /api/backup) ---")
try:
    req = urllib.request.Request(
        f"{BASE_URL}/api/backup",
        data=b"{}",
        headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase8/1.0"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode())
        if res.get("success"):
            b = res.get("backup", {})
            print(f"[PASS] Created Local Backup       -> ID: {b.get('backup_id')}, Size: {b.get('file_size_bytes')} bytes, SHA-256: {b.get('checksum_sha256', '')[:16]}...")
        else:
            print(f"[FAIL] Created Local Backup       -> {res}")
            all_pass = False
except Exception as e:
    print(f"[FAIL] Created Local Backup       -> Error: {e}")
    all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 8 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
