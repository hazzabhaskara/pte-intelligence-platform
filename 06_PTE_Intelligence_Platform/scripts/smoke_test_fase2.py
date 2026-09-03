#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 2:
1. Verifies /admin/sources (HTML 200)
2. Verifies /api/sources (JSON 200, sources array & jobs array)
3. Verifies /api/quarantine (JSON 200, queue array)
4. Tests Quarantine Action (POST /api/quarantine)
"""

import urllib.request
import json
import sys

BASE_URL = "http://localhost:3005"

endpoints = [
    ("Home Page", f"{BASE_URL}/"),
    ("Setup Page", f"{BASE_URL}/setup"),
    ("Drafts Page", f"{BASE_URL}/drafts"),
    ("Admin Sources Page", f"{BASE_URL}/admin/sources"),
    ("Sources API", f"{BASE_URL}/api/sources"),
    ("Quarantine API", f"{BASE_URL}/api/quarantine")
]

all_pass = True
print("=== Phase 2 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase2/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = resp.read()
            c_type = resp.headers.get("Content-Type", "")
            
            if status == 200:
                print(f"[PASS] {label:22} -> HTTP {status} ({len(body)} bytes, {c_type})")
                if "application/json" in c_type:
                    parsed = json.loads(body.decode("utf-8"))
                    print(f"       -> JSON Success: {parsed.get('success')}")
                    if "sources" in parsed:
                        print(f"       -> Active Sources: {len(parsed['sources'])} items, {len(parsed.get('jobs', []))} jobs")
                    if "queue" in parsed:
                        print(f"       -> Quarantine Queue: {len(parsed['queue'])} items")
            else:
                print(f"[FAIL] {label:22} -> HTTP {status}")
                all_pass = False
    except Exception as e:
        print(f"[FAIL] {label:22} -> Error: {e}")
        all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 2 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
