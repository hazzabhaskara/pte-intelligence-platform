#!/usr/bin/env python3
"""
PTE Intelligence Platform - Local Speech Analysis & Fluency Engine (STT Worker).
Computes oral fluency metrics, WPM (Words Per Minute), pause events, and pronunciation fidelity.
Designed for local, offline execution.
"""

import re
import uuid
from typing import Dict, Any, List

def calculate_wpm(word_count: int, duration_seconds: float) -> float:
    """Calculates words per minute from word count and duration."""
    if duration_seconds <= 0:
        return 0.0
    return round((word_count / duration_seconds) * 60.0, 1)

def evaluate_oral_fluency(wpm: float) -> Dict[str, Any]:
    """
    Rates oral fluency according to Pearson PTE Academic standards.
    Optimal conversational/academic pace: 120-160 WPM.
    Functional English safe buffer (36+): >= 90 WPM.
    """
    if 120 <= wpm <= 165:
        score = 5.0
        status = "OPTIMAL_NATURAL_PACE"
        feedback = "Kecepatan berbicara sangat baik dan natural (dalam rentang optimal 120–165 WPM)."
    elif 95 <= wpm < 120:
        score = 4.0
        status = "ACCEPTABLE_PACE_SAFE"
        feedback = "Kecepatan cukup baik dan memenuhi standar aman Functional English WHV 462, namun bisa sedikit lebih lancar."
    elif 165 < wpm <= 190:
        score = 3.5
        status = "SLIGHTLY_RUSHED"
        feedback = "Berbicara agak terlalu cepat. Pertahankan artikulasi kata agar tidak mengorbankan kejelasan pengucapan."
    elif 65 <= wpm < 95:
        score = 2.5
        status = "HESITANT_SLOW"
        feedback = "Tempo berbicara agak lambat dengan indikasi jeda/keraguan. Latih kelancaran tanpa jeda lebih dari 2 detik."
    else:
        score = 1.0
        status = "SEVERELY_DISRUPTED"
        feedback = "Kecepatan berbicara di luar batas normal ujian. Berpotensi terkena penalti kelancaran Pearson."

    return {
        "fluency_score": score,
        "max_score": 5.0,
        "status": status,
        "feedback_id": feedback
    }

def analyze_pronunciation_fidelity(spoken_text: str, reference_text: str) -> Dict[str, Any]:
    """
    Compares spoken transcript tokens with reference prompt text.
    Detects matched words, omitted words, and extra additions.
    """
    def tokenize(text: str) -> List[str]:
        return [re.sub(r'[^\w]', '', w.lower()) for w in text.strip().split() if w.strip()]

    spoken_tokens = tokenize(spoken_text)
    ref_tokens = tokenize(reference_text)

    if not ref_tokens:
        return {"accuracy_percentage": 0.0, "matched_count": 0, "total_ref_words": 0}

    spoken_pool = list(spoken_tokens)
    matched = []
    omitted = []

    for expected in ref_tokens:
        if expected in spoken_pool:
            matched.append(expected)
            spoken_pool.remove(expected)
        else:
            omitted.append(expected)

    matched_count = len(matched)
    total_ref = len(ref_tokens)
    accuracy_pct = round((matched_count / total_ref) * 100.0, 1)

    # Score out of 5
    pronunciation_score = round((accuracy_pct / 100.0) * 5.0, 1)

    return {
        "pronunciation_score": pronunciation_score,
        "max_score": 5.0,
        "accuracy_percentage": accuracy_pct,
        "matched_words_count": matched_count,
        "total_ref_words": total_ref,
        "matched_words": matched,
        "omitted_words": omitted,
        "extra_words": spoken_pool
    }

def analyze_speech_response(
    spoken_text: str,
    reference_text: str,
    duration_seconds: float,
    response_id: str = None
) -> Dict[str, Any]:
    """Master speech analysis pipeline."""
    word_count = len(spoken_text.strip().split()) if spoken_text.strip() else 0
    wpm = calculate_wpm(word_count, duration_seconds)
    fluency = evaluate_oral_fluency(wpm)
    pronunciation = analyze_pronunciation_fidelity(spoken_text, reference_text)

    # Content Score (0-3 for Speaking)
    content_score = round((pronunciation["accuracy_percentage"] / 100.0) * 3.0, 1)

    overall_speaking_band = round((content_score / 3.0 * 30.0) + (fluency["fluency_score"] / 5.0 * 35.0) + (pronunciation["pronunciation_score"] / 5.0 * 35.0), 1)

    return {
        "transcript_text": spoken_text,
        "word_count": word_count,
        "duration_seconds": duration_seconds,
        "calculated_wpm": wpm,
        "fluency": fluency,
        "pronunciation": pronunciation,
        "content_score": content_score,
        "overall_speaking_score": min(90.0, max(10.0, overall_speaking_band)),
        "model_used": "FASTER_WHISPER_SIM_V1"
    }

if __name__ == "__main__":
    sample_ref = "Solar energy adoption has accelerated significantly across regional Australia over the past decade."
    sample_spoken = "Solar energy adoption has accelerated significantly across regional Australia over the past decade."
    result = analyze_speech_response(sample_spoken, sample_ref, 4.5)
    print("Speech Analysis Result:", result)
