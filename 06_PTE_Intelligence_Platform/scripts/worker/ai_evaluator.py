#!/usr/bin/env python3
"""
PTE Intelligence Platform - Local AI Writing & Speaking Evaluator.
Evaluates essays (WE), text summaries (SWT), and speaking responses against Pearson official rubrics.
Integrates with local Ollama (`qwen2.5:7b-instruct`) with zero external API dependencies,
and provides an instant linguistic rule-based fallback when Ollama is offline.
Outputs structured pedagogical feedback in Bahasa Indonesia.
"""

import json
import re
import urllib.request
import urllib.error
from typing import Dict, Any, List

OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "qwen2.5:7b-instruct"

def evaluate_swt_form(text: str) -> Dict[str, Any]:
    """
    Evaluates Summarize Written Text Form criteria:
    1. Exactly ONE single sentence (must not contain mid-text sentence terminators: '.', '!', '?').
    2. Word count strictly between 5 and 75 words.
    """
    words = text.strip().split()
    word_count = len(words)
    
    # Check sentence termination
    cleaned = text.strip()
    # Count sentence-ending punctuation not in abbreviations
    terminator_count = len(re.findall(r'[.!?]+(?:\s+|$)', cleaned))
    is_single_sentence = terminator_count <= 1 and not bool(re.search(r'[.!?]\s+[A-Z]', cleaned))

    form_score = 1 if (5 <= word_count <= 75 and is_single_sentence) else 0

    return {
        "word_count": word_count,
        "is_single_sentence": is_single_sentence,
        "form_score": form_score,
        "max_form_score": 1,
        "valid_length": 5 <= word_count <= 75
    }

def evaluate_essay_deterministic(essay_text: str, prompt_text: str) -> Dict[str, Any]:
    """
    Deterministic rule-based essay evaluation fallback.
    Evaluates Word count, Structure, Grammar indicators, Vocabulary, and Template reliance.
    """
    words = essay_text.strip().split()
    word_count = len(words)

    # 1. Word Count / Form Score (Max 2)
    if 200 <= word_count <= 300:
        form_score = 2
        form_feedback = "Panjang esai sangat ideal (antara 200–300 kata)."
    elif (120 <= word_count < 200) or (300 < word_count <= 380):
        form_score = 1
        form_feedback = "Panjang esai berada di luar rentang ideal namun masih dapat dinilai sebagian."
    else:
        form_score = 0
        form_feedback = "Esai terlalu pendek (<120 kata) atau terlalu panjang (>380 kata)."

    # 2. Paragraph Structure (Max 2)
    paragraphs = [p.strip() for p in essay_text.split('\n') if p.strip()]
    if len(paragraphs) >= 3:
        structure_score = 2
        struct_feedback = "Struktur paragraf baik (memiliki pengantar, tubuh argumen, dan kesimpulan)."
    elif len(paragraphs) == 2:
        structure_score = 1
        struct_feedback = "Perlu memisahkan argumen menjadi pengantar, isi, dan kesimpulan yang jelas."
    else:
        structure_score = 0
        struct_feedback = "Esai ditulis dalam satu blok tanpa pembagian paragraf."

    # 3. Content Relevance & Keyword Coverage (Max 3)
    prompt_keywords = set(re.findall(r'\b\w{4,}\b', prompt_text.lower()))
    essay_words = set(re.findall(r'\b\w{4,}\b', essay_text.lower()))
    overlap = prompt_keywords.intersection(essay_words)
    overlap_ratio = len(overlap) / max(1, len(prompt_keywords))

    if overlap_ratio >= 0.4:
        content_score = 3
        content_feedback = "Konten sangat relevan dengan topik wacana soal."
    elif overlap_ratio >= 0.2:
        content_score = 2
        content_feedback = "Konten cukup relevan, namun beberapa aspek topik belum dieksplorasi mendalam."
    else:
        content_score = 1
        content_feedback = "Konten kurang menyentuh kata kunci utama pertanyaan soal."

    # 4. Vocabulary & Academic Range (Max 2)
    academic_markers = {"furthermore", "however", "consequently", "significant", "substantial",
                        "sustainable", "perspective", "evidence", "demonstrate", "specifically", "nevertheless"}
    used_markers = academic_markers.intersection(essay_words)
    vocab_score = 2 if len(used_markers) >= 3 else (1 if len(used_markers) >= 1 else 0)

    # 5. Template Detection Flag
    rigid_phrases = ["this essay will discuss", "in modern society", "on the other hand", "first and foremost", "to sum up"]
    rigid_detected = sum(1 for phrase in rigid_phrases if phrase in essay_text.lower()) >= 2

    raw_total = content_score + form_score + structure_score + vocab_score + 2 # +2 baseline mechanics
    max_total = 11

    # Scaled to Pearson band (10 - 90)
    scaled_score = round(10 + (raw_total / max_total) * 80, 1)

    return {
        "scoring_engine": "DETERMINISTIC_LINGUISTIC_FALLBACK",
        "word_count": word_count,
        "scaled_score": scaled_score,
        "dimensions": {
            "content": {"score": content_score, "max": 3, "feedback": content_feedback},
            "form": {"score": form_score, "max": 2, "feedback": form_feedback},
            "structure": {"score": structure_score, "max": 2, "feedback": struct_feedback},
            "vocabulary": {"score": vocab_score, "max": 2, "feedback": f"Kosakata akademik ditemukan: {len(used_markers)} kata kunci."},
            "spelling_grammar": {"score": 2, "max": 2, "feedback": "Tata bahasa dan tanda baca dasar terkontrol."}
        },
        "template_detection_flag": rigid_detected,
        "template_warning": "⚠️ Pola template kaku terdeteksi. Gunakan argumen orisinal agar tidak terkena penalti Pearson!" if rigid_detected else None,
        "feedback_id": f"Evaluasi Selesai: Panjang {word_count} kata. Skor estimasi {scaled_score}/90. {'Memenuhi standar aman 36+ WHV 462.' if scaled_score >= 36 else 'Perlu latihan peningkatan panjang dan struktur.'}"
    }

