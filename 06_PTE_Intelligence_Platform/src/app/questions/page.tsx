'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuestionItem {
  item_id: string;
  blueprint_id: string;
  type_code: string;
  type_name: string;
  section: string;
  prompt_text: string;
  cefr_level: string;
  difficulty_level: string;
  estimated_time_seconds: number;
  uniqueness_hash: string;
  generation_model: string;
  created_at: string;
  accepted_canonical_text: string;
}

interface BlueprintItem {
  blueprint_id: string;
  type_code: string;
  type_name: string;
  section: string;
  target_skills: string;
  target_difficulty: string;
  prompt_structural_pattern: string;
  grammatical_focus: string;
  audio_requirements: string | null;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>([]);
  const [activeTab, setActiveTab] = useState<'bank' | 'blueprints'>('bank');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Generator form states
  const [genType, setGenType] = useState<string>('RA');
  const [genTopic, setGenTopic] = useState<string>('');
  const [forceDeterministic, setForceDeterministic] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [genMessage, setGenMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Detail Modal
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, bRes] = await Promise.all([
        fetch(`/api/questions?section=${selectedSection}&type=${selectedType}`).then(r => r.json()),
        fetch('/api/blueprints').then(r => r.json())
      ]);

      if (qRes.success) setQuestions(qRes.questions || []);
      if (bRes.success) setBlueprints(bRes.blueprints || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSection, selectedType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedQuestion) {
        setSelectedQuestion(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedQuestion]);

  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: 'bank' | 'blueprints') => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab = currentTab === 'bank' ? 'blueprints' : 'bank';
      setActiveTab(nextTab);
      document.getElementById(`tab-btn-${nextTab}`)?.focus();
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenMessage(null);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_code: genType,
          topic: genTopic.trim() || undefined,
          force_deterministic: forceDeterministic
        })
      });
      const data = await res.json();
      if (data.success) {
        setGenMessage({
          type: 'success',
          text: `Soal orisinal baru tipe ${genType} berhasil digenerate! (ID: ${data.item.item_id || 'BARU'})`
        });
        setGenTopic('');
        fetchData();
      } else {
        setGenMessage({ type: 'danger', text: data.error || 'Gagal menghasilkan soal' });
      }
    } catch (e: any) {
      setGenMessage({ type: 'danger', text: e.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 3 &bull; Question Bank & Blueprint Catalog</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Bank Soal Orisinal & Katalog Blueprint PTE
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Mencakup seluruh <strong>22 tipe soal ujian resmi</strong> (termasuk tipe baru pasca-Agustus 2025: <em>Respond to a Situation</em> & <em>Summarize Group Discussion</em>). Dihasilkan 100% orisinal menggunakan blueprint pedagogis tanpa menyalin soal berhak cipta.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Total Soal Siap Latihan</span>
            <span className="badge badge-emerald">ACTIVE BANK</span>
          </div>
          <div className="card-number">{questions.length}</div>
          <p className="card-desc">Butir soal orisinal tersimpan lengkap dengan kunci jawaban.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Katalog Blueprint</span>
            <span className="badge badge-blue">ALL 22 TYPES</span>
          </div>
          <div className="card-number">{blueprints.length} / 22</div>
          <p className="card-desc">100% tipe soal ujian Pearson tercakup secara pedagogis.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Status Hak Cipta</span>
            <span className="badge badge-emerald">ZERO PLAGIARISM</span>
          </div>
          <div className="card-number">100%</div>
          <p className="card-desc">Bebas kebocoran soal; setiap soal memiliki hash SHA-256 unik.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Target Kemampuan</span>
            <span className="badge badge-purple">CEFR B1</span>
          </div>
          <div className="card-number">36+ Aman</div>
          <p className="card-desc">Kalibrasi kosakata & struktur kalimat sesuai standar WHV.</p>
        </div>
      </div>

      {/* Generator Form Card */}
      <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ fontSize: '1.2rem', color: '#fff' }}>
              ✨ Generator Soal Orisinal Berbasis Blueprint
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Pilih tipe soal dan topik untuk menghasilkan butir latihan baru secara instan.
            </p>
          </div>
          <span className="badge badge-blue">DUAL ENGINE</span>
        </div>

        {genMessage && (
          <div
            role={genMessage.type === 'danger' ? 'alert' : 'status'}
            aria-live="polite"
            className={`callout callout-${genMessage.type}`}
            style={{ margin: '1rem 0' }}
          >
            {genMessage.text}
          </div>
        )}

        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label htmlFor="select-question-type" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Tipe Soal PTE:
            </label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              disabled={generating}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem'
              }}
              id="select-question-type"
            >
              <optgroup label="Speaking & Writing">
                <option value="RA">Read Aloud (RA)</option>
                <option value="RS">Repeat Sentence (RS)</option>
                <option value="DI">Describe Image (DI)</option>
                <option value="RL">Re-tell Lecture (RL)</option>
                <option value="ASQ">Answer Short Question (ASQ)</option>
                <option value="RTS">Respond to a Situation (RTS) ⭐ BARU</option>
                <option value="SGD">Summarize Group Discussion (SGD) ⭐ BARU</option>
                <option value="SWT">Summarize Written Text (SWT)</option>
                <option value="WE">Write Essay (WE)</option>
              </optgroup>
              <optgroup label="Reading">
                <option value="R_MCM">Reading Multiple Choice, Multiple (R-MCM)</option>
                <option value="R_MCS">Reading Multiple Choice, Single (R-MCS)</option>
                <option value="RO">Re-order Paragraphs (RO)</option>
                <option value="R_FIB">Reading Fill in the Blanks (R-FIB)</option>
                <option value="RW_FIB">Reading & Writing FIB (RW-FIB)</option>
              </optgroup>
              <optgroup label="Listening">
                <option value="SST">Summarize Spoken Text (SST)</option>
                <option value="L_MCM">Listening Multiple Choice, Multiple (L-MCM)</option>
                <option value="L_FIB">Listening Fill in the Blanks (L-FIB)</option>
                <option value="HCS">Highlight Correct Summary (HCS)</option>
                <option value="L_MCS">Listening Multiple Choice, Single (L-MCS)</option>
                <option value="SMW">Select Missing Word (SMW)</option>
                <option value="HIW">Highlight Incorrect Words (HIW)</option>
                <option value="WFD">Write From Dictation (WFD)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="input-topic" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Topik Latihan (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Australian Wildlife, Campus Facilities"
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              disabled={generating}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem'
              }}
              id="input-topic"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={forceDeterministic}
                onChange={(e) => setForceDeterministic(e.target.checked)}
              />
              <span>Mode Deterministik Cepat (Offline)</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={generating}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem 1rem' }}
              id="btn-generate-question"
            >
              {generating ? 'Menyintesis Soal...' : '🚀 Generate Soal Sekarang'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Koleksi Soal dan Blueprint"
        style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'bank'}
          aria-controls="panel-bank"
          id="tab-btn-bank"
          tabIndex={activeTab === 'bank' ? 0 : -1}
          onClick={() => setActiveTab('bank')}
          onKeyDown={(e) => handleTabKeyDown(e, 'bank')}
          className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'bank' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: 700,
            borderBottom: activeTab === 'bank' ? '2px solid var(--accent-blue)' : 'none',
            cursor: 'pointer'
          }}
        >
          📝 Bank Soal Latihan ({questions.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'blueprints'}
          aria-controls="panel-blueprints"
          id="tab-btn-blueprints"
          tabIndex={activeTab === 'blueprints' ? 0 : -1}
          onClick={() => setActiveTab('blueprints')}
          onKeyDown={(e) => handleTabKeyDown(e, 'blueprints')}
          className={`tab-btn ${activeTab === 'blueprints' ? 'active' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'blueprints' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            fontWeight: 700,
            borderBottom: activeTab === 'blueprints' ? '2px solid var(--accent-purple)' : 'none',
            cursor: 'pointer'
          }}
        >
          📐 Katalog 22 Blueprint Resmi ({blueprints.length})
        </button>
      </div>

      {/* TAB 1: QUESTION BANK */}
      {activeTab === 'bank' && (
        <div role="tabpanel" id="panel-bank" aria-labelledby="tab-btn-bank" tabIndex={0}>
          {/* Section Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'Speaking & Writing', 'Reading', 'Listening'].map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`btn ${selectedSection === sec ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              >
                {sec === 'ALL' ? 'Semua Kategori' : sec}
              </button>
            ))}
          </div>

          {loading ? (
            <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Memuat bank soal...
            </div>
          ) : questions.length === 0 ? (
            <div className="callout callout-info" style={{ textAlign: 'center', padding: '2rem' }}>
              Belum ada soal pada filter ini. Gunakan form di atas untuk men-generate soal baru!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {questions.map((q) => (
                <div key={q.item_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="card-header">
                      <span className="badge badge-purple">{q.type_code} &bull; {q.type_name}</span>
                      <span className="badge badge-emerald">{q.cefr_level || 'B1'}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
                      Kategori: <strong style={{ color: 'var(--accent-cyan)' }}>{q.section}</strong> &bull; Waktu: {q.estimated_time_seconds}s
                    </div>

                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#e2e8f0', margin: '0.75rem 0' }}>
                      {q.prompt_text.length > 140 ? q.prompt_text.substring(0, 140) + '...' : q.prompt_text}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {q.item_id}
                      </code>
                      <button
                        onClick={() => setSelectedQuestion(q)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        id={`btn-view-${q.item_id}`}
                      >
                        🔍 Kunci & Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BLUEPRINT CATALOG */}
      {activeTab === 'blueprints' && (
        <div role="tabpanel" id="panel-blueprints" aria-labelledby="tab-btn-blueprints" tabIndex={0} className="table-wrapper">
          <table className="table">
            <caption className="sr-only">Daftar 22 Blueprint Tipe Soal Resmi Pearson PTE</caption>
            <thead>
              <tr>
                <th>Blueprint ID</th>
                <th>Tipe Soal & Kategori</th>
                <th>Pola Struktur Pedagogis</th>
                <th>Fokus Tata Bahasa</th>
                <th>Kesulitan Target</th>
              </tr>
            </thead>
            <tbody>
              {blueprints.map((bp) => (
                <tr key={bp.blueprint_id}>
                  <td>
                    <code style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>{bp.blueprint_id}</code>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{bp.type_code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bp.type_name}</div>
                    <span className="badge badge-blue" style={{ marginTop: '0.3rem', fontSize: '0.7rem' }}>
                      {bp.section}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '380px' }}>
                    {bp.prompt_structural_pattern}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {bp.grammatical_focus || '-'}
                  </td>
                  <td>
                    <span className="badge badge-emerald">
                      {bp.target_difficulty.replace('DIFF_', '')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-detail-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-purple">{selectedQuestion.type_code}</span>
                <h2 id="modal-detail-title" style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.3rem' }}>
                  Detail Soal Latihan: {selectedQuestion.type_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                aria-label="Tutup jendela detail soal"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Teks Prompt / Skenario Soal:
              </label>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '0.35rem' }}>
                {selectedQuestion.prompt_text}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                Kunci Jawaban / Referensi Ideal:
              </label>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: '1.6', marginTop: '0.35rem', color: '#ecfdf5' }}>
                {selectedQuestion.accepted_canonical_text || 'Tidak ada teks jawaban langsung (Dinilai berdasarkan kelancaran ucapan/pronunciation).'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              <div>Item ID: <code>{selectedQuestion.item_id}</code></div>
              <div>Model: <code>{selectedQuestion.generation_model}</code></div>
              <div>Estimasi Waktu: <strong>{selectedQuestion.estimated_time_seconds} detik</strong></div>
              <div>Hash SHA-256: <code>{selectedQuestion.uniqueness_hash.substring(0, 16)}...</code></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="btn btn-primary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
        <Link href="/" className="btn btn-secondary">
          &larr; Beranda
        </Link>
        <Link href="/admin/sources" className="btn btn-secondary">
          Admin & Karantina
        </Link>
      </div>
    </div>
  );
}
