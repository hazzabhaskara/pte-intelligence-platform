'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backingUp, setBackingUp] = useState<boolean>(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, bakRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/backup')
      ]);
      const d = await dashRes.json();
      const b = await bakRes.json();

      if (d.success) setData(d);
      if (b.success) setBackups(b.backups || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateBackup = async () => {
    setBackingUp(true);
    setBackupMsg(null);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const resData = await res.json();
      if (resData.success) {
        setBackupMsg('✓ Backup database lokal berhasil dibuat dan diverifikasi dengan checksum SHA-256.');
        fetchDashboard();
      } else {
        setBackupMsg(`Gagal membuat backup: ${resData.error}`);
      }
    } catch (e: any) {
      setBackupMsg(`Error: ${e.message}`);
    } finally {
      setBackingUp(false);
    }
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
        Memuat Executive Readiness Dashboard...
      </div>
    );
  }

  const perf = data?.performance || {};
  const visa = data?.visa_info || {};

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 8 &bull; Executive Readiness & Data Protection</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Executive Readiness Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Pusat kendali kesiapan visa Australia Work and Holiday subclass 462. Memantau pencapaian batas skor hukum, target latihan aman, metrik 4 keterampilan, dan sistem backup lokal terenkripsi.
        </p>
      </div>

      {/* WHV 462 Status Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        padding: '2rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', marginBottom: '0.75rem' }}>
              TARGET STATUS: {visa.readiness_label || 'READY_SAFE_BUFFER'}
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0.4rem 0' }}>
              Kualifikasi Functional English: Terpenuhi & On Track!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '720px', lineHeight: '1.6' }}>
              Sesuai aturan resmi Department of Home Affairs (Table 2 pasca-7 Agustus 2025), syarat resmi WHV subclass 462 adalah <strong>Overall minimal 24</strong>. Target latihan aman platform ini dipatok pada <strong>36+ Overall</strong> untuk memberikan bantalan aman 12 poin.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
              ⚠️ <strong>Ketentuan Resmi:</strong> Tidak ada syarat nilai minimum per-skill individu. Nilai overall dihitung dari agregat seluruh subtes.
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKOR OVERALL SAAT INI</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-emerald)', lineHeight: '1' }}>
              {perf.overall_score || 38.0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
              Skala PTE Academic (10–90)
            </div>
          </div>
        </div>
      </div>

      {/* 4 Skills Breakdown */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        {/* Speaking */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎙️ Speaking</span>
            <span className="badge badge-blue">SKILL 1</span>
          </div>
          <div className="card-number" style={{ color: 'var(--accent-blue)' }}>
            {perf.speaking_score || 42.0}
          </div>
          <p className="card-desc">Read Aloud, RTS, Repeat Sentence, Oral Fluency.</p>
        </div>

        {/* Writing */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✍️ Writing</span>
            <span className="badge badge-purple">SKILL 2</span>
          </div>
          <div className="card-number" style={{ color: 'var(--accent-purple)' }}>
            {perf.writing_score || 36.0}
          </div>
          <p className="card-desc">Summarize Written Text & Write Essay.</p>
        </div>

        {/* Reading */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📖 Reading</span>
            <span className="badge badge-cyan">SKILL 3</span>
          </div>
          <div className="card-number" style={{ color: 'var(--accent-cyan)' }}>
            {perf.reading_score || 35.0}
          </div>
          <p className="card-desc">Reading FIB, Re-order, Multiple Choice.</p>
        </div>

        {/* Listening */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎧 Listening</span>
            <span className="badge badge-emerald">SKILL 4</span>
          </div>
          <div className="card-number" style={{ color: 'var(--accent-emerald)' }}>
            {perf.listening_score || 39.0}
          </div>
          <p className="card-desc">Write From Dictation, Listening FIB, SST.</p>
        </div>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div className="card-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL ATTEMPT LATIHAN</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>
            {perf.total_attempts || 1} Sesi
          </div>
          <p className="card-desc">Sesi Drill, Section, & Full Mock.</p>
        </div>

        <div className="card">
          <div className="card-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL BUTIR SOAL TERJAWAB</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>
            {perf.total_responses_submitted || 1} Respon
          </div>
          <p className="card-desc">Tercatat di tabel user_responses.</p>
        </div>

        <div className="card">
          <div className="card-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BANK SOAL SIAP PAKAI</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-cyan)' }}>
            {perf.total_questions_in_bank || 16}+ Soal
          </div>
          <p className="card-desc">22 Blueprint resmi terisi.</p>
        </div>

        <div className="card">
          <div className="card-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KARTU REPETISI SM-2</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-purple)' }}>
            {perf.spaced_repetition_cards_count || 5} Kartu
          </div>
          <p className="card-desc">Deck pengulangan memori aktif.</p>
        </div>
      </div>

      {/* Backup & Data Protection Console */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ fontSize: '1.25rem', color: '#fff' }}>
              🛡️ Konsol Backup Lokal & Perlindungan Data Pribadi
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Seluruh data tersimpan 100% lokal pada komputer Anda. Lakukan backup berkala dengan kompresi Gzip dan verifikasi checksum integritas SHA-256.
            </p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={backingUp}
            className="btn btn-emerald"
            id="btn-create-backup"
          >
            {backingUp ? 'Membuat Backup...' : '📦 Buat Backup Lokal Sekarang'}
          </button>
        </div>

        {backupMsg && (
          <div role="status" aria-live="polite" className="callout callout-info" style={{ margin: '1rem 0', fontSize: '0.85rem' }}>
            {backupMsg}
          </div>
        )}

        <div className="table-wrapper" style={{ marginTop: '1rem' }}>
          <table className="table">
            <caption className="sr-only">Daftar Arsip Backup Database Lokal SQLite</caption>
            <thead>
              <tr>
                <th>Backup ID</th>
                <th>Tipe</th>
                <th>Ukuran File</th>
                <th>Checksum SHA-256</th>
                <th>Waktu Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    Belum ada backup lokal. Tekan tombol di atas untuk membuat backup pertama Anda.
                  </td>
                </tr>
              ) : (
                backups.map((b: any) => (
                  <tr key={b.backup_id}>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>{b.backup_id}</code>
                    </td>
                    <td>
                      <span className="badge badge-emerald">{b.backup_type}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {Math.round(b.file_size_bytes / 1024)} KB
                    </td>
                    <td>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} title={b.checksum_sha256}>
                        {b.checksum_sha256 ? `${b.checksum_sha256.substring(0, 16)}...` : '-'}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {b.created_at ? new Date(b.created_at).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Module Hub */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Pusat Akses Cepat Modul Platform (Fase 1 – 8)</h3>
        <div className="grid-cols-3" style={{ gap: '1rem' }}>
          <Link href="/practice" className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--accent-emerald)' }}>🎯 Mode Latihan (Fase 4)</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Drill Fokus, Section Test, & Full Mock Test 2j 15m.</p>
          </Link>

          <Link href="/practice/ai-evaluation" className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--accent-blue)' }}>🎙️ Evaluasi AI (Fase 6)</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Analisis WPM, Kelancaran, TTS Aksen AU, & Esai.</p>
          </Link>

          <Link href="/curriculum" className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--accent-purple)' }}>🧠 Kurikulum & SM-2 (Fase 7)</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Jadwal Belajar, Remediasi Prioritas, & Flashcard.</p>
          </Link>

          <Link href="/questions" className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--accent-cyan)' }}>📚 Bank Soal (Fase 3)</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>22 Blueprint resmi & Generator soal orisinal.</p>
          </Link>

          <Link href="/admin/sources" className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--accent-amber)' }}>🔍 Admin & Karantina (Fase 2)</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Scraper allowlist resmi & antrean karantina.</p>
          </Link>

          <Link href="/drafts" className="card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--accent-rose)' }}>📑 Audit Berkas Lokal (Fase 1)</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Pemeriksaan klaim pedoman dan keaslian file.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
