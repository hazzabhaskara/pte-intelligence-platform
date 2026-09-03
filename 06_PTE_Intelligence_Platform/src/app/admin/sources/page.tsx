'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SourceItem {
  source_id: string;
  title: string;
  publisher: string;
  url: string;
  source_tier: string;
  reliability_score: number;
  license_status: string;
  content_type: string;
  verification_status: string;
  last_crawled_at: string;
  content_hash: string;
}

interface QuarantineItem {
  review_id: string;
  job_id: string;
  source_url: string;
  extracted_payload: string;
  duplicate_similarity: number;
  copyright_flag: boolean;
  confidence_score: number;
  ai_recommendation: string;
  review_status: string;
  created_at: string;
}

interface ScrapingJob {
  job_id: string;
  mode: string;
  target_url: string;
  status: string;
  items_crawled: number;
  items_quarantined: number;
  error_message: string | null;
  started_at: string;
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [queue, setQueue] = useState<QuarantineItem[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'quarantine' | 'jobs'>('sources');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [discoveryUrl, setDiscoveryUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [srcRes, qRes] = await Promise.all([
        fetch('/api/sources').then(r => r.json()),
        fetch('/api/quarantine').then(r => r.json())
      ]);
      if (srcRes.success) {
        setSources(srcRes.sources || []);
        setJobs(srcRes.jobs || []);
      }
      if (qRes.success) {
        setQueue(qRes.queue || []);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'danger', text: err.message || 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunTrusted = async () => {
    setScanning(true);
    setStatusMsg({ type: 'info', text: 'Menjalankan Trusted Scan untuk DHA & Pearson (memeriksa ETag/Last-Modified)...' });
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'TRUSTED' })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Trusted scan selesai. Sumber resmi telah diverifikasi.' });
        fetchData();
      } else {
        setStatusMsg({ type: 'danger', text: data.error || 'Trusted scan gagal' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'danger', text: e.message });
    } finally {
      setScanning(false);
    }
  };

