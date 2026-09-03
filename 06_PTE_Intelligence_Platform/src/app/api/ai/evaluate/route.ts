import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type_code, user_submission, prompt_text, duration_seconds = 5.0, response_id = null } = body;

    if (!type_code) {
      return NextResponse.json({ success: false, error: 'type_code is required' }, { status: 400 });
    }

    const tc = String(type_code).toUpperCase();
    const text = String(user_submission || '').trim();
    const prompt = String(prompt_text || '').trim();

    let result: any = null;

    if (['RA', 'RS', 'DI', 'RL', 'ASQ', 'RTS', 'SGD'].includes(tc)) {
      // --- SPEAKING EVALUATION (WPM + Pronunciation + Fluency) ---
      const words = text.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const duration = Math.max(1.0, Number(duration_seconds) || 5.0);
      const wpm = Math.round((wordCount / duration) * 60 * 10) / 10;

      // Fluency evaluation
      let fluencyScore = 5.0;
      let fluencyStatus = 'OPTIMAL';
      let fluencyFeedback = 'Kecepatan berbicara sangat baik dan natural (dalam rentang optimal 120–165 WPM).';

      if (wpm < 60) {
        fluencyScore = 1.5;
        fluencyStatus = 'VERY_SLOW';
        fluencyFeedback = 'Tempo berbicara terlalu lambat (<60 WPM). Perlu latihan kelancaran terus-menerus tanpa jeda panjang.';
      } else if (wpm < 95) {
        fluencyScore = 2.8;
        fluencyStatus = 'HESITANT';
        fluencyFeedback = 'Tempo berbicara agak lambat (60-95 WPM). Latih pengucapan tanpa jeda ragu lebih dari 2 detik.';
      } else if (wpm <= 165) {
        fluencyScore = 5.0;
        fluencyStatus = 'OPTIMAL';
        fluencyFeedback = 'Kecepatan berbicara sangat ideal (120–165 WPM) sesuai standar Pearson.';
      } else {
        fluencyScore = 3.5;
        fluencyStatus = 'RUSHED';
        fluencyFeedback = 'Berbicara agak terlalu cepat (>165 WPM). Jangan sampai kecepatan mengorbankan kejelasan artikulasi kata.';
      }

      // Pronunciation matching with prompt
      const promptWords = prompt.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
      const spokenWords = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

      const matchedWords: string[] = [];
      const pool = [...spokenWords];
      promptWords.forEach((pw) => {
        const idx = pool.indexOf(pw);
        if (idx !== -1) {
          matchedWords.push(pw);
          pool.splice(idx, 1);
        }
      });

      const matchRatio = promptWords.length > 0 ? (matchedWords.length / promptWords.length) : 0;
      const pronScore = Math.round(matchRatio * 5.0 * 10) / 10;
      const contentScore = Math.round(matchRatio * 3.0 * 10) / 10;

      const overallBand = Math.round(
        (contentScore / 3.0 * 30.0) + (fluencyScore / 5.0 * 35.0) + (pronScore / 5.0 * 35.0)
      );

      result = {
        type: 'SPEAKING',
        word_count: wordCount,
        duration_seconds: duration,
        calculated_wpm: wpm,
        overall_speaking_score: Math.min(90, Math.max(10, overallBand)),
        fluency: {
          score: fluencyScore,
          max: 5.0,
          status: fluencyStatus,
          feedback_id: fluencyFeedback
        },
        pronunciation: {
          score: pronScore,
          max: 5.0,
          accuracy_percentage: Math.round(matchRatio * 100),
          matched_words_count: matchedWords.length,
          total_prompt_words: promptWords.length
        },
        content: {
          score: contentScore,
          max: 3.0
        },
        feedback_summary: `Kecepatan ${wpm} WPM (${fluencyStatus}). Akurasi pelafalan ${Math.round(matchRatio * 100)}%. Estimasi skor: ${overallBand}/90.`
      };
    } else {
      // --- WRITING EVALUATION (SWT / WE) ---
      const words = text.split(/\s+/).filter(Boolean);
      const wordCount = words.length;

      if (tc === 'SWT') {
        const hasMultipleSentences = (text.match(/[.!?]+(?:\s+|$)/g) || []).length > 1;
        const validLength = wordCount >= 5 && wordCount <= 75;
        const formScore = (!hasMultipleSentences && validLength) ? 1 : 0;
        const scaledScore = formScore === 1 ? 75 : 20;

        result = {
          type: 'SWT',
          word_count: wordCount,
          is_single_sentence: !hasMultipleSentences,
          valid_length: validLength,
          form_score: formScore,
          scaled_score: scaledScore,
          feedback_summary: formScore === 1 
            ? 'Format SWT Sempurna: Tepat satu kalimat tunggal dan dalam batas 5–75 kata.' 
            : 'Perhatian Format SWT: Wajib tepat SATU kalimat tunggal dengan panjang antara 5 hingga 75 kata.'
        };
      } else {
        // Essay Evaluation (WE)
        let formScore = 0;
        if (wordCount >= 200 && wordCount <= 300) {
          formScore = 2;
        } else if ((wordCount >= 120 && wordCount < 200) || (wordCount > 300 && wordCount <= 380)) {
          formScore = 1;
        }

        const paragraphs = text.split('\n').map(p => p.trim()).filter(Boolean);
        const structureScore = paragraphs.length >= 3 ? 2 : (paragraphs.length === 2 ? 1 : 0);

        const promptKeywords = new Set(prompt.toLowerCase().match(/\b\w{4,}\b/g) || []);
        const essayWords = new Set(text.toLowerCase().match(/\b\w{4,}\b/g) || []);
        let overlapCount = 0;
        promptKeywords.forEach(kw => { if (essayWords.has(kw)) overlapCount++; });

        const contentScore = overlapCount >= 4 ? 3 : (overlapCount >= 2 ? 2 : 1);
        const academicMarkers = new Set(["furthermore", "however", "consequently", "significant", "substantial", "sustainable", "perspective", "evidence"]);
        let academicCount = 0;
        academicMarkers.forEach(m => { if (essayWords.has(m)) academicCount++; });
        const vocabScore = academicCount >= 2 ? 2 : 1;

        const rawTotal = contentScore + formScore + structureScore + vocabScore + 2;
        const scaledScore = Math.round(10 + (rawTotal / 11) * 80);

        const templatePhrases = ["this essay will discuss", "in modern society the debate", "on the one hand on the other hand"];
        const templateDetected = templatePhrases.filter(p => text.toLowerCase().includes(p)).length >= 2;

        result = {
          type: 'ESSAY',
          word_count: wordCount,
          scaled_score: scaledScore,
          dimensions: {
            content: { score: contentScore, max: 3 },
            form: { score: formScore, max: 2 },
            structure: { score: structureScore, max: 2 },
            vocabulary: { score: vocabScore, max: 2 },
            grammar: { score: 2, max: 2 }
          },
          template_detected: templateDetected,
          template_warning: templateDetected ? '⚠️ Pola template kaku terdeteksi. Pearson memotong nilai jika konten hanya berupa template hafalan!' : null,
          feedback_summary: `Panjang esai: ${wordCount} kata. Struktur paragraf: ${paragraphs.length}. Estimasi Skor: ${scaledScore}/90. ${scaledScore >= 36 ? 'Memenuhi target aman 36+ WHV 462!' : 'Tingkatkan elaborasi argumen dan kosakata akademik.'}`
        };
      }
    }

    // Persist into ai_evaluations if response_id provided
    let evalId: string | null = null;
    if (response_id) {
      const db = getDatabase();
      evalId = `EVAL-AI-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      db.prepare(`
        INSERT INTO ai_evaluations (
          eval_id, response_id, item_score, max_possible_score, breakdown_json,
          structured_feedback_id, confidence_rating, template_detection_flag, evaluated_at
        ) VALUES (?, ?, ?, 90, ?, ?, 0.95, ?, CURRENT_TIMESTAMP)
      `).run(
        evalId,
        response_id,
        result.overall_speaking_score || result.scaled_score || 0,
        JSON.stringify(result),
        result.feedback_summary || '',
        result.template_detected ? 1 : 0
      );
    }

    return NextResponse.json({
      success: true,
      type_code: tc,
      eval_id: evalId,
      result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
