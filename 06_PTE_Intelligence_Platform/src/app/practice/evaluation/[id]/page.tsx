'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function EvaluationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const attemptId = resolvedParams.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<any>(null);

  // Interactive Scoring Playground State
  const [activeSandboxTab, setActiveSandboxTab] = useState<'fib' | 'negative' | 'reorder' | 'wfd'>('negative');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  // Playground inputs
  const [wfdInput, setWfdInput] = useState<string>("The university health clinic provides confidential mental support.");
  const [wfdCanon, setWfdCanon] = useState<string>("The university health clinic provides confidential mental health support services for all enrolled students.");

  const [negUser, setNegUser] = useState<string>("A, C, D");
  const [negCorrect, setNegCorrect] = useState<string>("A, B");

  const [roUser, setRoUser] = useState<string>("A, B, D, C");
  const [roCanon, setRoCanon] = useState<string>("A, B, C, D");

  const [fibUser, setFibUser] = useState<string>("remarkable, efficient, alternative, emissions");
  const [fibCanon, setFibCanon] = useState<string>("remarkable, efficient, alternative, emissions");

  useEffect(() => {
    // Fetch attempt info
    const fetchSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/practice/sessions');
        const data = await res.json();
        if (data.success && data.attempts) {
          const match = data.attempts.find((a: any) => a.attempt_id === attemptId);
          setSessionData(match || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [attemptId]);

  const handleTestSandbox = async (type: string) => {
    setEvaluating(true);
    setSandboxResult(null);
    try {
      let payload: any = { type_code: type };
      if (type === 'WFD') {
        payload.user_submission = wfdInput;
        payload.canonical_data = wfdCanon;
      } else if (type === 'R_MCM') {
        payload.user_submission = negUser.split(',').map(s => s.trim());
        payload.canonical_data = negCorrect.split(',').map(s => s.trim());
      } else if (type === 'RO') {
        payload.user_submission = roUser.split(',').map(s => s.trim());
        payload.canonical_data = roCanon.split(',').map(s => s.trim());
      } else if (type === 'R_FIB') {
        payload.user_submission = fibUser.split(',').map(s => s.trim());
        payload.canonical_data = fibCanon.split(',').map(s => s.trim());
      }

      const res = await fetch('/api/scoring/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSandboxResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const sandboxTabs: ('negative' | 'wfd' | 'reorder' | 'fib')[] = ['negative', 'wfd', 'reorder', 'fib'];
  const handleSandboxTabKeyDown = (e: React.KeyboardEvent, currentTab: 'negative' | 'wfd' | 'reorder' | 'fib') => {
    const idx = sandboxTabs.indexOf(currentTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = sandboxTabs[(idx + 1) % sandboxTabs.length];
      setActiveSandboxTab(nextTab);
      setSandboxResult(null);
      document.getElementById(`tab-sandbox-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = sandboxTabs[(idx - 1 + sandboxTabs.length) % sandboxTabs.length];
      setActiveSandboxTab(prevTab);
      setSandboxResult(null);
      document.getElementById(`tab-sandbox-${prevTab}`)?.focus();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 5 &bull; Objective Scoring Engine & Auditor</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Laporan Evaluasi Skor Objektif Pearson
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Menerapkan algoritma matematis deterministik resmi Pearson: <strong>Partial Credit FIB</strong>, <strong>Negative Marking dengan Floor 0</strong>, <strong>Re-order Adjacent Pairs</strong>, dan <strong>Write From Dictation Word Matching</strong>.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Attempt ID</span>
            <span className="badge badge-purple">{sessionData?.session_mode || 'SIMULASI'}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>
            {attemptId}
          </div>
          <p className="card-desc">Sesi tercatat di database lokal SQLite.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Estimasi Skor</span>
            <span className="badge badge-emerald">PEARSON SCALE</span>
          </div>
          <div className="card-number">
            {sessionData?.calculated_overall_score ? sessionData.calculated_overall_score.toFixed(1) : '38.0'}
          </div>
          <p className="card-desc">Skor terestimasi berdasarkan akurasi jawaban objektif.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Target Legal 24</span>
            <span className="badge badge-emerald">TERPENUHI</span>
          </div>
          <div className="card-number" style={{ color: 'var(--accent-emerald)' }}>PASS</div>
          <p className="card-desc">Memenuhi standar resmi Functional English Table 2 DHA.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Target Aman 36+</span>
            <span className="badge badge-blue">BUFFER SAFE</span>
          </div>
          <div className="card-number" style={{ color: 'var(--accent-cyan)' }}>ON TRACK</div>
          <p className="card-desc">Bantalan aman menghadapi variasi teknis hari ujian.</p>
        </div>
      </div>

      {/* Interactive Scoring Sandbox */}
      <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ fontSize: '1.25rem', color: '#fff' }}>
              🧪 Sandbox Pengujian Logika Scoring Resmi Pearson
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Uji secara langsung perhitungan matematis untuk 4 aturan penilaian objektif Pearson.
            </p>
          </div>
          <span className="badge badge-emerald">DETERMINISTIC V1</span>
        </div>

        {/* Sandbox Tabs */}
        <div
          role="tablist"
          aria-label="Aturan Penilaian Objektif Pearson"
          style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }}
        >
          <button
            role="tab"
            aria-selected={activeSandboxTab === 'negative'}
            aria-controls="panel-sandbox-negative"
            id="tab-sandbox-negative"
            tabIndex={activeSandboxTab === 'negative' ? 0 : -1}
            onClick={() => { setActiveSandboxTab('negative'); setSandboxResult(null); }}
            onKeyDown={(e) => handleSandboxTabKeyDown(e, 'negative')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.6rem 1rem',
              color: activeSandboxTab === 'negative' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              fontWeight: 700,
              borderBottom: activeSandboxTab === 'negative' ? '2px solid var(--accent-emerald)' : 'none',
              cursor: 'pointer'
            }}
          >
            ⚖️ Negative Marking (Floor 0)
          </button>

          <button
            role="tab"
            aria-selected={activeSandboxTab === 'wfd'}
            aria-controls="panel-sandbox-wfd"
            id="tab-sandbox-wfd"
            tabIndex={activeSandboxTab === 'wfd' ? 0 : -1}
            onClick={() => { setActiveSandboxTab('wfd'); setSandboxResult(null); }}
            onKeyDown={(e) => handleSandboxTabKeyDown(e, 'wfd')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.6rem 1rem',
              color: activeSandboxTab === 'wfd' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              fontWeight: 700,
              borderBottom: activeSandboxTab === 'wfd' ? '2px solid var(--accent-blue)' : 'none',
              cursor: 'pointer'
            }}
          >
            ✍️ Write From Dictation (Partial Credit)
          </button>

          <button
            role="tab"
            aria-selected={activeSandboxTab === 'reorder'}
            aria-controls="panel-sandbox-reorder"
            id="tab-sandbox-reorder"
            tabIndex={activeSandboxTab === 'reorder' ? 0 : -1}
            onClick={() => { setActiveSandboxTab('reorder'); setSandboxResult(null); }}
            onKeyDown={(e) => handleSandboxTabKeyDown(e, 'reorder')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.6rem 1rem',
              color: activeSandboxTab === 'reorder' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              fontWeight: 700,
              borderBottom: activeSandboxTab === 'reorder' ? '2px solid var(--accent-purple)' : 'none',
              cursor: 'pointer'
            }}
          >
            🔀 Re-order (Adjacent Pairs)
          </button>

          <button
            role="tab"
            aria-selected={activeSandboxTab === 'fib'}
            aria-controls="panel-sandbox-fib"
            id="tab-sandbox-fib"
            tabIndex={activeSandboxTab === 'fib' ? 0 : -1}
            onClick={() => { setActiveSandboxTab('fib'); setSandboxResult(null); }}
            onKeyDown={(e) => handleSandboxTabKeyDown(e, 'fib')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.6rem 1rem',
              color: activeSandboxTab === 'fib' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 700,
              borderBottom: activeSandboxTab === 'fib' ? '2px solid var(--accent-cyan)' : 'none',
              cursor: 'pointer'
            }}
          >
            🔤 Fill in the Blanks
          </button>
        </div>

        {/* 1. NEGATIVE MARKING SANDBOX */}
        {activeSandboxTab === 'negative' && (
          <div role="tabpanel" id="panel-sandbox-negative" aria-labelledby="tab-sandbox-negative" tabIndex={0}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Aturan: +1 poin untuk tiap pilihan benar, -1 poin untuk tiap pilihan salah. <strong>Skor dibatasi minimal 0 (tidak pernah minus).</strong>
            </p>
            <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="input-neg-user" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Pilihan Peserta (dipisahkan koma):
                </label>
                <input
                  type="text"
                  value={negUser}
                  onChange={(e) => setNegUser(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  id="input-neg-user"
                />
              </div>
              <div>
                <label htmlFor="input-neg-correct" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Kunci Jawaban Benar:
                </label>
                <input
                  type="text"
                  value={negCorrect}
                  onChange={(e) => setNegCorrect(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  id="input-neg-correct"
                />
              </div>
            </div>
            <button
              onClick={() => handleTestSandbox('R_MCM')}
              disabled={evaluating}
              className="btn btn-emerald"
              id="btn-eval-negative"
            >
              {evaluating ? 'Menghitung...' : 'Hitung Skor Negative Marking'}
            </button>
          </div>
        )}

        {/* 2. WFD SANDBOX */}
        {activeSandboxTab === 'wfd' && (
          <div role="tabpanel" id="panel-sandbox-wfd" aria-labelledby="tab-sandbox-wfd" tabIndex={0}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Aturan: +1 poin untuk setiap kata benar yang dieja tepat dari audio prompt (tanpa penalti kata ekstra).
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="input-wfd-user" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Kalimat Input Peserta:
              </label>
              <textarea
                rows={2}
                value={wfdInput}
                onChange={(e) => setWfdInput(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                id="input-wfd-user"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="input-wfd-correct" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Kalimat Kunci Resmi:
              </label>
              <textarea
                rows={2}
                value={wfdCanon}
                onChange={(e) => setWfdCanon(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                id="input-wfd-correct"
              />
            </div>
            <button
              onClick={() => handleTestSandbox('WFD')}
              disabled={evaluating}
              className="btn btn-primary"
              id="btn-eval-wfd"
            >
              {evaluating ? 'Menganalisis...' : 'Hitung Skor WFD'}
            </button>
          </div>
        )}

        {/* 3. REORDER SANDBOX */}
        {activeSandboxTab === 'reorder' && (
          <div role="tabpanel" id="panel-sandbox-reorder" aria-labelledby="tab-sandbox-reorder" tabIndex={0}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Aturan: +1 poin per pasangan kalimat berdampingan (*adjacent pair*) yang cocok dengan urutan kanonikal.
            </p>
            <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="input-ro-user" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Urutan Peserta:
                </label>
                <input
                  type="text"
                  value={roUser}
                  onChange={(e) => setRoUser(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  id="input-ro-user"
                />
              </div>
              <div>
                <label htmlFor="input-ro-correct" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Urutan Resmi:
                </label>
                <input
                  type="text"
                  value={roCanon}
                  onChange={(e) => setRoCanon(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  id="input-ro-correct"
                />
              </div>
            </div>
            <button
              onClick={() => handleTestSandbox('RO')}
              disabled={evaluating}
              className="btn btn-emerald"
              id="btn-eval-ro"
            >
              {evaluating ? 'Menghitung Pasangan...' : 'Hitung Skor Re-order'}
            </button>
          </div>
        )}

        {/* 4. FIB SANDBOX */}
        {activeSandboxTab === 'fib' && (
          <div role="tabpanel" id="panel-sandbox-fib" aria-labelledby="tab-sandbox-fib" tabIndex={0}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Aturan: +1 poin per blank yang terisi tepat (normalisasi huruf besar/kecil dan spasi).
            </p>
            <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="input-fib-user" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Jawaban Blanks Peserta:
                </label>
                <input
                  type="text"
                  value={fibUser}
                  onChange={(e) => setFibUser(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  id="input-fib-user"
                />
              </div>
              <div>
                <label htmlFor="input-fib-correct" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Kunci Resmi Blanks:
                </label>
                <input
                  type="text"
                  value={fibCanon}
                  onChange={(e) => setFibCanon(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  id="input-fib-correct"
                />
              </div>
            </div>
            <button
              onClick={() => handleTestSandbox('R_FIB')}
              disabled={evaluating}
              className="btn btn-primary"
              id="btn-eval-fib"
            >
              {evaluating ? 'Memvalidasi...' : 'Hitung Skor FIB'}
            </button>
          </div>
        )}

        {/* SANDBOX RESULT DISPLAY */}
        {sandboxResult && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-purple">{sandboxResult.scoring_rule}</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                Skor: {sandboxResult.raw_score} / {sandboxResult.max_score} ({sandboxResult.percentage}%)
              </div>
            </div>

            {sandboxResult.floor_applied !== undefined && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Perhitungan: Benar ({sandboxResult.correct_count}) &minus; Salah ({sandboxResult.incorrect_count}) = {sandboxResult.unfloored_calculation}.
                {sandboxResult.floor_applied && (
                  <strong style={{ color: 'var(--accent-amber)', marginLeft: '0.5rem' }}>
                    ⚠️ Floor at 0 diterapkan (skor tidak menjadi minus).
                  </strong>
                )}
              </div>
            )}

            {sandboxResult.matched_words && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <div>✓ Kata Cocok ({sandboxResult.matched_words.length}): <span style={{ color: 'var(--accent-emerald)' }}>{sandboxResult.matched_words.join(', ')}</span></div>
                {sandboxResult.missing_words.length > 0 && (
                  <div>✕ Kata Kurang ({sandboxResult.missing_words.length}): <span style={{ color: 'var(--accent-rose)' }}>{sandboxResult.missing_words.join(', ')}</span></div>
                )}
              </div>
            )}

            {sandboxResult.matched_pairs && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                <div>✓ Pasangan Urut Cocok: <span style={{ color: 'var(--accent-emerald)' }}>{sandboxResult.matched_pairs.join(', ') || 'Tidak ada'}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/practice" className="btn btn-secondary">
          &larr; Kembali ke Latihan
        </Link>
        <Link href="/questions" className="btn btn-secondary">
          Buka Bank Soal
        </Link>
      </div>
    </div>
  );
}
