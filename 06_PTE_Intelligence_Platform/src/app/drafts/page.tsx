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
  content_hash: string;
}

interface ClaimItem {
  claim_id: string;
  claim_text: string;
  domain_topic: string;
  classification: string;
  authority_reference: string;
  remediation_action: string;
}

export default function DraftsAuditPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/drafts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSources(data.sources);
          setClaims(data.claims);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getBadgeClass = (classification: string) => {
    switch (classification) {
      case 'VERIFIED_TRUE':
        return 'badge-emerald';
      case 'OUTDATED_SUPERSEDED':
        return 'badge-amber';
      case 'POTENTIALLY_DANGEROUS':
        return 'badge-rose';
      case 'COMMUNITY_STRATEGY':
        return 'badge-blue';
      default:
        return 'badge-purple';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Audit Berkas Lokal & Provenance</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Inventaris Materi Draft & Matriks Klaim
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Berkas draft lama dan transkrip akademik di workspace telah berhasil diimpor ke database lokal sebagai referensi awal dengan riwayat integritas hash SHA-256 dan klasifikasi keabsahan hukum.
        </p>
      </div>

      {loading && (
        <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          Memuat data sumber dan matriks klaim...
        </div>
      )}

      {error && (
        <div role="alert" aria-live="assertive" className="callout callout-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Section 1: Imported Sources */}
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>
            📁 Berkas Sumber yang Diimpor ({sources.length})
          </h2>

          <div className="table-wrapper" style={{ marginBottom: '3rem' }}>
            <table className="table">
              <caption className="sr-only">Daftar Berkas Sumber yang Diimpor ke Database Lokal</caption>
              <thead>
                <tr>
                  <th>Source ID</th>
                  <th>Judul Dokumen</th>
                  <th>Tier & Reliabilitas</th>
                  <th>Tipe Konten</th>
                  <th>SHA-256 Hash</th>
                  <th>Status Audit</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((src) => (
                  <tr key={src.source_id}>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{src.source_id}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{src.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{src.publisher}</div>
                    </td>
                    <td>
                      <span className={`badge ${src.source_tier === 'Tier 1' ? 'badge-emerald' : 'badge-amber'}`}>
                        {src.source_tier} ({Math.round(src.reliability_score * 100)}%)
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{src.content_type}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {src.content_hash ? src.content_hash.substring(0, 18) + '...' : '-'}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-blue">{src.verification_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Claims Ledger */}
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>
            🔍 Matriks Audit Klaim ({claims.length})
          </h2>

          <div className="table-wrapper" style={{ marginBottom: '2.5rem' }}>
            <table className="table">
              <caption className="sr-only">Matriks Audit Klaim dan Tindakan Remediasi</caption>
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Pernyataan Dokumen Asli</th>
                  <th>Topik</th>
                  <th>Klasifikasi Audit</th>
                  <th>Tindakan Remediasi Platform</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((clm) => (
                  <tr key={clm.claim_id}>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--accent-purple)' }}>{clm.claim_id}</code>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <span style={{ fontSize: '0.85rem' }}>{clm.claim_text}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{clm.domain_topic}</span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(clm.classification)}`}>
                        {clm.classification}
                      </span>
                    </td>
                    <td style={{ maxWidth: '360px' }}>
                      <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>{clm.remediation_action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/setup" className="btn btn-secondary">
              &larr; Kembali ke Setup Wizard
            </Link>
            <Link href="/" className="btn btn-primary">
              Kembali ke Beranda
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
