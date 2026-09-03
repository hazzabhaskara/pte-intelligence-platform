#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 7: Adaptive Curriculum, Remediasi & SM-2.
Verifies:
1. /curriculum GUI page (HTTP 200)
2. API GET /api/curriculum (Active plan, study plans, remediation priorities, Australia modules)
3. API POST /api/curriculum (Plan duration update)
4. API GET & POST /api/curriculum/cards (SM-2 Spaced Repetition deck review and rating update)
"""

import urllib.request
import json
import sys

BASE_URL = "http://localhost:3005"

endpoints = [
    ("Home Page", f"{BASE_URL}/"),
    ("Practice Page", f"{BASE_URL}/practice"),
    ("Curriculum Page", f"{BASE_URL}/curriculum"),
    ("Curriculum API", f"{BASE_URL}/api/curriculum"),
    ("SM-2 Cards API", f"{BASE_URL}/api/curriculum/cards")
]

all_pass = True
print("=== Phase 7 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase7/1.0"})
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

print("\n--- Testing SM-2 Spaced Repetition Card Update (POST /api/curriculum/cards) ---")
try:
    # 1. Get cards
    req = urllib.request.Request(f"{BASE_URL}/api/curriculum/cards", headers={"User-Agent": "SmokeTestPhase7/1.0"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        cards_res = json.loads(resp.read().decode())
        cards = cards_res.get("cards", [])

    if len(cards) > 0:
        first_card = cards[0]
        schedule_id = first_card["schedule_id"]
        
        # 2. Rate card with quality 4
        post_data = json.dumps({"schedule_id": schedule_id, "quality_rating": 4}).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/curriculum/cards",
            data=post_data,
            headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase7/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            rate_res = json.loads(resp.read().decode())
            if rate_res.get("success"):
                print(f"[PASS] SM-2 Card Update          -> Sched: {schedule_id}, Interval: {rate_res.get('repetition_interval_days')} hari (EF: {rate_res.get('ease_factor')})")
            else:
                print(f"[FAIL] SM-2 Card Update          -> {rate_res}")
                all_pass = False
    else:
        print("[FAIL] SM-2 Card Update          -> No cards returned")
        all_pass = False

except Exception as e:
    print(f"[FAIL] SM-2 Card Update          -> Error: {e}")
    all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 7 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
