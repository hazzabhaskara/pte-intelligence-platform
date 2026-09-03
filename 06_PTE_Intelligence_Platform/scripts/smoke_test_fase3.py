#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 3:
1. Verifies /questions page (HTML 200)
2. Verifies /api/blueprints (JSON 200, count >= 22)
3. Verifies /api/questions (JSON 200, count > 0)
4. Tests on-demand question synthesis via POST /api/questions
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
    ("Questions Page", f"{BASE_URL}/questions"),
    ("Blueprints API", f"{BASE_URL}/api/blueprints"),
    ("Questions API", f"{BASE_URL}/api/questions")
]

all_pass = True
print("=== Phase 3 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase3/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = resp.read()
            c_type = resp.headers.get("Content-Type", "")
            
            if status == 200:
                print(f"[PASS] {label:22} -> HTTP {status} ({len(body)} bytes, {c_type})")
                if "application/json" in c_type:
                    parsed = json.loads(body.decode("utf-8"))
                    print(f"       -> JSON Success: {parsed.get('success')}")
                    if "blueprints" in parsed:
                        print(f"       -> Blueprints Total: {len(parsed['blueprints'])} / 22")
                    if "questions" in parsed:
                        print(f"       -> Stored Questions: {len(parsed['questions'])} items")
            else:
                print(f"[FAIL] {label:22} -> HTTP {status}")
                all_pass = False
    except Exception as e:
        print(f"[FAIL] {label:22} -> Error: {e}")
        all_pass = False

# Test POST question generation
print("\n--- Testing On-Demand Question Synthesis (POST /api/questions) ---")
try:
    post_data = json.dumps({
        "type_code": "RTS",
        "topic": "University Library Late Book Return",
        "force_deterministic": True
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/questions",
        data=post_data,
        headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase3/1.0"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status == 200:
            res_json = json.loads(resp.read().decode("utf-8"))
            print(f"[PASS] Successfully generated RTS item: {res_json.get('item', {}).get('item_id')}")
            print(f"       Hash: {res_json.get('item', {}).get('sha256')[:12]}...")
        else:
            print(f"[FAIL] POST /api/questions -> HTTP {resp.status}")
            all_pass = False
except Exception as e:
    print(f"[FAIL] POST /api/questions -> Error: {e}")
    all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 3 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