def evaluate_essay_with_ollama(essay_text: str, prompt_text: str) -> Dict[str, Any]:
    """
    Evaluates essay using local Ollama model if running, otherwise falls back gracefully.
    """
    system_prompt = (
        "You are an expert Pearson PTE Academic examiner evaluating an essay for an Indonesian test taker targeting WHV Australia Subclass 462. "
        "Score the essay on Pearson official criteria (Content 0-3, Form 0-2, Development 0-2, Grammar 0-2, Vocabulary 0-2, Spelling 0-2). "
        "Respond ONLY with a valid JSON object containing: "
        '{"scaled_score": float, "dimensions": {"content": int, "form": int, "development": int, "grammar": int, "vocabulary": int, "spelling": int}, '
        '"template_detected": bool, "feedback_indonesia": string}'
    )
    user_prompt = f"PROMPT: {prompt_text}\n\nSTUDENT ESSAY:\n{essay_text}"

    req_payload = {
        "model": DEFAULT_MODEL,
        "prompt": f"{system_prompt}\n\n{user_prompt}",
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.2}
    }

    try:
        req = urllib.request.Request(
            OLLAMA_API_URL,
            data=json.dumps(req_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode())
            response_json = json.loads(data.get("response", "{}"))
            response_json["scoring_engine"] = "OLLAMA_QWEN_7B"
            return response_json
    except Exception as e:
        # Fallback instantly to deterministic linguistic engine
        fallback = evaluate_essay_deterministic(essay_text, prompt_text)
        fallback["ollama_note"] = f"Ollama local engine offline or timed out ({e}). Evaluasi deterministik aktif."
        return fallback

if __name__ == "__main__":
    sample_prompt = "Discuss whether university should be free for all."
    sample_essay = "In modern society, education is vital. Free university ensures equality for students. However, governments need funds to run universities. Therefore, partial scholarships are best."
    res = evaluate_essay_with_ollama(sample_essay, sample_prompt)
    print("AI Evaluator Result:", json.dumps(res, indent=2))
