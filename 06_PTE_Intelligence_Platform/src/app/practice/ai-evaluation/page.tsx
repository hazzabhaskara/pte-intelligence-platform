'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AiEvaluationPage() {
  const [activeTab, setActiveTab] = useState<'speaking' | 'writing'>('speaking');

  // Speaking state
  const [speakingPrompt, setSpeakingPrompt] = useState<string>(
    "Solar energy adoption has accelerated significantly across regional Australia over the past decade."
  );
  const [speakingTranscript, setSpeakingTranscript] = useState<string>(
    "Solar energy adoption has accelerated significantly across regional Australia over the past decade."
  );
  const [speakingDuration, setSpeakingDuration] = useState<number>(4.8);
  const [speakingResult, setSpeakingResult] = useState<any>(null);
  const [speakingEvaluating, setSpeakingEvaluating] = useState<boolean>(false);
  const [selectedAccent, setSelectedAccent] = useState<string>('en-AU');

  // Writing state
  const [writingType, setWritingType] = useState<string>('WE');
  const [writingPrompt, setWritingPrompt] = useState<string>(
    "Some people believe that university education should be completely free for all citizens, while others argue students should pay their own tuition. Discuss both views."
  );
  const [writingSubmission, setWritingSubmission] = useState<string>(
    "In modern society, the debate over university funding is significant. Providing free higher education ensures equal opportunity regardless of socioeconomic background. Students can focus on their studies without accumulating massive financial debt.\n\nHowever, maintaining high academic standards and advanced research facilities requires substantial financial investment. If universities are completely subsidized, it may place a heavy burden on taxpayers.\n\nIn conclusion, a balanced approach such as targeted scholarships and interest-free loans is the most sustainable solution for both students and the government."
  );
  const [writingResult, setWritingResult] = useState<any>(null);
  const [writingEvaluating, setWritingEvaluating] = useState<boolean>(false);

  // Web Speech TTS Synthesis
  const handlePlayTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakingPrompt);
      utterance.lang = selectedAccent;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser Anda tidak mendukung Web Speech Synthesis.");
    }
  };

  const handleEvaluateSpeaking = async () => {
    setSpeakingEvaluating(true);
    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_code: 'RA',
          user_submission: speakingTranscript,
          prompt_text: speakingPrompt,
          duration_seconds: speakingDuration
        })
      });
      const data = await res.json();
      if (data.success) {
        setSpeakingResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSpeakingEvaluating(false);
    }
  };

  const handleEvaluateWriting = async () => {
    setWritingEvaluating(true);
    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_code: writingType,
          user_submission: writingSubmission,
          prompt_text: writingPrompt
        })
      });
      const data = await res.json();
      if (data.success) {
        setWritingResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWritingEvaluating(false);
    }
  };

  const handleEvalTabKeyDown = (e: React.KeyboardEvent, currentTab: 'speaking' | 'writing') => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab = currentTab === 'speaking' ? 'writing' : 'speaking';
      setActiveTab(nextTab);
      document.getElementById(`tab-${nextTab}`)?.focus();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 6 &bull; Local AI & Speech Intelligence</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Konsol Evaluasi AI Speaking & Writing
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Evaluasi ucapan lisan (WPM, jeda hening, kelancaran) dan esai tertulis (panjang kata, struktur argumen, deteksi template) dengan integrasi model lokal Ollama dan synthesizer suara aksen Australia.
        </p>
      </div>

      {/* Mode Tabs */}
      <div
        role="tablist"
        aria-label="Mode Evaluasi AI"
        style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'speaking'}
          aria-controls="panel-speaking"
          id="tab-speaking"
          tabIndex={activeTab === 'speaking' ? 0 : -1}
          onClick={() => setActiveTab('speaking')}
          onKeyDown={(e) => handleEvalTabKeyDown(e, 'speaking')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'speaking' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'speaking' ? '3px solid var(--accent-emerald)' : 'none',
            cursor: 'pointer'
          }}
        >
          🎙️ Evaluasi Speaking & Kelancaran (WPM)
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'writing'}
          aria-controls="panel-writing"
          id="tab-writing"
          tabIndex={activeTab === 'writing' ? 0 : -1}
          onClick={() => setActiveTab('writing')}
          onKeyDown={(e) => handleEvalTabKeyDown(e, 'writing')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: activeTab === 'writing' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'writing' ? '3px solid var(--accent-blue)' : 'none',
            cursor: 'pointer'
          }}
        >
          ✍️ Evaluasi Writing (SWT & Write Essay)
        </button>
      </div>

      {/* --- TAB 1: SPEAKING EVALUATION --- */}
      {activeTab === 'speaking' && (
        <div role="tabpanel" id="panel-speaking" aria-labelledby="tab-speaking" tabIndex={0} className="grid-cols-2" style={{ gap: '2rem' }}>
          {/* Input Panel */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Prompt Soal & Synthesizer Suara</span>
              <span className="badge badge-emerald">TTS LOCAL</span>
            </div>

            <label htmlFor="select-accent" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Pilih Aksen Native Audio:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <select
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                id="select-accent"
              >
                <option value="en-AU">Aksen Australia (en-AU) 🦘</option>
                <option value="en-GB">Aksen British (en-GB) 🇬🇧</option>
                <option value="en-US">Aksen American (en-US) 🇺🇸</option>
              </select>
              <button onClick={handlePlayTTS} className="btn btn-secondary" id="btn-play-tts">
                🔊 Dengar Prompt
              </button>
            </div>

            <label htmlFor="input-speaking-prompt" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Teks Wacana Soal (Prompt):
            </label>
            <textarea
              rows={3}
              value={speakingPrompt}
              onChange={(e) => setSpeakingPrompt(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', marginBottom: '1.25rem' }}
              id="input-speaking-prompt"
            />

            <label htmlFor="input-speaking-transcript" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Transkripsi Suara Peserta (Hasil STT):
            </label>
            <textarea
              rows={3}
              value={speakingTranscript}
              onChange={(e) => setSpeakingTranscript(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', marginBottom: '1.25rem' }}
              id="input-speaking-transcript"
            />

            <label htmlFor="input-speaking-duration" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Durasi Berbicara (detik):
            </label>
            <input
              type="number"
              step="0.1"
              value={speakingDuration}
              onChange={(e) => setSpeakingDuration(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', marginBottom: '1.5rem' }}
              id="input-speaking-duration"
            />

            <button
              onClick={handleEvaluateSpeaking}
              disabled={speakingEvaluating}
              className="btn btn-emerald"
              style={{ width: '100%' }}
              id="btn-evaluate-speaking"
            >
              {speakingEvaluating ? 'Menganalisis Suara...' : 'Analisis Kelancaran & WPM 🎙️'}
            </button>
          </div>

          {/* Result Panel */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Hasil Analisis Oral Fluency & Pronunciation</span>
              <span className="badge badge-purple">AI RUBRIC</span>
            </div>

            {speakingResult ? (
              <div role="status" aria-live="polite">
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ESTIMASI SKOR SPEAKING</div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {speakingResult.overall_speaking_score} / 90
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Target Legal: 24 &bull; Target Aman: 36+
                  </div>
                </div>

                <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KECEPATAN BICARA (WPM)</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {speakingResult.calculated_wpm} WPM
                    </div>
                    <span className="badge badge-emerald" style={{ marginTop: '0.35rem' }}>
                      {speakingResult.fluency.status}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AKURASI PELAFALAN</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                      {speakingResult.pronunciation.accuracy_percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {speakingResult.pronunciation.matched_words_count} kata cocok dari {speakingResult.pronunciation.total_prompt_words}
                    </div>
                  </div>
                </div>

                <div className="callout callout-info" style={{ fontSize: '0.85rem' }}>
                  💡 <strong>Umpan Balik Personal:</strong><br />
                  {speakingResult.fluency.feedback_id}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                Tekan tombol <strong>"Analisis Kelancaran & WPM"</strong> untuk melihat rincian kecepatan bicara, skor kelancaran, dan akurasi pelafalan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: WRITING EVALUATION --- */}
      {activeTab === 'writing' && (
        <div role="tabpanel" id="panel-writing" aria-labelledby="tab-writing" tabIndex={0} className="grid-cols-2" style={{ gap: '2rem' }}>
          {/* Input Panel */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Input Wacana & Tulisan Esai</span>
              <span className="badge badge-blue">OLLAMA / FALLBACK</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setWritingType('WE')}
                className={`btn ${writingType === 'WE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
                id="btn-type-we"
              >
                Write Essay (WE)
              </button>
              <button
                onClick={() => setWritingType('SWT')}
                className={`btn ${writingType === 'SWT' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
                id="btn-type-swt"
              >
                Summarize Written Text (SWT)
              </button>
            </div>

            <label htmlFor="input-writing-prompt" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Pertanyaan / Wacana Prompt:
            </label>
            <textarea
              rows={2}
              value={writingPrompt}
              onChange={(e) => setWritingPrompt(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', marginBottom: '1rem' }}
              id="input-writing-prompt"
            />

            <label htmlFor="input-writing-submission" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Tulisan Jawaban Anda:
            </label>
            <textarea
              rows={8}
              value={writingSubmission}
              onChange={(e) => setWritingSubmission(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', marginBottom: '1.25rem', lineHeight: '1.6' }}
              id="input-writing-submission"
            />

            <button
              onClick={handleEvaluateWriting}
              disabled={writingEvaluating}
              className="btn btn-primary"
              style={{ width: '100%' }}
              id="btn-evaluate-writing"
            >
              {writingEvaluating ? 'Mengevaluasi Esai...' : 'Evaluasi Esai & Deteksi Template ✍️'}
            </button>
          </div>

          {/* Result Panel */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Laporan Analisis Rubrik Writing</span>
              <span className="badge badge-purple">PEARSON SCALED</span>
            </div>

            {writingResult ? (
              <div role="status" aria-live="polite">
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ESTIMASI SKOR WRITING</div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {writingResult.scaled_score} / 90
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Jumlah Kata: {writingResult.word_count} kata
                  </div>
                </div>

                {writingResult.template_warning && (
                  <div className="callout callout-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {writingResult.template_warning}
                  </div>
                )}

                {writingResult.dimensions && (
                  <div className="table-wrapper" style={{ marginBottom: '1.25rem' }}>
                    <table className="table" style={{ fontSize: '0.8rem' }}>
                      <caption className="sr-only">Rincian Evaluasi Dimensi Rubrik Esai Pearson</caption>
                      <thead>
                        <tr>
                          <th>Kriteria Dimensi</th>
                          <th>Skor</th>
                          <th>Catatan Evaluasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Konten & Relevansi</strong></td>
                          <td>{writingResult.dimensions.content.score} / {writingResult.dimensions.content.max}</td>
                          <td>{writingResult.dimensions.content.score >= 2 ? 'Relevan dengan prompt' : 'Perlu eksplorasi topik'}</td>
                        </tr>
                        <tr>
                          <td><strong>Panjang Kata (Form)</strong></td>
                          <td>{writingResult.dimensions.form.score} / {writingResult.dimensions.form.max}</td>
                          <td>{writingResult.dimensions.form.score === 2 ? 'Ideal 200–300 kata' : 'Di luar rentang ideal'}</td>
                        </tr>
                        <tr>
                          <td><strong>Struktur Paragraf</strong></td>
                          <td>{writingResult.dimensions.structure.score} / {writingResult.dimensions.structure.max}</td>
                          <td>{writingResult.dimensions.structure.score === 2 ? 'Pengantar, isi, kesimpulan utuh' : 'Perlu pemisahan paragraf'}</td>
                        </tr>
                        <tr>
                          <td><strong>Kosakata Akademik</strong></td>
                          <td>{writingResult.dimensions.vocabulary.score} / {writingResult.dimensions.vocabulary.max}</td>
                          <td>{writingResult.dimensions.vocabulary.score === 2 ? 'Ditemukan transisi akademik' : 'Perkaya collocations'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="callout callout-info" style={{ fontSize: '0.85rem' }}>
                  💡 <strong>Ringkasan Feedback:</strong><br />
                  {writingResult.feedback_summary}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                Tekan tombol <strong>"Evaluasi Esai & Deteksi Template"</strong> untuk melihat analisis panjang kata, struktur paragraf, dan feedback bahasa.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
        <Link href="/practice" className="btn btn-secondary">
          &larr; Simulasi Latihan
        </Link>
        <Link href="/questions" className="btn btn-secondary">
          Bank Soal
        </Link>
      </div>
    </div>
  );
}
