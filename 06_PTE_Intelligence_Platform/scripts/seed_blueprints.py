#!/usr/bin/env python3
"""
PTE Intelligence Platform - Question Blueprint Catalog Seeder.
Populates `question_blueprints` table for all 22 PTE Academic Question Types
(including the 2 post-August 2025 question types: RTS and SGD).
"""

import json
from pathlib import Path
import sqlite3

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = WORKSPACE_ROOT / "data" / "app_storage.sqlite3"

BLUEPRINTS = [
    # --- SPEAKING & WRITING ---
    {
        "blueprint_id": "BP-RA-01",
        "type_code": "RA",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Academic or scientific expository paragraph consisting of 2-3 compound-complex sentences (40-65 words). Focuses on neutral tone, natural punctuation pauses, and polysyllabic academic vocabulary.",
        "grammatical_focus": "Passive voice, relative clauses, academic collocations.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"prep_time": 35, "response_time": 40, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-RS-01",
        "type_code": "RS",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Authentic campus/workplace imperative or declarative sentence (8-14 words). Delivers instructions, deadlines, or campus logistics with clear acoustic pacing.",
        "grammatical_focus": "Modal verbs, prepositional phrases, noun adjuncts.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"duration_sec": 4, "prep_time": 3, "response_time": 15, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-DI-01",
        "type_code": "DI",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Data visualization (bar chart, line graph, pie chart, or process diagram) showing trends, extreme values (highest/lowest), and overall comparative summary.",
        "grammatical_focus": "Comparative and superlative forms, trend verbs (surged, declined, plateaued), time markers.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"prep_time": 25, "response_time": 40, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-RL-01",
        "type_code": "RL",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Academic mini-lecture audio (60-90 seconds) presenting a core scientific or historical thesis supported by 3 main empirical arguments and an evaluative conclusion.",
        "grammatical_focus": "Cause-and-effect connectors, attribution markers, academic register.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"duration_sec": 75, "prep_time": 10, "response_time": 40, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-ASQ-01",
        "type_code": "ASQ",
        "target_difficulty": "DIFF_EASY",
        "prompt_structural_pattern": "Short factual question requiring a 1-to-2 word direct English answer based on everyday logic, simple geography, or fundamental science.",
        "grammatical_focus": "Wh- questions, direct interrogatives.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"duration_sec": 4, "prep_time": 1, "response_time": 10, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-RTS-01",
        "type_code": "RTS",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Short social or professional situation scenario (40-70 words). The examinee must formulate an appropriate spontaneous spoken reply adhering to social register (politeness, clarity, problem solving).",
        "grammatical_focus": "Polite requests (Could you..., I was wondering if...), apologies, and pragmatic hedging.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"prep_time": 10, "response_time": 40, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-SGD-01",
        "type_code": "SGD",
        "target_difficulty": "DIFF_HARD",
        "prompt_structural_pattern": "Conversational audio of a 3-person group discussion (2-3 minutes) debating a work, academic, or community proposal. Examinee must synthesize speaker stances, points of consensus, and unresolved questions.",
        "grammatical_focus": "Reported speech, perspective contrasts (While speaker A contended..., speaker B pointed out...), synthesis connectors.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"duration_sec": 120, "prep_time": 10, "response_time": 120, "mic_3s_rule": True})
    },
    {
        "blueprint_id": "BP-SWT-01",
        "type_code": "SWT",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Expository reading text (150-300 words). The examinee must write a single full grammatical sentence (5-75 words) summarizing the central premise and primary supportive argument.",
        "grammatical_focus": "Complex sentence structures, subordinating conjunctions (although, while, whereas), non-finite participle clauses.",
        "distractor_generation_rules": None,
        "audio_requirements": None
    },
    {
        "blueprint_id": "BP-WE-01",
        "type_code": "WE",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Persuasive essay prompt (20-40 words) presenting a controversial social, technological, or environmental issue. Examinee writes a 200-300 word essay with thesis, balanced arguments, and conclusion.",
        "grammatical_focus": "Paragraph transitions, modal certainty, argumentative discourse markers, conditional clauses.",
        "distractor_generation_rules": None,
        "audio_requirements": None
    },

    # --- READING ---
    {
        "blueprint_id": "BP-R-MCM-01",
        "type_code": "R_MCM",
        "target_difficulty": "DIFF_HARD",
        "prompt_structural_pattern": "Academic reading passage (150-250 words) accompanied by a multiple-choice question with 5-7 options, where 2 or 3 are correct. Negative marking applies (-1 per incorrect, floor at 0).",
        "grammatical_focus": "Inference deduction, textual paraphrase recognition.",
        "distractor_generation_rules": json.dumps({"distractor_count": 3, "correct_count": 2, "penalty": -1.0, "floor": 0.0}),
        "audio_requirements": None
    },
    {
        "blueprint_id": "BP-R-MCS-01",
        "type_code": "R_MCS",
        "target_difficulty": "DIFF_EASY",
        "prompt_structural_pattern": "Short passage (100-180 words) with 4 options and exactly 1 correct answer identifying the main idea, author purpose, or a specific factual detail.",
        "grammatical_focus": "Direct reference, synonym matching.",
        "distractor_generation_rules": json.dumps({"distractor_count": 3, "correct_count": 1, "penalty": 0.0}),
        "audio_requirements": None
    },
    {
        "blueprint_id": "BP-RO-01",
        "type_code": "RO",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "A coherent text broken into 4-5 jumbled paragraphs. Sentences contain lexical and referential cohesion markers (pronouns, demonstratives, transitional adverbs).",
        "grammatical_focus": "Cohesion markers (this, these, furthermore, subsequently), chronological sequencing.",
        "distractor_generation_rules": json.dumps({"scoring": "Pairwise adjacent ordering (+1 pt per correct pair)"}),
        "audio_requirements": None
    },
    {
        "blueprint_id": "BP-R-FIB-01",
        "type_code": "R_FIB",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Text passage (60-110 words) with 4-5 blanks. A pool of 6-8 words is provided at the bottom for drag-and-drop selection.",
        "grammatical_focus": "Parts of speech compatibility (noun, verb, adjective, adverb) and contextual fit.",
        "distractor_generation_rules": json.dumps({"blank_count": 4, "word_pool_count": 7}),
        "audio_requirements": None
    },
    {
        "blueprint_id": "BP-RW-FIB-01",
        "type_code": "RW_FIB",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Integrated passage (150-250 words) with 4-5 inline dropdown blanks. Each dropdown provides 4 choices testing collocations, prepositions, and subtle semantic distinctions.",
        "grammatical_focus": "Academic collocations (e.g. 'play a role in', 'confer an advantage'), verb prepositions.",
        "distractor_generation_rules": json.dumps({"blank_count": 5, "options_per_blank": 4}),
        "audio_requirements": None
    },

    # --- LISTENING ---
    {
        "blueprint_id": "BP-SST-01",
        "type_code": "SST",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Spoken academic lecture audio (60-90 seconds). Examinee writes a 50-70 word summary in paragraph form capturing core topic, mechanisms, and implications.",
        "grammatical_focus": "Precise summary syntax, academic nouns, strict word limit management (50-70 words).",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"duration_sec": 75, "response_time_sec": 600})
    },
    {
        "blueprint_id": "BP-L-MCM-01",
        "type_code": "L_MCM",
        "target_difficulty": "DIFF_HARD",
        "prompt_structural_pattern": "Audio excerpt (40-90 seconds) with 5-7 options, where multiple options are correct. Negative marking applies (-1 per incorrect, floor at 0).",
        "grammatical_focus": "Listening for detail, distinguishing stated facts from speaker speculation.",
        "distractor_generation_rules": json.dumps({"distractor_count": 3, "correct_count": 2, "penalty": -1.0, "floor": 0.0}),
        "audio_requirements": json.dumps({"duration_sec": 60})
    },
    {
        "blueprint_id": "BP-L-FIB-01",
        "type_code": "L_FIB",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Audio recording (30-60 seconds) accompanied by a written transcript with 2-3 missing words. Examinee must type exact words heard.",
        "grammatical_focus": "Accurate transcription of plural endings (-s/-es), past tense inflections (-ed), and exact spelling.",
        "distractor_generation_rules": json.dumps({"blank_count": 3}),
        "audio_requirements": json.dumps({"duration_sec": 45})
    },
    {
        "blueprint_id": "BP-HCS-01",
        "type_code": "HCS",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Spoken presentation (30-90 seconds) followed by 4 summary options. Exactly one accurately encapsulates the entire audio without omissions or distortions.",
        "grammatical_focus": "Global audio synthesis, identifying overgeneralized or unstated claims in distractors.",
        "distractor_generation_rules": json.dumps({"distractor_count": 3, "correct_count": 1}),
        "audio_requirements": json.dumps({"duration_sec": 60})
    },
    {
        "blueprint_id": "BP-L-MCS-01",
        "type_code": "L_MCS",
        "target_difficulty": "DIFF_EASY",
        "prompt_structural_pattern": "Brief dialogue or monologue (30-60 seconds) with 4 options and 1 correct answer assessing speaker attitude, main purpose, or a stated fact.",
        "grammatical_focus": "Intonation analysis, communicative purpose.",
        "distractor_generation_rules": json.dumps({"distractor_count": 3, "correct_count": 1}),
        "audio_requirements": json.dumps({"duration_sec": 40})
    },
    {
        "blueprint_id": "BP-SMW-01",
        "type_code": "SMW",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Audio clip (20-50 seconds) where the final word or phrase is replaced by an auditory beep tone. Examinee chooses the most logical closing option from 4 choices.",
        "grammatical_focus": "Collocation completion, contextual discourse anticipation.",
        "distractor_generation_rules": json.dumps({"distractor_count": 3, "correct_count": 1}),
        "audio_requirements": json.dumps({"duration_sec": 35, "has_beep": True})
    },
    {
        "blueprint_id": "BP-HIW-01",
        "type_code": "HIW",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Audio recording (20-40 seconds) paired with a transcript where 5-7 words have been deliberately swapped with subtle lookalikes or antonyms. Negative marking applies (-1, floor 0).",
        "grammatical_focus": "Phonological precision, word boundary perception.",
        "distractor_generation_rules": json.dumps({"swapped_words_count": 6, "penalty": -1.0, "floor": 0.0}),
        "audio_requirements": json.dumps({"duration_sec": 30})
    },
    {
        "blueprint_id": "BP-WFD-01",
        "type_code": "WFD",
        "target_difficulty": "DIFF_MODERATE",
        "prompt_structural_pattern": "Spoken sentence (8-15 words) delivered at natural speed (3-6 seconds). Examinee types the exact sentence into the input box with accurate spelling and punctuation.",
        "grammatical_focus": "Short-term acoustic memory, subject-verb agreement, article usage (a/an/the), plural forms, spelling conventions.",
        "distractor_generation_rules": None,
        "audio_requirements": json.dumps({"duration_sec": 5, "response_time_sec": 45})
    }
]

def seed_blueprints():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print(f"--- Seeding {len(BLUEPRINTS)} Question Blueprints into SQLite ---")
    
    for bp in BLUEPRINTS:
        cursor.execute("""
        INSERT OR REPLACE INTO question_blueprints (
            blueprint_id, type_code, target_difficulty, prompt_structural_pattern,
            grammatical_focus, distractor_generation_rules, audio_requirements, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            bp["blueprint_id"],
            bp["type_code"],
            bp["target_difficulty"],
            bp["prompt_structural_pattern"],
            bp["grammatical_focus"],
            bp["distractor_generation_rules"],
            bp["audio_requirements"]
        ))
        print(f"  [SEED] {bp['blueprint_id']} ({bp['type_code']}) - Difficulty {bp['target_difficulty']}")
        
    conn.commit()
    cursor.execute("SELECT count(*) FROM question_blueprints")
    total = cursor.fetchone()[0]
    conn.close()
    print(f"\n>>> Total Question Blueprints in DB: {total} (All 22 Question Types Covered) <<<")
    return total

if __name__ == "__main__":
    seed_blueprints()
