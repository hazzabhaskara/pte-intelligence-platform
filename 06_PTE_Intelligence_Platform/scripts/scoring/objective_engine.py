#!/usr/bin/env python3
"""
PTE Intelligence Platform - Objective Scoring Engine.
Deterministic, mathematically exact scoring for Pearson PTE Academic Reading & Listening item types.
Zero external API dependencies, zero cost, and sub-millisecond execution.

Supported Item Types & Rules:
1. Fill in the Blanks (R_FIB, L_FIB, RW_FIB): +1 per correct blank with casing & punctuation normalization.
2. Negative Marking (R_MCM, L_MCM, HIW): +1 correct, -1 incorrect, strictly floored at 0 (never negative).
3. Re-order Paragraphs (RO): +1 per correct adjacent contiguous pair.
4. Write From Dictation (WFD): +1 per correct word with casing/spelling tolerance.
5. Multiple Choice Single Answer (R_MCS, L_MCS, HCS, SMW): Binary 1 or 0.
"""

import re
from typing import List, Dict, Any, Union

def normalize_text(text: str) -> str:
    """Normalizes string for comparison: lowercase, trim, strip punctuation."""
    if not text:
        return ""
    # Strip leading/trailing non-alphanumeric characters while keeping internal apostrophes
    cleaned = re.sub(r'^[^\w]+|[^\w]+$', '', text.strip().lower())
    return cleaned

def score_fib(user_answers: List[str], canonical_answers: List[str], alternate_spellings: List[List[str]] = None) -> Dict[str, Any]:
    """
    Scores Fill in the Blanks items (R_FIB, L_FIB, RW_FIB).
    Partial credit: +1 point per blank correctly filled.
    """
    max_score = len(canonical_answers)
    raw_score = 0
    breakdown = []

    for i in range(max_score):
        user_val = normalize_text(user_answers[i]) if i < len(user_answers) else ""
        canonical_val = normalize_text(canonical_answers[i])
        
        # Accepted alternatives (e.g. UK/US spellings)
        accepted = [canonical_val]
        if alternate_spellings and i < len(alternate_spellings):
            accepted.extend([normalize_text(alt) for alt in alternate_spellings[i]])

        is_correct = user_val in accepted
        if is_correct:
            raw_score += 1

        breakdown.append({
            "blank_index": i + 1,
            "user_input": user_val,
            "canonical": canonical_val,
            "is_correct": is_correct,
            "points": 1 if is_correct else 0
        })

    return {
        "scoring_rule": "PARTIAL_CREDIT_PER_BLANK",
        "raw_score": raw_score,
        "max_score": max_score,
        "percentage": round((raw_score / max_score) * 100, 1) if max_score > 0 else 0.0,
        "breakdown": breakdown
    }

def score_negative_marking(user_selected: List[str], correct_options: List[str], max_score: int = None) -> Dict[str, Any]:
    """
    Scores Multiple Choice Multiple Answers (R_MCM, L_MCM) and Highlight Incorrect Words (HIW).
    Official Pearson Rule: +1 for correct, -1 for incorrect, minimum score is 0 (floored).
    """
    norm_user = {normalize_text(x) for x in user_selected if x}
    norm_correct = {normalize_text(x) for x in correct_options if x}
    
    total_possible = max_score if max_score is not None else len(norm_correct)
    
    correct_picks = norm_user.intersection(norm_correct)
    incorrect_picks = norm_user.difference(norm_correct)
    
    correct_count = len(correct_picks)
    incorrect_count = len(incorrect_picks)
    
    calculated_raw = correct_count - incorrect_count
    final_score = max(0, calculated_raw) # Strictly floored at 0
    floor_applied = calculated_raw < 0

    return {
        "scoring_rule": "NEGATIVE_MARKING_FLOORED_AT_ZERO",
        "raw_score": final_score,
        "max_score": total_possible,
        "correct_picks": list(correct_picks),
        "incorrect_picks": list(incorrect_picks),
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "unfloored_calculation": calculated_raw,
        "floor_applied": floor_applied,
        "percentage": round((final_score / total_possible) * 100, 1) if total_possible > 0 else 0.0
    }

def score_reorder_paragraphs(user_order: List[str], canonical_order: List[str]) -> Dict[str, Any]:
    """
    Scores Re-order Paragraphs (RO).
    Official Pearson Rule: +1 point per correct adjacent contiguous pair in the sequence.
    Example: Canonical [A, B, C, D] has 3 pairs: (A,B), (B,C), (C,D).
    """
    if len(canonical_order) < 2:
        return {"raw_score": 0, "max_score": 0, "matched_pairs": []}

    canonical_pairs = set()
    for i in range(len(canonical_order) - 1):
        canonical_pairs.add((normalize_text(canonical_order[i]), normalize_text(canonical_order[i+1])))

    user_pairs = []
    for i in range(len(user_order) - 1):
        user_pairs.append((normalize_text(user_order[i]), normalize_text(user_order[i+1])))

    matched_pairs = []
    unmatched_pairs = []

    for pair in user_pairs:
        if pair in canonical_pairs:
            matched_pairs.append(pair)
        else:
            unmatched_pairs.append(pair)

    raw_score = len(matched_pairs)
    max_score = len(canonical_pairs)

    return {
        "scoring_rule": "ADJACENT_PAIR_MATCHING",
        "raw_score": raw_score,
        "max_score": max_score,
        "matched_pairs": [f"{p[0]} -> {p[1]}" for p in matched_pairs],
        "unmatched_pairs": [f"{p[0]} -> {p[1]}" for p in unmatched_pairs],
        "percentage": round((raw_score / max_score) * 100, 1) if max_score > 0 else 0.0
    }

