import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-card">
        <div className="hero-pill">Platform Lengkap (Fase 1–8) &bull; Localhost Engine</div>
        <h1 className="hero-title">
          PTE Academic Personal Intelligence Platform
        </h1>
        <p className="hero-desc">
          Platform web lokal mandiri untuk persiapan terarah membuktikan <strong>Functional English</strong> pada visa <strong>Australia Work and Holiday Subclass 462</strong>. Berjalan 100% di komputer pribadi Anda, tanpa login eksternal, tanpa server cloud, dan ditenagai kecerdasan buatan lokal tanpa biaya API.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard" className="btn btn-emerald" id="hero-btn-dashboard" style={{ fontWeight: 700 }}>
            <span>🏆 Buka Executive Readiness Dashboard</span>
          </Link>
          <Link href="/practice" className="btn btn-primary" id="hero-btn-practice">
            <span>🎯 Mulai Latihan & Simulasi Ujian</span>
          </Link>
          <Link href="/curriculum" className="btn btn-secondary" id="hero-btn-curriculum">
            <span>🗓️ Kurikulum & Remediasi</span>
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Target Skor Visa</span>
            <span className="badge badge-emerald">LEGAL 24 / AMAN 36+</span>
          </div>
          <div className="card-number">36+</div>
          <p className="card-desc">
            Batas legal pasca-7 Ags 2025 adalah 24. Target latihan aman 36+ memberi bantalan CEFR B1.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Database Lokal</span>
            <span className="badge badge-blue">SQLITE WAL</span>
          </div>
          <div className="card-number">30</div>
          <p className="card-desc">
            Tabel skema relasional lengkap siap menampung bank soal, audio, evaluasi, dan kurikulum.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Cakupan Tipe Soal</span>
            <span className="badge badge-purple">POST-AUG 2025</span>
          </div>
          <div className="card-number">22 Tipe</div>
          <p className="card-desc">
            Mencakup 2 soal baru: <em>Respond to a Situation</em> & <em>Summarize Group Discussion</em>.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Audit Berkas Lokal</span>
            <span className="badge badge-amber">5 ARTIFAK</span>
          </div>
          <div className="card-number">100%</div>
          <p className="card-desc">
            Materi draft, template, study plan, dan transkrip UT terimpor dengan hash integritas SHA-256.
          </p>
        </div>
      </div>

      {/* Callout Notice for Watershed Rule Changes */}
      <div className="callout callout-info" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: '#fff' }}>
          💡 Peringatan Kritis Regulasi & Kebijakan Template Pearson 2025/2026:
        </h2>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.7', fontSize: '0.9rem' }}>
          <li>
            <strong>Perubahan Syarat Skor DHA (7 Agustus 2025):</strong> Untuk tes yang diambil mulai 7 Agustus 2025, syarat skor resmi Functional English Subclass 462 adalah <strong>Overall minimal 24</strong> (tidak ada syarat minimum per skill).
          </li>
          <li>
            <strong>Bahaya Fatal Template Kaku:</strong> Pearson memberlakukan <em>Human Review Gate</em>. Menghafal mati template kalimat kosong berisiko diganjar <strong>skor Content = 0</strong>. Platform ini menerapkan <strong>Structural Frameworks</strong> dengan leksikon kontekstual.
          </li>
          <li>
            <strong>Larangan Tes Online:</strong> Hasil tes dari rumah (*PTE Academic Online / at-home*) ditolak mentah-mentah oleh Department of Home Affairs. Ujian wajib tatap muka di *Pusat Tes Resmi (Test Centre)*.
          </li>
          <li>
            <strong>Status Transkrip UT:</strong> Transkrip S1 Akuntansi UT milik Hazza Bhaskara Hedyana Putra valid untuk membuktikan syarat kualifikasi pendidikan tinggi WHV/SDUWHV, tetapi tidak menggantikan kewajiban tes bahasa Inggris karena bahasa pengantarnya bahasa Indonesia.
          </li>
        </ul>
      </div>

      {/* 8-Phase Delivery Roadmap Overview */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Peta Jalan Pelaksanaan 8 Fase (Strict Gate Architecture)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Setiap fase dieksekusi secara independen dengan verifikasi automated tests dan smoke test lokal.
            </p>
          </div>
          <span className="badge badge-emerald">FASE 1 SELESAI &bull; SIAP FASE 2</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>FASE 1 (AKTIF)</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Fondasi, Setup Wizard & Database</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Next.js 15, SQLite 30 tabel WAL, probe hardware, import draft & audit claims.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 2 (BERIKUTNYA)</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Source Registry & Scraping</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Trusted vs Discovery mode, quarantine queue, deduplikasi, admin console review.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 3</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Question Bank & Blueprint Gen</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>22 blueprint tipe soal, generator soal orisinal via Ollama, anti-plagiarisme.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 4</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Practice Modes & Timers</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Drill tipe soal, section test, full mock test 2j 15m, aturan mikrofon 3 detik.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 5</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Objective Scoring Engine</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Reading & Listening FIB, negative marking floor 0, WFD partial credit evaluation.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 6</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Local AI, STT & TTS</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Faster-Whisper STT (word timestamps), Piper TTS, evaluasi speaking/writing Ollama.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 7</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Adaptive Curriculum & SR</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Rencana 2/4/8/12 minggu, SuperMemo SM-2, remedi typo, modul Practical English AU.</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>FASE 8</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Readiness Analytics & Packaging</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Executive dashboard, kalkulator kesiapan visa, backup otomatis terenkripsi.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
