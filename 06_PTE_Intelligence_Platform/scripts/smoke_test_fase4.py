#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 4: Practice Modes & Simulator.
Verifies:
1. /practice landing page (HTTP 200)
2. /practice/simulator page (HTTP 200)
3. Session lifecycle:
   - POST /api/practice/sessions (Create FULL_MOCK session)
   - POST /api/practice/sessions/{id}/response (Submit practice response)
   - POST /api/practice/sessions/{id}/finish (Finish & get provisional score)
"""

import urllib.request
import json
import sys

BASE_URL = "http://localhost:3005"

endpoints = [
    ("Home Page", f"{BASE_URL}/"),
    ("Questions Page", f"{BASE_URL}/questions"),
    ("Practice Landing Page", f"{BASE_URL}/practice"),
    ("Simulator Page", f"{BASE_URL}/practice/simulator?mode=DRILL&type=RA"),
    ("Practice Sessions API", f"{BASE_URL}/api/practice/sessions")
]

all_pass = True
print("=== Phase 4 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase4/1.0"})
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

print("\n--- Testing Practice Session Lifecycle API ---")
try:
    # 1. Create Attempt
    post_data = json.dumps({"session_mode": "FULL_MOCK"}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/practice/sessions",
        data=post_data,
        headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase4/1.0"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        sess_res = json.loads(resp.read().decode())
        attempt_id = sess_res.get("attempt_id")
        questions = sess_res.get("questions", [])
        print(f"[PASS] Created Session: {attempt_id} ({len(questions)} questions queued)")

    # 2. Submit Response
    if attempt_id and len(questions) > 0:
        first_q = questions[0]
        resp_data = json.dumps({
            "item_id": first_q["item_id"],
            "submitted_text": "Solar energy adoption has accelerated significantly across regional Australia over the past decade.",
            "time_spent_seconds": 35.0
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/practice/sessions/{attempt_id}/response",
            data=resp_data,
            headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase4/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            rec_res = json.loads(resp.read().decode())
            print(f"[PASS] Recorded Response: {rec_res.get('response_id')}")

        # 3. Finish Attempt
        fin_data = json.dumps({"total_duration_seconds": 120}).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/practice/sessions/{attempt_id}/finish",
            data=fin_data,
            headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase4/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            fin_res = json.loads(resp.read().decode())
            print(f"[PASS] Finished Attempt: Score {fin_res.get('calculated_overall_score')}, Readiness: {fin_res.get('readiness_status')}")

except Exception as e:
    print(f"[FAIL] Practice Lifecycle -> Error: {e}")
    all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 4 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