def score_write_from_dictation(user_sentence: str, canonical_sentence: str, alternate_spellings: Dict[str, List[str]] = None) -> Dict[str, Any]:
    """
    Scores Write From Dictation (WFD).
    Official Pearson Rule: Partial credit. +1 point for each correctly spelled word from the prompt sentence.
    """
    def tokenize(sentence: str) -> List[str]:
        # Split on whitespace and strip extraneous punctuation while preserving internal apostrophes
        words = []
        for token in sentence.strip().split():
            clean = normalize_text(token)
            if clean:
                words.append(clean)
        return words

    user_tokens = tokenize(user_sentence)
    canonical_tokens = tokenize(canonical_sentence)
    max_score = len(canonical_tokens)

    # Count word matches with duplicate protection
    user_pool = list(user_tokens)
    matched_words = []
    missing_words = []

    for expected_word in canonical_tokens:
        accepted_variants = [expected_word]
        if alternate_spellings and expected_word in alternate_spellings:
            accepted_variants.extend([normalize_text(x) for x in alternate_spellings[expected_word]])

        matched_variant = None
        for variant in accepted_variants:
            if variant in user_pool:
                matched_variant = variant
                break

        if matched_variant:
            matched_words.append(expected_word)
            user_pool.remove(matched_variant)
        else:
            missing_words.append(expected_word)

    raw_score = len(matched_words)

    return {
        "scoring_rule": "PARTIAL_CREDIT_PER_WORD",
        "raw_score": raw_score,
        "max_score": max_score,
        "matched_words": matched_words,
        "missing_words": missing_words,
        "extra_words": user_pool,
        "percentage": round((raw_score / max_score) * 100, 1) if max_score > 0 else 0.0
    }

def score_single_choice(user_choice: str, correct_choice: str) -> Dict[str, Any]:
    """
    Scores Multiple Choice Single Answer (R_MCS, L_MCS, HCS, SMW).
    Binary scoring: 1 point if exact match, 0 otherwise.
    """
    is_correct = normalize_text(user_choice) == normalize_text(correct_choice)
    return {
        "scoring_rule": "BINARY_SINGLE_CHOICE",
        "raw_score": 1 if is_correct else 0,
        "max_score": 1,
        "is_correct": is_correct,
        "percentage": 100.0 if is_correct else 0.0
    }

def evaluate_submission(type_code: str, user_submission: Any, canonical_data: Any) -> Dict[str, Any]:
    """Master evaluator routing submissions to specific objective rule functions."""
    tc = type_code.upper()
    if tc in ["R_FIB", "L_FIB", "RW_FIB"]:
        user_list = user_submission if isinstance(user_submission, list) else [user_submission]
        canon_list = canonical_data if isinstance(canonical_data, list) else [canonical_data]
        return score_fib(user_list, canon_list)
    elif tc in ["R_MCM", "L_MCM", "HIW"]:
        user_list = user_submission if isinstance(user_submission, list) else [user_submission]
        canon_list = canonical_data if isinstance(canonical_data, list) else [canonical_data]
        return score_negative_marking(user_list, canon_list)
    elif tc == "RO":
        user_list = user_submission if isinstance(user_submission, list) else [user_submission]
        canon_list = canonical_data if isinstance(canonical_data, list) else [canonical_data]
        return score_reorder_paragraphs(user_list, canon_list)
    elif tc == "WFD":
        return score_write_from_dictation(str(user_submission), str(canonical_data))
    elif tc in ["R_MCS", "L_MCS", "HCS", "SMW"]:
        return score_single_choice(str(user_submission), str(canonical_data))
    else:
        # Fallback for holistic / open-ended types
        return {
            "scoring_rule": "OPEN_ENDED_REQUIRES_AI",
            "raw_score": 0,
            "max_score": 10,
            "status": "DEFERRED_TO_LLM_EVALUATION"
        }

if __name__ == "__main__":
    print("--- Testing Objective Scoring Engine Functions ---")
    print("1. FIB:", score_fib(["apple", "banana"], ["apple", "banana"]))
    print("2. Negative Marking (Floor 0):", score_negative_marking(["A", "C"], ["A", "B"]))
    print("3. Reorder:", score_reorder_paragraphs(["A", "B", "D", "C"], ["A", "B", "C", "D"]))
    print("4. WFD:", score_write_from_dictation("Library orientation starts at ten.", "The library orientation session starts at ten o'clock."))
