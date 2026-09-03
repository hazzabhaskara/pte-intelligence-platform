#!/usr/bin/env python3
"""
PTE Intelligence Platform - Original Question Generator Worker.
Synthesizes 100% original, copyright-clean PTE Academic practice items based on
pedagogical blueprints for all 22 question types.

Dual-Engine Architecture:
1. Ollama LLM Engine: Connects to local Ollama API (http://localhost:11434) when active.
2. Deterministic Blueprint Engine (Fallback / Offline): High-fidelity academic corpus
   covering CEFR A2-B1 topics (Australia, Science, Campus Life, Workplace).
"""

import argparse
import hashlib
import json
from pathlib import Path
import random
import sqlite3
import urllib.request
import uuid

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# High-fidelity deterministic academic templates for offline / fast fallback
OFFLINE_TEMPLATES = {
    "RA": [
        {
            "prompt": "Solar energy adoption has accelerated significantly across regional Australia over the past decade. Favorable government incentives, coupled with abundant year-round sunshine, have prompted both domestic homeowners and agricultural enterprises to invest heavily in decentralized photovoltaic infrastructure.",
            "cefr": "B1", "time": 40, "key": "Fluency and pronunciation assessment; accurate delivery of polysyllabic words."
        },
        {
            "prompt": "Marine biologists studying the Great Barrier Reef emphasize the critical importance of coral resilience against warming ocean temperatures. Collaborative conservation initiatives between indigenous ranger groups and university researchers are actively testing heat-tolerant coral propagation techniques.",
            "cefr": "B1", "time": 40, "key": "Intelligibility and smooth phrasal chunking with appropriate pauses."
        },
        {
            "prompt": "The rapid expansion of remote work opportunities in Australia has transformed regional housing dynamics. Many skilled professionals are relocating from capital cities to coastal townships, fostering localized economic growth while placing unprecedented pressure on municipal infrastructure.",
            "cefr": "B1", "time": 40, "key": "Clear stress on contrastive clauses and compound sentences."
        }
    ],
    "RS": [
        {
            "prompt": "The library orientation session for postgraduate students will commence at ten o'clock.",
            "cefr": "B1", "time": 15, "key": "The library orientation session for postgraduate students will commence at ten o'clock."
        },
        {
            "prompt": "Please submit your completed assignment through the university student portal before midnight.",
            "cefr": "B1", "time": 15, "key": "Please submit your completed assignment through the university student portal before midnight."
        },
        {
            "prompt": "Safety goggles must be worn at all times inside the chemical engineering laboratory.",
            "cefr": "B1", "time": 15, "key": "Safety goggles must be worn at all times inside the chemical engineering laboratory."
        }
    ],
    "RTS": [
        {
            "prompt": "You are working as a customer assistant at a community centre in Sydney. A visitor approaches your desk and asks how to renew their municipal sports facility membership. Respond politely, explaining the simple online procedure and offering a physical registration form if needed.",
            "cefr": "B1", "time": 40, "key": "Hello! You can easily renew your membership online through our municipal website. Alternatively, I can provide you with a printed registration form right here if you prefer."
        },
        {
            "prompt": "You arrive at your shared university apartment and notice that the kitchen refrigerator has stopped cooling. Leave a courteous voice message for your property manager explaining the problem, the spoiled food risk, and requesting an urgent technician visit.",
            "cefr": "B1", "time": 40, "key": "Hi, this is a tenant from Apartment 4B. Our refrigerator stopped cooling this morning. Could you please send a maintenance technician as soon as possible to check it? Thank you."
        }
    ],
    "SGD": [
        {
            "prompt": "Listen to a committee discussion between Sarah, David, and Liam regarding the introduction of electric shuttle buses on campus. Sarah supports the green initiative, David expresses concern over initial capital cost, and Liam proposes a phased pilot trial. Summarize their perspectives and consensus.",
            "cefr": "B1", "time": 120, "key": "The committee discussed transitioning to campus electric shuttles. Sarah highlighted the environmental sustainability benefits, while David raised concerns regarding initial purchase costs. Ultimately, Liam synthesized both viewpoints by recommending a three-month pilot program with leased vehicles, which all members agreed to support."
        }
    ],
    "SWT": [
        {
            "prompt": "Urban agriculture has emerged as a promising strategy for enhancing food security in metropolitan centers. By converting underutilized rooftops, vacant industrial lots, and vertical hydroponic walls into productive agricultural spaces, cities can dramatically reduce transportation emissions associated with rural food logistics. Furthermore, community gardens provide invaluable educational and mental health benefits for urban residents. However, high initial installation costs and strict municipal zoning regulations remain formidable barriers to widespread commercial scaling. Policy makers must harmonize municipal building codes and provide targeted financial subsidies to enable urban farms to achieve long-term economic viability.",
            "cefr": "B1", "time": 600, "key": "Although urban agriculture enhances food security and community well-being while reducing emissions, its widespread expansion requires municipal policy reforms and financial support to overcome prohibitive startup expenses."
        }
    ],
    "WE": [
        {
            "prompt": "Some people believe that artificial intelligence will eliminate many entry-level employment opportunities for university graduates, while others argue it will create entirely new categories of high-value jobs. Discuss both views and give your own opinion.",
            "cefr": "B1", "time": 1200, "key": "A 200-300 word balanced argumentative essay containing an introductory thesis, two supporting body paragraphs with concrete workplace examples, and a decisive conclusion."
        },
        {
            "prompt": "With the rise of online streaming and digital learning platforms, some argue that public libraries in regional communities have become obsolete. To what extent do you agree or disagree with this view?",
            "cefr": "B1", "time": 1200, "key": "A 200-300 word argumentative essay addressing the essential role of public libraries as community connectivity hubs, digital access centers, and lifelong learning spaces."
        }
    ],
    "WFD": [
        {
            "prompt": "The university health clinic provides confidential mental health support services for all enrolled students.",
            "cefr": "B1", "time": 45, "key": "The university health clinic provides confidential mental health support services for all enrolled students."
        },
        {
            "prompt": "Recent archaeological discoveries have challenged conventional theories regarding ancient Pacific maritime trade routes.",
            "cefr": "B1", "time": 45, "key": "Recent archaeological discoveries have challenged conventional theories regarding ancient Pacific maritime trade routes."
        },
        {
            "prompt": "Engineering students are required to complete twelve weeks of accredited industrial work placement.",
            "cefr": "B1", "time": 45, "key": "Engineering students are required to complete twelve weeks of accredited industrial work placement."
        }
    ],
    "R_FIB": [
        {
            "prompt": "Renewable energy technologies have experienced [remarkable] cost reductions over recent years. As battery storage systems become increasingly [efficient], solar and wind power can reliably supply the national grid, providing a sustainable [alternative] to conventional fossil fuel generation while lowering greenhouse gas [emissions].",
            "cefr": "B1", "time": 120, "key": "Blank 1: remarkable | Blank 2: efficient | Blank 3: alternative | Blank 4: emissions (Distractors: temporary, hazardous, luxury)"
        }
    ],
    "RW_FIB": [
        {
            "prompt": "Biodiversity conservation plays a crucial [role] in maintaining ecosystem stability. When a keystone species is removed, the delicate balance of ecological interactions is severely [disrupted], leading to unexpected declines in flora and fauna populations. Researchers must [collaborate] with local authorities to design protected corridors that [facilitate] wildlife migration.",
            "cefr": "B1", "time": 180, "key": "1: role (duty/rank/job) | 2: disrupted (settled/delayed/enjoyed) | 3: collaborate (compete/refuse/hesitate) | 4: facilitate (prevent/complicate/postpone)"
        }
    ]
}

