'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AttemptRecord {
  attempt_id: string;
  session_mode: string;
  started_at: string;
  completed_at: string | null;
  total_duration_seconds: number | null;
  calculated_overall_score: number | null;
  readiness_status: string | null;
  response_count: number;
}

export default function PracticePage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Drill selections
  const [drillType, setDrillType] = useState<string>('RA');
  const [sectionChoice, setSectionChoice] = useState<string>('Speaking & Writing');

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/practice/sessions');
      const data = await res.json();
      if (data.success) {
        setAttempts(data.attempts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleStartDrill = () => {
    router.push(`/practice/simulator?mode=DRILL&type=${drillType}`);
  };

  const handleStartSection = () => {
    router.push(`/practice/simulator?mode=SECTION_TEST&section=${encodeURIComponent(sectionChoice)}`);
  };

  const handleStartFullMock = () => {
    router.push(`/practice/simulator?mode=FULL_MOCK`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 4 &bull; Practice Modes Engine</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Simulasi & Mode Latihan Interaktif
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Pilih metode latihan yang sesuai dengan ritme belajar Anda. Dari drill fokus per-tipe soal, simulasi per seksi dengan timer ketat, hingga simulasi ujian penuh 2 jam 15 menit.
        </p>
      </div>

      {/* 3 Practice Mode Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        {/* MODE 1: DRILL */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">🎯 Mode 1: Drill Fokus</span>
              <span className="badge badge-blue">REPETITIVE</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Latihan berulang pada satu tipe soal spesifik (misal: <em>Read Aloud</em>, <em>Write From Dictation</em>, atau <em>Respond to a Situation</em>) untuk mengasah kebiasaan dan refleks.
            </p>

            <label htmlFor="select-drill-type" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Pilih Tipe Soal:
            </label>
            <select
              value={drillType}
              onChange={(e) => setDrillType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}
              id="select-drill-type"
            >
              <option value="RA">Read Aloud (RA)</option>
              <option value="RS">Repeat Sentence (RS)</option>
              <option value="RTS">Respond to a Situation (RTS) ⭐</option>
              <option value="SGD">Summarize Group Discussion (SGD) ⭐</option>
              <option value="SWT">Summarize Written Text (SWT)</option>
              <option value="WE">Write Essay (WE)</option>
              <option value="WFD">Write From Dictation (WFD)</option>
              <option value="R_FIB">Reading Fill in the Blanks (R-FIB)</option>
              <option value="RW_FIB">Reading & Writing FIB (RW-FIB)</option>
            </select>
          </div>

          <button
            onClick={handleStartDrill}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.65rem' }}
            id="btn-start-drill"
          >
            Mulai Drill Fokus &rarr;
          </button>
        </div>

        {/* MODE 2: SECTION TEST */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">⏱️ Mode 2: Section Test</span>
              <span className="badge badge-purple">TIMED SECTION</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Simulasi satu seksi utuh dengan batas waktu resmi. Menguji ketahanan fokus dan pembagian alokasi waktu per soal dalam satu blok keterampilan.
            </p>

            <label htmlFor="select-section-choice" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Pilih Seksi Ujian:
            </label>
            <select
              value={sectionChoice}
              onChange={(e) => setSectionChoice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}
              id="select-section-choice"
            >
              <option value="Speaking & Writing">Part 1: Speaking & Writing (~54-67m)</option>
              <option value="Reading">Part 2: Reading (~29-30m)</option>
              <option value="Listening">Part 3: Listening (~30-43m)</option>
            </select>
          </div>

          <button
            onClick={handleStartSection}
            className="btn btn-emerald"
            style={{ width: '100%', padding: '0.65rem' }}
            id="btn-start-section"
          >
            Mulai Section Test &rarr;
          </button>
        </div>

        {/* MODE 3: FULL MOCK */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div>
            <div className="card-header">
              <span className="card-title">🏆 Mode 3: Full Mock Simulator</span>
              <span className="badge badge-emerald">FULL EXAM</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Simulasi ujian lengkap ~2 jam 15 menit. Mereplikasi urutan soal Pearson resmi, aturan mikrofon hening 3 detik, dan navigasi tanpa jeda untuk mengukur kesiapan visa WHV.
            </p>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#ecfdf5', marginBottom: '1.25rem' }}>
              ✓ Alokasi waktu penuh ~2j 15m<br />
              ✓ Aturan ketat mikrofon 3 detik<br />
              ✓ Estimasi skor & analisis kesiapan
            </div>
          </div>

          <button
            onClick={handleStartFullMock}
            className="btn btn-emerald"
            style={{ width: '100%', padding: '0.65rem', fontWeight: 700 }}
            id="btn-start-full-mock"
          >
            Mulai Full Mock Test (2j 15m) &rarr;
          </button>
        </div>
      </div>

      {/* History of Practice Sessions */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Riwayat Sesi Latihan & Simulasi</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Daftar attempt sesi latihan yang tercatat di database lokal Anda.
            </p>
          </div>
          <span className="badge badge-blue">LOG LOKAL</span>
        </div>

        {loading ? (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            Memuat riwayat sesi...
          </div>
        ) : attempts.length === 0 ? (
          <div className="callout callout-info" style={{ textAlign: 'center', padding: '2rem' }}>
            Belum ada riwayat sesi latihan. Pilih salah satu mode di atas untuk memulai latihan pertama Anda!
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <caption className="sr-only">Daftar Riwayat Sesi Latihan dan Simulasi Ujian PTE</caption>
              <thead>
                <tr>
                  <th>Attempt ID</th>
                  <th>Mode Sesi</th>
                  <th>Waktu Mulai</th>
                  <th>Durasi</th>
                  <th>Soal Terjawab</th>
                  <th>Estimasi Skor</th>
                  <th>Status Kesiapan</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att.attempt_id}>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>{att.attempt_id}</code>
                    </td>
                    <td>
                      <span className={`badge ${att.session_mode === 'FULL_MOCK' ? 'badge-emerald' : (att.session_mode === 'SECTION_TEST' ? 'badge-purple' : 'badge-blue')}`}>
                        {att.session_mode}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {att.started_at ? new Date(att.started_at).toLocaleString('id-ID') : '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {att.total_duration_seconds ? `${Math.round(att.total_duration_seconds / 60)} menit` : 'Sedang berjalan'}
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {att.response_count} soal
                    </td>
                    <td>
                      {att.calculated_overall_score ? (
                        <span style={{ fontWeight: 700, color: att.calculated_overall_score >= 36 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                          {att.calculated_overall_score}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Belum selesai</span>
                      )}
                    </td>
                    <td>
                      {att.readiness_status ? (
                        <span className={`badge ${att.readiness_status.includes('SAFE') ? 'badge-emerald' : 'badge-amber'}`}>
                          {att.readiness_status}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
        <Link href="/" className="btn btn-secondary">
          &larr; Beranda
        </Link>
        <Link href="/questions" className="btn btn-secondary">
          Bank Soal
        </Link>
      </div>
    </div>
  );
}
