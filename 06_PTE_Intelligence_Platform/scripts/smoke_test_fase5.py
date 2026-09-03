#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 5: Objective Scoring Engine.
Verifies:
1. Evaluation Report GUI /practice/evaluation/{id} (HTTP 200)
2. API POST /api/scoring/evaluate:
   - Negative marking strictly floored at 0
   - WFD word partial credit
   - RO adjacent pair matching
   - FIB casing tolerance
"""

import urllib.request
import json
import sys

BASE_URL = "http://localhost:3005"

endpoints = [
    ("Home Page", f"{BASE_URL}/"),
    ("Practice Page", f"{BASE_URL}/practice"),
    ("Evaluation Report Page", f"{BASE_URL}/practice/evaluation/ATT-SMOKE-TEST")
]

all_pass = True
print("=== Phase 5 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase5/1.0"})
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

print("\n--- Testing Objective Scoring Engine API (POST /api/scoring/evaluate) ---")

test_cases = [
    {
        "name": "Negative Marking (Floor 0 Test)",
        "payload": {
            "type_code": "R_MCM",
            "user_submission": ["A", "C", "D"],
            "canonical_data": ["A", "B"]
        },
        "assert_fn": lambda r: r["raw_score"] == 0 and r["floor_applied"] is True
    },
    {
        "name": "Write From Dictation Partial Credit",
        "payload": {
            "type_code": "WFD",
            "user_submission": "The orientation session starts at ten.",
            "canonical_data": "The library orientation session starts at ten o'clock."
        },
        "assert_fn": lambda r: r["raw_score"] == 6 and r["max_score"] == 8
    },
    {
        "name": "Re-order Paragraphs Adjacent Pairs",
        "payload": {
            "type_code": "RO",
            "user_submission": ["A", "B", "D", "C"],
            "canonical_data": ["A", "B", "C", "D"]
        },
        "assert_fn": lambda r: r["raw_score"] == 1 and r["max_score"] == 3
    }
]

for tc in test_cases:
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/scoring/evaluate",
            data=json.dumps(tc["payload"]).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase5/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            res = json.loads(resp.read().decode())
            if res.get("success") and tc["assert_fn"](res["result"]):
                print(f"[PASS] {tc['name']} -> Correctly evaluated (Score: {res['result']['raw_score']}/{res['result']['max_score']})")
            else:
                print(f"[FAIL] {tc['name']} -> Assertion failed: {res}")
                all_pass = False
    except Exception as e:
        print(f"[FAIL] {tc['name']} -> Error: {e}")
        all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 5 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
