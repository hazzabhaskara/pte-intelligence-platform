#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 6: Local AI Speaking & Writing Evaluation.
Verifies:
1. /practice/ai-evaluation GUI (HTTP 200)
2. API POST /api/ai/evaluate (Speaking WPM & Pronunciation)
3. API POST /api/ai/evaluate (Writing Essay Rubric & Template Detection)
4. API POST /api/ai/evaluate (Writing SWT Form Criteria)
"""

import urllib.request
import json
import sys

BASE_URL = "http://localhost:3005"

endpoints = [
    ("Home Page", f"{BASE_URL}/"),
    ("Practice Page", f"{BASE_URL}/practice"),
    ("AI Evaluation Console", f"{BASE_URL}/practice/ai-evaluation")
]

all_pass = True
print("=== Phase 6 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTestPhase6/1.0"})
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

print("\n--- Testing AI Evaluation API (POST /api/ai/evaluate) ---")

# 1. Test Speaking
try:
    speaking_payload = {
        "type_code": "RA",
        "user_submission": "Solar energy adoption has accelerated significantly across regional Australia over the past decade.",
        "prompt_text": "Solar energy adoption has accelerated significantly across regional Australia over the past decade.",
        "duration_seconds": 4.8
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/ai/evaluate",
        data=json.dumps(speaking_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase6/1.0"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        res = json.loads(resp.read().decode())
        r = res.get("result", {})
        if res.get("success") and r.get("calculated_wpm") > 100:
            print(f"[PASS] Speaking Evaluation        -> WPM: {r.get('calculated_wpm')} ({r.get('fluency', {}).get('status')}), Score: {r.get('overall_speaking_score')}/90")
        else:
            print(f"[FAIL] Speaking Evaluation        -> {res}")
            all_pass = False
except Exception as e:
    print(f"[FAIL] Speaking Evaluation        -> Error: {e}")
    all_pass = False

# 2. Test Essay
try:
    essay_payload = {
        "type_code": "WE",
        "user_submission": (
            "In modern society the debate over university education is vital. Providing free higher education ensures equality. "
            "Furthermore, it creates valuable opportunities for all citizens.\n\n"
            "On the other hand, maintaining universities requires substantial funds. Consequently, governments need revenue.\n\n"
            "In conclusion, targeted scholarships are the best solution."
        ),
        "prompt_text": "Discuss whether university should be free for all citizens."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/ai/evaluate",
        data=json.dumps(essay_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase6/1.0"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        res = json.loads(resp.read().decode())
        r = res.get("result", {})
        if res.get("success") and r.get("scaled_score") > 30:
            print(f"[PASS] Essay Evaluation           -> Scaled Score: {r.get('scaled_score')}/90, Template: {r.get('template_detected')}")
        else:
            print(f"[FAIL] Essay Evaluation           -> {res}")
            all_pass = False
except Exception as e:
    print(f"[FAIL] Essay Evaluation           -> Error: {e}")
    all_pass = False

# 3. Test SWT
try:
    swt_payload = {
        "type_code": "SWT",
        "user_submission": "Although solar energy requires initial infrastructure investments, its long-term economic and environmental benefits are undeniable.",
        "prompt_text": "Solar energy is expanding."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/ai/evaluate",
        data=json.dumps(swt_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "SmokeTestPhase6/1.0"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        res = json.loads(resp.read().decode())
        r = res.get("result", {})
        if res.get("success") and r.get("form_score") == 1:
            print(f"[PASS] SWT Single Sentence Form   -> Form Score: {r.get('form_score')}/1, Single Sentence: {r.get('is_single_sentence')}")
        else:
            print(f"[FAIL] SWT Single Sentence Form   -> {res}")
            all_pass = False
except Exception as e:
    print(f"[FAIL] SWT Single Sentence Form   -> Error: {e}")
    all_pass = False

print("\n" + ("="*58))
if all_pass:
    print(">>> ALL PHASE 6 SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME SMOKE TESTS FAILED <<<")
    sys.exit(1)