  const tabsList: ('sources' | 'quarantine' | 'jobs')[] = ['sources', 'quarantine', 'jobs'];
  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: 'sources' | 'quarantine' | 'jobs') => {
    const idx = tabsList.indexOf(currentTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = tabsList[(idx + 1) % tabsList.length];
      setActiveTab(nextTab);
      document.getElementById(`tab-btn-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = tabsList[(idx - 1 + tabsList.length) % tabsList.length];
      setActiveTab(prevTab);
      document.getElementById(`tab-btn-${prevTab}`)?.focus();
    }
  };

  const handleRunDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoveryUrl.trim()) {
      setStatusMsg({ type: 'danger', text: 'Silakan masukkan URL materi sebelum memulai pemindaian.' });
      document.getElementById('input-discovery-url')?.focus();
      return;
    }
    setScanning(true);
    setStatusMsg({ type: 'info', text: `Memindai URL dan mengisolasi ke karantina: ${discoveryUrl}` });
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'DISCOVERY', url: discoveryUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'URL berhasil diunduh dan ditempatkan di Karantina untuk Anda review.' });
        setDiscoveryUrl('');
        setActiveTab('quarantine');
        fetchData();
      } else {
        setStatusMsg({ type: 'danger', text: data.error || 'Discovery scan gagal' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'danger', text: e.message });
    } finally {
      setScanning(false);
    }
  };

  const handleQuarantineAction = async (review_id: string, action: string) => {
    try {
      const res = await fetch('/api/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id, action })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Item ${review_id} berhasil diubah statusnya menjadi ${action}` });
        fetchData();
      } else {
        setStatusMsg({ type: 'danger', text: data.error || 'Gagal mengubah status review' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'danger', text: e.message });
    }
  };

  const pendingCount = queue.filter(q => q.review_status === 'PENDING').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 2 &bull; Source Registry & Quarantine Review Console</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Manajemen Sumber & Antrean Karantina
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Kelola sumber resmi allowlist, pantau pembaruan regulasi DHA/Pearson via ETag, dan periksa materi komunitas di antrean karantina dengan proteksi hak cipta.
        </p>
      </div>

      {statusMsg && (
        <div
          role={statusMsg.type === 'danger' ? 'alert' : 'status'}
          aria-live={statusMsg.type === 'danger' ? 'assertive' : 'polite'}
          className={`callout callout-${statusMsg.type}`}
          style={{ marginBottom: '1.5rem' }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Sumber Tepercaya</span>
            <span className="badge badge-emerald">ALLOWLIST</span>
          </div>
          <div className="card-number">{sources.length}</div>
          <p className="card-desc">Domain terverifikasi: DHA, Pearson, & Draft Lokal.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Antrean Karantina</span>
            <span className={`badge ${pendingCount > 0 ? 'badge-amber' : 'badge-blue'}`}>
              {pendingCount > 0 ? `${pendingCount} PENDING` : 'BERSIH'}
            </span>
          </div>
          <div className="card-number">{pendingCount}</div>
          <p className="card-desc">Item baru menunggu inspeksi manual sebelum masuk bank soal.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Pekerjaan Scraping</span>
            <span className="badge badge-purple">LOCAL JOBS</span>
          </div>
          <div className="card-number">{jobs.length}</div>
          <p className="card-desc">Total riwayat eksekusi crawling yang tercatat di database.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Kepatuhan Etika</span>
            <span className="badge badge-emerald">ZERO BYPASS</span>
          </div>
          <div className="card-number">100%</div>
          <p className="card-desc">Patuhi robots.txt, jeda &ge; 3 detik, anti-bocoran soal.</p>
        </div>
      </div>

      {/* Scraping Trigger Controls */}
      <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        {/* Trusted Mode Control */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🛡️ Mode 1: Trusted Scan (Allowlist Resmi)</span>
            <span className="badge badge-emerald">SCHEDULED</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            Memeriksa pembaruan resmi pada portal <code>homeaffairs.gov.au</code> dan <code>pearsonpte.com</code> menggunakan <em>HTTP Conditional GET</em> (ETag/Last-Modified). Jika tidak ada perubahan, sistem tidak menghabiskan bandwidth.
          </p>
          <button
            onClick={handleRunTrusted}
            disabled={scanning}
            className="btn btn-emerald"
            id="btn-run-trusted-scan"
          >
            {scanning ? 'Sedang Memindai...' : '🚀 Jalankan Trusted Scan Sekarang'}
          </button>
        </div>

        {/* Discovery Mode Control */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔍 Mode 2: Discovery Scan (Zero-Trust)</span>
            <span className="badge badge-amber">QUARANTINE FIRST</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
            Masukkan URL baru untuk diekstrak. Seluruh hasil <strong>wajib masuk isolasi Karantina</strong> dan diperiksa tingkat plagiarisme serta risiko klaim menyesatkan.
          </p>
          <form onSubmit={handleRunDiscovery} style={{ display: 'flex', gap: '0.5rem' }}>
            <label htmlFor="input-discovery-url" className="sr-only">
              URL Materi PTE untuk Discovery Scan
            </label>
            <input
              type="text"
              id="input-discovery-url"
              placeholder="https://example.com/pte-guide"
              value={discoveryUrl}
              onChange={(e) => setDiscoveryUrl(e.target.value)}
              disabled={scanning}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem'
              }}
            />
            <button
              type="submit"
              disabled={scanning}
              className="btn btn-primary"
              id="btn-run-discovery-scan"
            >
              {scanning ? 'Memindai...' : 'Scan URL'}
            </button>
          </form>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Kategori Manajemen Sumber"
        style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'sources'}
          aria-controls="panel-sources"
          id="tab-btn-sources"
          tabIndex={activeTab === 'sources' ? 0 : -1}
          onClick={() => setActiveTab('sources')}
          onKeyDown={(e) => handleTabKeyDown(e, 'sources')}
          className={`tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'sources' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: 700,
            borderBottom: activeTab === 'sources' ? '2px solid var(--accent-blue)' : 'none',
            cursor: 'pointer'
          }}
        >
          📂 Source Registry ({sources.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'quarantine'}
          aria-controls="panel-quarantine"
          id="tab-btn-quarantine"
          tabIndex={activeTab === 'quarantine' ? 0 : -1}
          onClick={() => setActiveTab('quarantine')}
          onKeyDown={(e) => handleTabKeyDown(e, 'quarantine')}
          className={`tab-btn ${activeTab === 'quarantine' ? 'active' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'quarantine' ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: 700,
            borderBottom: activeTab === 'quarantine' ? '2px solid var(--accent-amber)' : 'none',
            cursor: 'pointer'
          }}
        >
          ⚠️ Quarantine Review Queue ({queue.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'jobs'}
          aria-controls="panel-jobs"
          id="tab-btn-jobs"
          tabIndex={activeTab === 'jobs' ? 0 : -1}
          onClick={() => setActiveTab('jobs')}
          onKeyDown={(e) => handleTabKeyDown(e, 'jobs')}
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'jobs' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            fontWeight: 700,
            borderBottom: activeTab === 'jobs' ? '2px solid var(--accent-purple)' : 'none',
            cursor: 'pointer'
          }}
        >
          📜 Log Pekerjaan ({jobs.length})
        </button>
      </div>

      {loading && (
        <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          Memuat data dari SQLite database...
        </div>
      )}

      {/* TAB 1: Source Registry */}
      {!loading && activeTab === 'sources' && (
        <div role="tabpanel" id="panel-sources" aria-labelledby="tab-btn-sources" tabIndex={0} className="table-wrapper">
          <table className="table">
            <caption className="sr-only">Daftar Sumber Resmi dan Materi Terdaftar</caption>
            <thead>
              <tr>
                <th>Source ID</th>
                <th>Judul & Penerbit</th>
                <th>Tier & Score</th>
                <th>Tipe Konten</th>
                <th>SHA-256 Hash</th>
                <th>Status Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.source_id}>
                  <td>
                    <code style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{src.source_id}</code>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{src.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{src.publisher}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{src.url}</div>
                  </td>
                  <td>
                    <span className={`badge ${src.source_tier === 'Tier 1' ? 'badge-emerald' : 'badge-amber'}`}>
                      {src.source_tier} ({Math.round(src.reliability_score * 100)}%)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{src.content_type}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {src.content_hash ? src.content_hash.substring(0, 16) + '...' : '-'}
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${src.verification_status === 'VERIFIED_TRUSTED' ? 'badge-emerald' : 'badge-blue'}`}>
                      {src.verification_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Quarantine Review Queue */}
      {!loading && activeTab === 'quarantine' && (
        <div role="tabpanel" id="panel-quarantine" aria-labelledby="tab-btn-quarantine" tabIndex={0}>
          {queue.length === 0 ? (
            <div className="callout callout-info" style={{ textAlign: 'center', padding: '2.5rem' }}>
              Tidak ada item di antrean karantina. Semua sumber yang tersimpan sudah bersih dan terverifikasi.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {queue.map((item) => {
                let payload = { title: item.source_url, text_excerpt: '', sha256: '', flags: [] };
                try {
                  payload = JSON.parse(item.extracted_payload);
                } catch (e) {}

                return (
                  <div key={item.review_id} className="card" style={{ borderLeft: item.copyright_flag ? '4px solid var(--accent-rose)' : '4px solid var(--accent-amber)' }}>
                    <div className="card-header">
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-purple)', marginRight: '0.75rem' }}>
                          {item.review_id}
                        </span>
                        <strong style={{ fontSize: '1.1rem' }}>{payload.title || item.source_url}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className={`badge ${item.review_status === 'PENDING' ? 'badge-amber' : (item.review_status === 'APPROVED' ? 'badge-emerald' : 'badge-rose')}`}>
                          {item.review_status}
                        </span>
                        <span className="badge badge-purple">
                          Rekomendasi AI: {item.ai_recommendation}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      URL: <code>{item.source_url}</code> &bull; Hash: <code>{payload.sha256 ? payload.sha256.substring(0, 16) + '...' : '-'}</code>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '1rem', fontStyle: 'italic' }}>
                      &ldquo;{payload.text_excerpt || '[Teks kosong]'}&rdquo;
                    </div>

                    {payload.flags && payload.flags.length > 0 && (
                      <div className="callout callout-danger" style={{ margin: '0.75rem 0', padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                        ⚠️ <strong>Peringatan Risiko Terdeteksi:</strong> {payload.flags.join(', ')}
                      </div>
                    )}

                    {item.review_status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          onClick={() => handleQuarantineAction(item.review_id, 'APPROVED')}
                          className="btn btn-emerald"
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                        >
                          ✓ Setujui (Approve)
                        </button>
                        <button
                          onClick={() => handleQuarantineAction(item.review_id, 'REJECTED')}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', color: 'var(--accent-rose)' }}
                        >
                          ✕ Tolak (Reject)
                        </button>
                        <button
                          onClick={() => handleQuarantineAction(item.review_id, 'FLAGGED')}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                        >
                          🚩 Tandai Risiko (Flag)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Scraping Jobs */}
      {!loading && activeTab === 'jobs' && (
        <div role="tabpanel" id="panel-jobs" aria-labelledby="tab-btn-jobs" tabIndex={0} className="table-wrapper">
          <table className="table">
            <caption className="sr-only">Riwayat Eksekusi Pekerjaan Scraping Lokal</caption>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Mode</th>
                <th>Target URL</th>
                <th>Status</th>
                <th>Hasil Crawl</th>
                <th>Waktu Eksekusi</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id}>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>{job.job_id}</code>
                  </td>
                  <td>
                    <span className={`badge ${job.mode === 'TRUSTED' ? 'badge-emerald' : 'badge-amber'}`}>
                      {job.mode}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                    {job.target_url}
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'COMPLETED' ? 'badge-emerald' : (job.status === 'QUARANTINED' ? 'badge-amber' : 'badge-rose')}`}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {job.items_crawled > 0 ? `${job.items_crawled} item tersimpan` : (job.items_quarantined > 0 ? `${job.items_quarantined} masuk karantina` : job.error_message || '-')}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {job.started_at ? new Date(job.started_at).toLocaleTimeString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
        <Link href="/" className="btn btn-secondary">
          &larr; Kembali ke Beranda
        </Link>
        <Link href="/setup" className="btn btn-secondary">
          Setup Wizard
        </Link>
      </div>
    </div>
  );
}
