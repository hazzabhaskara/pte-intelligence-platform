'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'remediation' | 'sm2' | 'practical'>('remediation');
  const [loading, setLoading] = useState<boolean>(true);

  const [curriculumData, setCurriculumData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-4w');

  // Flashcard review state
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [showCardAnswer, setShowCardAnswer] = useState<boolean>(false);
  const [cardUpdating, setCardUpdating] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [curRes, cardRes] = await Promise.all([
        fetch('/api/curriculum'),
        fetch('/api/curriculum/cards')
      ]);
      const curData = await curRes.json();
      const cData = await cardRes.json();

      if (curData.success) {
        setCurriculumData(curData);
        if (curData.active_plan) {
          setSelectedPlanId(`plan-${curData.active_plan.duration_weeks}w`);
        }
      }
      if (cData.success) {
        setCards(cData.cards || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePlan = async (weeks: number) => {
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_weeks: weeks })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPlanId(`plan-${weeks}w`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRateCard = async (rating: number) => {
    if (cards.length === 0) return;
    const currentCard = cards[activeCardIndex];
    setCardUpdating(true);

    try {
      const res = await fetch('/api/curriculum/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: currentCard.schedule_id,
          quality_rating: rating
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCardAnswer(false);
        if (activeCardIndex < cards.length - 1) {
          setActiveCardIndex(activeCardIndex + 1);
        } else {
          fetchData();
          setActiveCardIndex(0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCardUpdating(false);
    }
  };

  const curTabsList: ('remediation' | 'sm2' | 'plans' | 'practical')[] = ['remediation', 'sm2', 'plans', 'practical'];
  const handleCurTabKeyDown = (e: React.KeyboardEvent, currentTab: 'remediation' | 'sm2' | 'plans' | 'practical') => {
    const idx = curTabsList.indexOf(currentTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = curTabsList[(idx + 1) % curTabsList.length];
      setActiveTab(nextTab);
      document.getElementById(`tab-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = curTabsList[(idx - 1 + curTabsList.length) % curTabsList.length];
      setActiveTab(prevTab);
      document.getElementById(`tab-${prevTab}`)?.focus();
    }
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
        Memuat kurikulum adaptif & jadwal latihan...
      </div>
    );
  }

  const activePlanConfig = curriculumData?.study_plans?.find((p: any) => p.id === selectedPlanId) || curriculumData?.study_plans?.[1];
  const currentCard = cards[activeCardIndex];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hero-pill">Fase 7 &bull; Adaptive Learning & Spaced Repetition</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Kurikulum Adaptif, Remediasi & Spaced Repetition
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '850px' }}>
          Optimalkan waktu persiapan visa WHV 462 Anda. Fokus pada tipe soal dengan bobot pengaruh nilai tertinggi, hafalkan pola dengan algoritma SuperMemo SM-2, dan pelajari bahasa Inggris fungsional Australia.
        </p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Kategori Kurikulum dan Remediasi"
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'remediation'}
          aria-controls="panel-remediation"
          id="tab-remediation"
          tabIndex={activeTab === 'remediation' ? 0 : -1}
          onClick={() => setActiveTab('remediation')}
          onKeyDown={(e) => handleCurTabKeyDown(e, 'remediation')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            color: activeTab === 'remediation' ? 'var(--accent-rose)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'remediation' ? '3px solid var(--accent-rose)' : 'none',
            cursor: 'pointer'
          }}
        >
          ⚠️ Remediasi Berbobot Tinggi
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'sm2'}
          aria-controls="panel-sm2"
          id="tab-sm2"
          tabIndex={activeTab === 'sm2' ? 0 : -1}
          onClick={() => setActiveTab('sm2')}
          onKeyDown={(e) => handleCurTabKeyDown(e, 'sm2')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            color: activeTab === 'sm2' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'sm2' ? '3px solid var(--accent-purple)' : 'none',
            cursor: 'pointer'
          }}
        >
          🧠 Spaced Repetition Deck (SM-2)
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'plans'}
          aria-controls="panel-plans"
          id="tab-plans"
          tabIndex={activeTab === 'plans' ? 0 : -1}
          onClick={() => setActiveTab('plans')}
          onKeyDown={(e) => handleCurTabKeyDown(e, 'plans')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            color: activeTab === 'plans' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'plans' ? '3px solid var(--accent-blue)' : 'none',
            cursor: 'pointer'
          }}
        >
          🗓️ Rencana Belajar (2, 4, 8, 12 Minggu)
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'practical'}
          aria-controls="panel-practical"
          id="tab-practical"
          tabIndex={activeTab === 'practical' ? 0 : -1}
          onClick={() => setActiveTab('practical')}
          onKeyDown={(e) => handleCurTabKeyDown(e, 'practical')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            color: activeTab === 'practical' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'practical' ? '3px solid var(--accent-emerald)' : 'none',
            cursor: 'pointer'
          }}
        >
          🦘 Australia Practical English Track
        </button>
      </div>

      {/* --- TAB 1: HIGH-IMPACT REMEDIATION --- */}
      {activeTab === 'remediation' && (
        <div role="tabpanel" id="panel-remediation" aria-labelledby="tab-remediation" tabIndex={0}>
          <div className="callout callout-info" style={{ marginBottom: '1.5rem' }}>
            💡 <strong>Strategi Skor WHV 462:</strong> Pearson PTE memiliki sistem penilaian silang (*cross-skill scoring*). Tipe soal seperti <strong>Write From Dictation</strong> dan <strong>Read Aloud</strong> menyumbang poin masif ke seksi lain. Menguasai 4 tipe soal teratas menjamin target aman 36+ tercapai dengan usaha paling efisien.
          </div>

          <div className="table-wrapper">
            <table className="table">
              <caption className="sr-only">Prioritas Remediasi Berbobot Tinggi Berdasarkan Akurasi Jawaban</caption>
              <thead>
                <tr>
                  <th>Tipe Soal</th>
                  <th>Pengaruh Silang (*Cross-Skills*)</th>
                  <th>Bobot Nilai</th>
                  <th>Akurasi Anda</th>
                  <th>Status Remediasi</th>
                  <th>Aksi Latihan</th>
                </tr>
              </thead>
              <tbody>
                {curriculumData?.remediation_priorities?.map((rem: any) => (
                  <tr key={rem.type_code}>
                    <td>
                      <span className="badge badge-blue" style={{ marginRight: '0.4rem' }}>{rem.type_code}</span>
                      <strong>{rem.name}</strong>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {rem.impact}
                    </td>
                    <td style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {(rem.weight * 100).toFixed(0)}%
                    </td>
                    <td style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      <span style={{ color: rem.current_acc >= 75 ? 'var(--accent-emerald)' : (rem.current_acc >= 60 ? 'var(--accent-amber)' : 'var(--accent-rose)') }}>
                        {rem.current_acc}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${rem.status === 'REMEDIATION_URGENT' ? 'badge-rose' : (rem.status === 'NEEDS_PRACTICE' ? 'badge-amber' : 'badge-emerald')}`}>
                        {rem.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/practice/simulator?mode=DRILL&type=${rem.type_code}`}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Drill Fokus &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: SPACED REPETITION (SM-2) --- */}
      {activeTab === 'sm2' && (
        <div role="tabpanel" id="panel-sm2" aria-labelledby="tab-sm2" tabIndex={0} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ border: '1px solid rgba(168, 85, 247, 0.4)', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div className="card-header" style={{ justifyContent: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
                KARTU MEMORI SM-2 &bull; {activeCardIndex + 1} dari {cards.length}
              </span>
            </div>

            {currentCard ? (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  TIPE SOAL: <strong style={{ color: 'var(--accent-cyan)' }}>{currentCard.type_code}</strong> &bull; Interval Saat Ini: {currentCard.repetition_interval_days} hari (EF: {currentCard.ease_factor})
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: '#f8fafc',
                  marginBottom: '1.75rem',
                  minHeight: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentCard.prompt_text}
                </div>

                {showCardAnswer ? (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#ecfdf5',
                      fontSize: '1rem',
                      marginBottom: '2rem'
                    }}
                  >
                    <strong>Kunci Jawaban / Model Respon:</strong><br />
                    <span style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem', fontWeight: 600 }}>
                      {currentCard.accepted_canonical_text || currentCard.prompt_text}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCardAnswer(true)}
                    className="btn btn-secondary"
                    style={{ marginBottom: '2rem', padding: '0.6rem 2rem' }}
                    id="btn-show-card-answer"
                  >
                    👁️ Buka Kunci Jawaban
                  </button>
                )}

                {showCardAnswer && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Seberapa lancar Anda mengingat/menjawab kalimat ini?
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleRateCard(1)}
                        disabled={cardUpdating}
                        className="btn btn-secondary"
                        style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                        id="btn-rate-hard"
                      >
                        🔴 Sulit / Lupa (1 hari)
                      </button>
                      <button
                        onClick={() => handleRateCard(3)}
                        disabled={cardUpdating}
                        className="btn btn-secondary"
                        style={{ color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                        id="btn-rate-good"
                      >
                        🟡 Cukup Ingat (6 hari)
                      </button>
                      <button
                        onClick={() => handleRateCard(5)}
                        disabled={cardUpdating}
                        className="btn btn-emerald"
                        id="btn-rate-easy"
                      >
                        🟢 Lancar Sempurna (15+ hari)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div role="status" aria-live="polite" style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>
                Semua kartu untuk hari ini telah selesai ditinjau! 🎉
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: STUDY PLANS --- */}
      {activeTab === 'plans' && (
        <div role="tabpanel" id="panel-plans" aria-labelledby="tab-plans" tabIndex={0}>
          <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
            {curriculumData?.study_plans?.map((plan: any) => (
              <button
                type="button"
                key={plan.id}
                onClick={() => handleChangePlan(plan.duration_weeks)}
                aria-pressed={selectedPlanId === plan.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit',
                  border: selectedPlanId === plan.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: selectedPlanId === plan.id ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{plan.intensity_label}</div>
                <h4 style={{ fontSize: '1.05rem', margin: '0.4rem 0', color: selectedPlanId === plan.id ? 'var(--accent-blue)' : '#fff' }}>
                  {plan.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {plan.target_user}
                </p>
                {selectedPlanId === plan.id && (
                  <span className="badge badge-emerald" style={{ marginTop: '0.75rem' }}>
                    AKTIF DIPILIH
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Plan Modules */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Jadwal Harian: {activePlanConfig?.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activePlanConfig?.description}</p>
              </div>
              <span className="badge badge-blue">{activePlanConfig?.duration_weeks} MINGGU</span>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <caption className="sr-only">Jadwal Sesi Belajar Harian Rencana Aktif</caption>
                <thead>
                  <tr>
                    <th>Hari</th>
                    <th>Fokus Keterampilan</th>
                    <th>Sesi Pagi (Speaking)</th>
                    <th>Sesi Siang (Writing)</th>
                    <th>Sesi Sore (Reading & Listening)</th>
                    <th>Alokasi Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlanConfig?.daily_sessions?.map((session: any) => (
                    <tr key={session.day_number}>
                      <td style={{ fontWeight: 700 }}>Hari ke-{session.day_number}</td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{session.focus}</td>
                      <td style={{ fontSize: '0.85rem' }}>{session.speaking_drill}</td>
                      <td style={{ fontSize: '0.85rem' }}>{session.writing_drill}</td>
                      <td style={{ fontSize: '0.85rem' }}>{session.reading_listening_drill}</td>
                      <td>
                        <span className="badge badge-purple">{session.estimated_minutes} Menit</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: AUSTRALIA PRACTICAL ENGLISH --- */}
      {activeTab === 'practical' && (
        <div role="tabpanel" id="panel-practical" aria-labelledby="tab-practical" tabIndex={0} className="grid-cols-2" style={{ gap: '1.5rem' }}>
          {curriculumData?.australia_modules?.map((mod: any) => (
            <div key={mod.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <span className="card-title" style={{ fontSize: '1.05rem' }}>{mod.title}</span>
                  <span className="badge badge-emerald">{mod.category}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {mod.description}
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    GLOSARIUM ISTILAH PENTING:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {mod.key_terms.map((term: string) => (
                      <span key={term} className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#cffafe', fontStyle: 'italic', borderLeft: '3px solid var(--accent-cyan)' }}>
                  {mod.scenario_dialogue}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
        <Link href="/practice" className="btn btn-secondary">
          &larr; Simulasi Latihan
        </Link>
        <Link href="/practice/ai-evaluation" className="btn btn-secondary">
          Evaluasi AI
        </Link>
      </div>
    </div>
  );
}