def is_ollama_available():
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", headers={"User-Agent": "PTE-Gen/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                return len(data.get("models", [])) > 0
    except Exception:
        pass
    return False

def generate_via_ollama(type_code: str, pattern: str, topic: str = None):
    """Generates original item via local Ollama API."""
    prompt_instruction = f"""You are a professional PTE Academic item writer.
Create ONE 100% original, brand-new practice test question for PTE Academic.
Question Type: {type_code}
Blueprint Specification: {pattern}
Topic Area: {topic or 'Australian Science, Environment, or University Campus Life'}
Target Level: CEFR B1 (Functional English).

CRITICAL CONSTRAINTS:
- Do NOT copy any actual Pearson exam questions or copyrighted books.
- The output MUST be valid JSON with the following structure:
{{
  "prompt_text": "the actual question text or passage",
  "canonical_answer": "the expected answer, summary, or reference transcript",
  "alternate_spellings": ["optional alternative spelling if applicable"],
  "estimated_time_seconds": 45,
  "cefr_level": "B1"
}}
Return ONLY JSON. Do not include markdown formatting or explanations.
"""
    payload = json.dumps({
        "model": "qwen2.5:7b-instruct",
        "prompt": prompt_instruction,
        "stream": False,
        "format": "json"
    }).encode("utf-8")

    req = urllib.request.Request(
        OLLAMA_API_URL,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        raw_text = res.get("response", "{}")
        return json.loads(raw_text)

def generate_question(type_code: str, topic: str = None, force_deterministic: bool = False):
    """Generates a question item using either Ollama or Deterministic Fallback."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT blueprint_id, target_difficulty, prompt_structural_pattern, grammatical_focus
    FROM question_blueprints
    WHERE type_code = ?
    """, (type_code,))
    bp_row = cursor.fetchone()

    if not bp_row:
        conn.close()
        raise ValueError(f"Blueprint for question type '{type_code}' not found in database.")

    blueprint_id, target_difficulty, pattern, grammar = bp_row

    item_data = None
    gen_model = "Deterministic-Blueprint-v1"

    # Try Ollama if available and not forced deterministic
    if not force_deterministic and is_ollama_available():
        try:
            print(f"[GENERATOR] Generating {type_code} via Ollama Local LLM...")
            parsed = generate_via_ollama(type_code, pattern, topic)
            if parsed and "prompt_text" in parsed:
                item_data = parsed
                gen_model = "Ollama-Local-Qwen2.5"
        except Exception as e:
            print(f"[GENERATOR] Ollama call failed: {e}. Falling back to deterministic engine.")

    # Deterministic Academic Fallback
    if not item_data:
        templates = OFFLINE_TEMPLATES.get(type_code)
        if templates:
            sample = random.choice(templates)
            item_data = {
                "prompt_text": sample["prompt"],
                "canonical_answer": sample["key"],
                "alternate_spellings": [],
                "estimated_time_seconds": sample.get("time", 60),
                "cefr_level": sample.get("cefr", "B1")
            }
        else:
            # Generic structured placeholder for types without explicit fixture
            item_data = {
                "prompt_text": f"Academic exercise prompt for {type_code}: Examining {topic or 'sustainable urban environments'} and regional policy implementation.",
                "canonical_answer": f"Standard B1 reference response demonstrating vocabulary accuracy and phrasal coherence.",
                "alternate_spellings": [],
                "estimated_time_seconds": 60,
                "cefr_level": "B1"
            }

    prompt_text = item_data["prompt_text"]
    canonical_answer = item_data["canonical_answer"]
    sha256 = hashlib.sha256(prompt_text.encode("utf-8")).hexdigest()

    item_id = f"ITEM-{type_code}-{uuid.uuid4().hex[:8].upper()}"

    cursor.execute("""
    INSERT INTO original_exercise_items (
        item_id, blueprint_id, type_code, prompt_text, cefr_level, difficulty_level,
        estimated_time_seconds, uniqueness_hash, copyright_status, approval_status,
        generation_model, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ORIGINAL_AI_SYNTHESIZED', 'APPROVED', ?, CURRENT_TIMESTAMP)
    """, (
        item_id,
        blueprint_id,
        type_code,
        prompt_text,
        item_data.get("cefr_level", "B1"),
        target_difficulty,
        item_data.get("estimated_time_seconds", 60),
        sha256,
        gen_model
    ))

    # Insert Answer Key
    key_id = f"KEY-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
    INSERT INTO answer_keys (
        key_id, item_id, accepted_canonical_text, alternate_spellings, key_order, points_weight
    ) VALUES (?, ?, ?, ?, 1, 1.0)
    """, (
        key_id,
        item_id,
        canonical_answer,
        json.dumps(item_data.get("alternate_spellings", []))
    ))

    conn.commit()
    conn.close()

    return {
        "item_id": item_id,
        "blueprint_id": blueprint_id,
        "type_code": type_code,
        "prompt_text": prompt_text,
        "canonical_answer": canonical_answer,
        "cefr_level": item_data.get("cefr_level", "B1"),
        "difficulty_level": target_difficulty,
        "generation_model": gen_model,
        "sha256": sha256
    }

def seed_sample_bank():
    """Seeds initial practice set across key question types."""
    print("--- Generating Starter Question Bank for Practice ---")
    types_to_seed = ["RA", "RS", "RTS", "SGD", "SWT", "WE", "WFD", "R_FIB", "RW_FIB"]
    created_items = []
    for tc in types_to_seed:
        res = generate_question(tc, force_deterministic=True)
        created_items.append(res)
        print(f"  [CREATED] {res['item_id']} ({res['type_code']}) - Hash: {res['sha256'][:10]}...")
    print(f"\n>>> Seeded {len(created_items)} Original Practice Items Successfully <<<")
    return created_items

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PTE Question Generator Worker")
    parser.add_argument("--type", type=str, default="RA", help="Question type code (e.g. RA, WFD, RTS)")
    parser.add_argument("--topic", type=str, help="Optional topic hint")
    parser.add_argument("--seed-sample", action="store_true", help="Seed a starter set of practice items")
    parser.add_argument("--force-deterministic", action="store_true", help="Force deterministic generation without Ollama")
    args = parser.parse_args()

    if args.seed_sample:
        seed_sample_bank()
    else:
        res = generate_question(args.type, args.topic, args.force_deterministic)
        print("\n--- Generated Item ---")
        print(json.dumps(res, indent=2))
