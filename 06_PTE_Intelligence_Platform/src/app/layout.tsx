import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'PTE Academic Master Suite | Australia WHV Subclass 462',
  description: 'Local Personal Intelligence & Assessment Platform for Australia Work & Holiday Subclass 462 Functional English Preparation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Menuju ke konten utama
        </a>
        <header className="header-wrapper">
          <div className="header-inner">
            <Link href="/" className="brand-group">
              <div className="brand-icon" aria-hidden="true">PTE</div>
              <div>
                <span className="brand-title">PTE Academic Master Suite</span>
                <p className="brand-subtitle">Australia WHV Subclass 462 Intelligence Platform</p>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className="badge-target">
                <span className="badge-target-dot" aria-hidden="true"></span>
                <span>Target: 24 (Legal) / 36+ (Aman)</span>
              </div>

              <nav className="nav-links" aria-label="Navigasi Utama">
                <Link href="/" className="nav-link" id="nav-home">
                  Beranda
                </Link>
                <Link href="/dashboard" className="nav-link" id="nav-dashboard" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  Dashboard 🏆
                </Link>
                <Link href="/practice" className="nav-link" id="nav-practice">
                  Simulasi Latihan
                </Link>
                <Link href="/drafts" className="nav-link" id="nav-drafts">
                  Audit Berkas Lokal
                </Link>
                <Link href="/admin/sources" className="nav-link" id="nav-admin-sources">
                  Admin & Karantina
                </Link>
                <Link href="/questions" className="nav-link" id="nav-questions">
                  Bank Soal
                </Link>
                <Link href="/practice/ai-evaluation" className="nav-link" id="nav-ai-eval">
                  Evaluasi AI
                </Link>
                <Link href="/curriculum" className="nav-link" id="nav-curriculum">
                  Kurikulum & Remediasi
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="main-container">
          {children}
        </main>

        <footer>
          <div style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.7' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              PTE Academic Personal Intelligence Platform &bull; Hazza Abroad 2026
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pernyataan Hukum: Aplikasi ini adalah perangkat lunak persiapan belajar pribadi lokal independen dan TIDAK terafiliasi, disponsori, atau disetujui oleh Pearson PLC maupun Department of Home Affairs Australia. Skor yang disajikan merupakan estimasi umpan balik formatif berdasarkan model AI lokal dan bukan jaminan skor resmi ujian Pearson PTE Academic.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
