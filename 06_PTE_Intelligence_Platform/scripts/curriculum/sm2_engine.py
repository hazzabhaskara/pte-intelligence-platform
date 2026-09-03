#!/usr/bin/env python3
"""
PTE Intelligence Platform - Spaced Repetition (SM-2) & Adaptive Remediation Engine.
Implements the SuperMemo SM-2 memory retention algorithm and Pearson PTE high-impact weighting.
"""

from typing import Dict, Any, List

def calculate_sm2_interval(
    repetition: int,
    easiness_factor: float,
    current_interval: int,
    quality: int
) -> Dict[str, Any]:
    """
    SuperMemo SM-2 algorithm calculation:
    quality: 0 (blackout) to 5 (perfect response)
    """
    q = max(0, min(5, int(quality)))
    ef = max(1.3, float(easiness_factor))

    if q < 3:
        # Failed recall - reset repetitions
        new_repetition = 0
        new_interval = 1
    else:
        # Successful recall
        if repetition == 0:
            new_interval = 1
        elif repetition == 1:
            new_interval = 6
        else:
            new_interval = int(round(current_interval * ef))
        new_repetition = repetition + 1

    # Update Easiness Factor (EF)
    # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    delta_ef = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    new_ef = round(max(1.3, ef + delta_ef), 2)

    return {
        "repetition": new_repetition,
        "easiness_factor": new_ef,
        "interval_days": new_interval,
        "quality_rated": q,
        "status": "DUE_FOR_REVIEW" if new_interval <= 1 else "MEMORIZED_INTERVAL"
    }

# Pearson PTE Cross-Skill Impact Weights (Highest scoring leverage for WHV 462)
HIGH_IMPACT_WEIGHTS = {
    "WFD": {"weight": 1.00, "cross_skills": ["Listening", "Writing"], "name": "Write From Dictation"},
    "RA":  {"weight": 0.95, "cross_skills": ["Speaking", "Reading"],   "name": "Read Aloud"},
    "RS":  {"weight": 0.90, "cross_skills": ["Speaking", "Listening"], "name": "Repeat Sentence"},
    "RW_FIB": {"weight": 0.88, "cross_skills": ["Reading", "Writing"], "name": "Reading & Writing FIB"},
    "R_FIB":  {"weight": 0.85, "cross_skills": ["Reading"],             "name": "Reading Fill in the Blanks"},
    "SWT": {"weight": 0.80, "cross_skills": ["Reading", "Writing"],    "name": "Summarize Written Text"},
    "WE":  {"weight": 0.78, "cross_skills": ["Writing"],              "name": "Write Essay"},
    "RTS": {"weight": 0.75, "cross_skills": ["Speaking"],             "name": "Respond to a Situation ⭐"},
    "SGD": {"weight": 0.75, "cross_skills": ["Speaking"],             "name": "Summarize Group Discussion ⭐"}
}

def analyze_remediation_needs(user_accuracies: Dict[str, float]) -> List[Dict[str, Any]]:
    """
    Identifies high-impact question types that urgently require remediation.
    Urgency Score = (1.0 - accuracy) * impact_weight.
    """
    remediation_queue = []

    for type_code, meta in HIGH_IMPACT_WEIGHTS.items():
        acc = user_accuracies.get(type_code, 0.5) # Default 50% baseline if untried
        urgency = round((1.0 - acc) * meta["weight"] * 100, 1)

        is_urgent = acc < 0.60 and meta["weight"] >= 0.85
        status = "REMEDIATION_URGENT" if is_urgent else ("REINFORCE_SAFE" if acc >= 0.75 else "NEEDS_PRACTICE")

        remediation_queue.append({
            "type_code": type_code,
            "name": meta["name"],
            "cross_skills": meta["cross_skills"],
            "impact_weight": meta["weight"],
            "current_accuracy_pct": round(acc * 100, 1),
            "urgency_score": urgency,
            "remediation_status": status,
            "recommended_daily_drills": 5 if is_urgent else 2
        })

    # Sort by highest urgency score
    remediation_queue.sort(key=lambda x: x["urgency_score"], reverse=True)
    return remediation_queue

if __name__ == "__main__":
    print("SM-2 Test (Quality 4):", calculate_sm2_interval(0, 2.5, 1, 4))
    print("Remediation Sample:", analyze_remediation_needs({"WFD": 0.45, "RA": 0.85}))
