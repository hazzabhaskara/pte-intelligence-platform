#!/usr/bin/env python3
"""
Automated Smoke Test for Phase 1 Web Application.
Tests HTTP 200 on all web pages and JSON APIs.
"""

import urllib.request
import json
import sys

endpoints = [
    ("Home Page", "http://localhost:3005/"),
    ("Setup Wizard Page", "http://localhost:3005/setup"),
    ("Drafts Audit Page", "http://localhost:3005/drafts"),
    ("Probe API", "http://localhost:3005/api/setup/probe"),
    ("Drafts API", "http://localhost:3005/api/drafts")
]

all_pass = True

print("=== Phase 1 Local Smoke Test (http://localhost:3005) ===\n")

for label, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmokeTest/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body = resp.read()
            c_type = resp.headers.get("Content-Type", "")
            
            if status == 200:
                print(f"[PASS] {label:20} -> HTTP {status} ({len(body)} bytes, {c_type})")
                if "application/json" in c_type:
                    parsed = json.loads(body.decode("utf-8"))
                    print(f"       -> JSON Success: {parsed.get('success')}")
                    if "data" in parsed:
                        print(f"       -> Probe Info: Node {parsed['data']['node']['version']}, Tables {parsed['data']['database']['table_count']}")
                    if "sources" in parsed:
                        print(f"       -> DB Data: {len(parsed['sources'])} sources, {len(parsed['claims'])} claims")
            else:
                print(f"[FAIL] {label:20} -> HTTP {status}")
                all_pass = False
    except Exception as e:
        print(f"[FAIL] {label:20} -> Error: {e}")
        all_pass = False

print("\n" + ("="*56))
if all_pass:
    print(">>> ALL SMOKE TESTS PASSED (100% OPERATIONAL) <<<")
    sys.exit(0)
else:
    print(">>> SOME TESTS FAILED <<<")
    sys.exit(1)
