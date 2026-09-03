'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProbeData {
  timestamp: string;
  node: { installed: boolean; version: string; status: string };
  python: { installed: boolean; version: string; executable: string; status: string };
  docker: { installed: boolean; version: string | null; status: string };
  database: { exists: boolean; table_count: number; journal_mode: string; size_bytes: number; status: string };
  ollama: { cli_installed: boolean; api_running: boolean; endpoint: string; models: string[]; status: string; guidance: string };
  speech: {
    stt: { engine: string; available: boolean; status: string; recommended_package: string };
    tts: { engine: string; available: boolean; status: string; recommended_model: string };
  };
  hardware: {
    ram: { total_gb: number; free_gb: number; recommendation: string };
    gpu: { devices: string[]; acceleration: string };
    disk: { drive: string; free_gb: number; total_gb: number; status: string };
  };
}

export default function SetupWizardPage() {
  const [probe, setProbe] = useState<ProbeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProbe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/setup/probe');
      const json = await res.json();
      if (json.success) {
        setProbe(json.data);
      } else {
        setError(json.error || 'Gagal mengambil data diagnosa sistem');
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi ke endpoint probe gagal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProbe();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Setup Wizard & Diagnostik Sistem</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Inspeksi Lingkungan Komputer Lokal
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px' }}>
          Platform memverifikasi kesiapan runtime lokal, database SQLite ber-skema 30 tabel, ketersediaan Ollama, dan kapabilitas hardware Anda secara non-intrusif tanpa auto-install.
        </p>
      </div>

      <div className="callout callout-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>Prinsip Kedaulatan Sistem Lokal:</strong> Platform ini tidak akan pernah memasang software sistem, driver, atau model besar tanpa persetujuan manual Anda.
        </div>
        <button
          onClick={fetchProbe}
          disabled={loading}
          className="btn btn-secondary"
          id="btn-refresh-probe"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          {loading ? 'Memindai...' : '🔄 Pindai Ulang Sistem'}
        </button>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="callout callout-danger" style={{ marginBottom: '1.5rem' }}>
          <strong>Terjadi Kesalahan:</strong> {error}
        </div>
      )}

      {loading && !probe && (
        <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem' }}>Sedang memeriksa hardware, database, dan runtime komputer Anda...</p>
        </div>
      )}

      {probe && (
        <>
          <div className="grid-cols-4">
            {/* Card 1: Node.js */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Node.js Runtime</span>
                <span className={`badge ${probe.node.installed ? 'badge-emerald' : 'badge-rose'}`}>
                  {probe.node.status}
                </span>
              </div>
              <div className="card-number" style={{ fontSize: '1.5rem' }}>
                {probe.node.version || 'Tidak Ditemukan'}
              </div>
              <p className="card-desc">Runtime aplikasi web Next.js v15 dengan native node:sqlite support.</p>
            </div>

            {/* Card 2: Python */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Python 3 Worker</span>
                <span className={`badge ${probe.python.installed ? 'badge-emerald' : 'badge-rose'}`}>
                  {probe.python.status}
                </span>
              </div>
              <div className="card-number" style={{ fontSize: '1.5rem' }}>
                v{probe.python.version}
              </div>
              <p className="card-desc">Worker komputasi audio, scraping data, dan inspeksi sistem.</p>
            </div>

            {/* Card 3: Database SQLite */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Database SQLite</span>
                <span className={`badge ${probe.database.status === 'PASS' ? 'badge-emerald' : 'badge-amber'}`}>
                  {probe.database.status}
                </span>
              </div>
              <div className="card-number" style={{ fontSize: '1.5rem' }}>
                {probe.database.table_count} Tabel
              </div>
              <p className="card-desc">
                Mode: <strong>{probe.database.journal_mode.toUpperCase()}</strong> &bull; Ukuran: {(probe.database.size_bytes / 1024).toFixed(0)} KB
              </p>
            </div>

            {/* Card 4: Docker Engine */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Docker (Opsional)</span>
                <span className={`badge ${probe.docker.installed ? 'badge-blue' : 'badge-amber'}`}>
                  {probe.docker.status}
                </span>
              </div>
              <div className="card-number" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>
                {probe.docker.version ? probe.docker.version.split(',')[0] : 'Tidak Aktif'}
              </div>
              <p className="card-desc">Opsional: Dapat digunakan jika Anda ingin menjalankan Postgres + pgvector.</p>
            </div>
          </div>

          <div className="grid-cols-2">
            {/* Ollama Local AI Card */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🤖</span>
                  <span className="card-title">Mesin AI Lokal (Ollama)</span>
                </div>
                <span className={`badge ${probe.ollama.api_running ? 'badge-emerald' : 'badge-amber'}`}>
                  {probe.ollama.status}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Endpoint: <code>{probe.ollama.endpoint}</code>
              </p>

              {probe.ollama.api_running ? (
                <div className="callout callout-success">
                  <strong>Ollama Aktif di Localhost!</strong><br />
                  Model terdeteksi: {probe.ollama.models.length > 0 ? probe.ollama.models.join(', ') : 'Belum ada model terinstall'}
                </div>
              ) : (
                <div className="callout callout-warning">
                  <strong>Status: Standby / Belum Berjalan</strong><br />
                  {probe.ollama.guidance}
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    Panduan Cepat:<br />
                    1. Unduh Ollama dari <a href="https://ollama.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>ollama.com</a><br />
                    2. Jalankan perintah di terminal: <code>ollama run qwen2.5:7b-instruct</code><br />
                    3. Aplikasi akan langsung terhubung otomatis tanpa konfigurasi rumit.
                  </div>
                </div>
              )}
            </div>

            {/* Hardware & Acceleration Card */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚡</span>
                  <span className="card-title">Profil Hardware & Storage</span>
                </div>
                <span className="badge badge-emerald">OPTIMAL</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total RAM Komputer</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{probe.hardware.ram.total_gb} GB</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Free: {probe.hardware.ram.free_gb} GB</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kapasitas Drive {probe.hardware.disk.drive}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{probe.hardware.disk.free_gb} GB Free</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total: {probe.hardware.disk.total_gb} GB</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                <div>🎮 <strong>GPU Terdeteksi:</strong> {probe.hardware.gpu.devices.join(', ')}</div>
                <div>💡 <strong>Rekomendasi AI:</strong> {probe.hardware.ram.recommendation}</div>
                <div>🎤 <strong>Speech Stack:</strong> Faster-Whisper (STT) & Piper (TTS) siap dikonfigurasi pada Fase 6.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link href="/drafts" className="btn btn-primary" id="btn-goto-drafts">
              Periksa Berkas Draft Lokal Terimpor &rarr;
            </Link>
            <Link href="/" className="btn btn-secondary">
              Kembali ke Beranda
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
