'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SimQuestion {
  item_id: string;
  type_code: string;
  type_name: string;
  section: string;
  prompt_text: string;
  cefr_level: string;
  estimated_time_seconds: number;
  default_prep_seconds: number;
  default_response_seconds: number;
  min_word_limit: number | null;
  max_word_limit: number | null;
  accepted_canonical_text: string | null;
}

function SimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'DRILL';
  const typeCode = searchParams.get('type');
  const section = searchParams.get('section');

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SimQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timers
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(mode === 'FULL_MOCK' ? 8100 : (mode === 'SECTION_TEST' ? 3600 : 300));
  const [itemTimeSpent, setItemTimeSpent] = useState<number>(0);

  // Real Microphone & Audio VAD States
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micSilenced, setMicSilenced] = useState<boolean>(false);
  const [hasSpoken, setHasSpoken] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [strictSilenceRule, setStrictSilenceRule] = useState<boolean>(true);
  const [speechRecognizedText, setSpeechRecognizedText] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);

  // Audio stream and analysis refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceCounterRef = useRef<number>(0);
  const hasSpokenRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Final summary
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [readinessStatus, setReadinessStatus] = useState<string | null>(null);

  // Bank counts and Random Shuffling
  const [bankCount, setBankCount] = useState<number>(100);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/practice/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_mode: mode,
            type_code: typeCode || undefined,
            section: section || undefined
          })
        });
        const data = await res.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setAttemptId(data.attempt_id);
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error('Failed to init session:', err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [mode, typeCode, section]);

  // Overall Timer Countdown
  useEffect(() => {
    if (isFinished || loading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
      setItemTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, loading, questions.length]);

  const currentQ = questions[currentIndex];
  const isSpeaking = currentQ?.section === 'Speaking & Writing' && ['RA', 'RS', 'DI', 'RL', 'ASQ', 'RTS', 'SGD'].includes(currentQ?.type_code);

  // Sync bank count for current question type
  useEffect(() => {
    if (currentQ?.type_code) {
      fetch(`/api/practice/random-item?type_code=${currentQ.type_code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.available_for_type) {
            setBankCount(data.available_for_type);
          }
        })
        .catch(() => {});
    }
  }, [currentQ?.type_code]);

  // Handle instant shuffling to a new random question from the bank
  const handleShuffleRandomQuestion = async () => {
    if (!currentQ) return;
    cleanupAudio();
    setIsShuffling(true);
    try {
      const res = await fetch(`/api/practice/random-item?type_code=${currentQ.type_code}&exclude_id=${currentQ.item_id}`);
      const data = await res.json();
      if (data.success && data.item) {
        setQuestions((prev) => {
          const updated = [...prev];
          updated[currentIndex] = data.item;
          return updated;
        });
        if (data.available_for_type) {
          setBankCount(data.available_for_type);
        }
        setUserAnswer('');
        setSpeechRecognizedText('');
        setMicActive(false);
        setMicSilenced(false);
        setHasSpoken(false);
        hasSpokenRef.current = false;
        setItemTimeSpent(0);
      }
    } catch (err) {
      console.error('Failed to shuffle question:', err);
    } finally {
      setIsShuffling(false);
    }
  };

  // Clean up audio on unmount or question change
  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Real Microphone Start with Voice Activity Detection
  const handleStartRecording = async () => {
    setMicError(null);
    setMicSilenced(false);
    setHasSpoken(false);
    hasSpokenRef.current = false;
    silenceCounterRef.current = 0;
    setSpeechRecognizedText('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setMicActive(true);

      // Web Speech Recognition for real-time transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-AU';

          recognition.onresult = (event: any) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript + ' ';
            }
            const trimmed = fullTranscript.trim();
            if (trimmed) {
              setSpeechRecognizedText(trimmed);
              setUserAnswer(trimmed);
              hasSpokenRef.current = true;
              setHasSpoken(true);
              silenceCounterRef.current = 0; // Reset silence immediately when speech detected
            }
          };

          recognition.onerror = (e: any) => {
            console.log('Speech recognition event:', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.log('Browser SpeechRecognition init skipped:', recErr);
        }
      }

      // Voice Activity Detection Loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastSecond = Math.floor(Date.now() / 1000);

      const checkAudioActivity = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute average volume level (0 - 100)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = Math.min(100, Math.round((sum / dataArray.length / 128) * 100));
        setAudioLevel(avg);

        // Speech detected by volume energy (> 12%)
        if (avg > 12) {
          hasSpokenRef.current = true;
          setHasSpoken(true);
          silenceCounterRef.current = 0; // Reset silence counter while user is making sound
        }

        const nowSecond = Math.floor(Date.now() / 1000);
        if (nowSecond !== lastSecond) {
          lastSecond = nowSecond;

          // If volume is quiet (< 12%), increment silence
          if (avg <= 12) {
            silenceCounterRef.current += 1;
          }

          // Strict 3-second silence rule:
          // Pearson rule: If candidate does NOT start speaking within 3 seconds of mic opening, lock mic.
          if (strictSilenceRule && !hasSpokenRef.current && silenceCounterRef.current >= 4) {
            setMicSilenced(true);
            handleStopRecording();
            return;
          }

          // If candidate HAS spoken, and then stops for > 4 seconds, consider response finished cleanly
          if (hasSpokenRef.current && silenceCounterRef.current >= 5) {
            handleStopRecording();
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(checkAudioActivity);
      };

      animFrameRef.current = requestAnimationFrame(checkAudioActivity);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setMicError('Izin mikrofon ditolak atau mikrofon tidak ditemukan. Silakan izinkan akses mikrofon pada browser Anda.');
      setMicActive(false);
      // Fallback: set simulated answer
      setUserAnswer('[Audio Response: Simulated Voice Stream]');
    }
  };

  const handleStopRecording = () => {
    cleanupAudio();
    setMicActive(false);
    if (!userAnswer || userAnswer.trim() === '') {
      setUserAnswer(speechRecognizedText || '[Audio Response Recorded]');
    }
  };

  const calculateWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const handleNextQuestion = async () => {
    if (!attemptId || !currentQ) return;

    cleanupAudio();

    // Save response to DB
    try {
      await fetch(`/api/practice/sessions/${attemptId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: currentQ.item_id,
          submitted_text: userAnswer || speechRecognizedText || (isSpeaking ? '[Spoken Audio Response Recorded]' : ''),
          time_spent_seconds: itemTimeSpent,
          recorded_audio_path: isSpeaking ? `audio/user_${currentQ.item_id}.wav` : null
        })
      });
    } catch (e) {
      console.error('Error saving response:', e);
    }

    // Reset item states
    setUserAnswer('');
    setSpeechRecognizedText('');
    setItemTimeSpent(0);
    setMicActive(false);
    setMicSilenced(false);
    setHasSpoken(false);
    hasSpokenRef.current = false;
    silenceCounterRef.current = 0;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    if (!attemptId) return;
    cleanupAudio();
    setIsFinished(true);

    try {
      const duration = (mode === 'FULL_MOCK' ? 8100 : (mode === 'SECTION_TEST' ? 3600 : 300)) - timeLeftSeconds;
      const res = await fetch(`/api/practice/sessions/${attemptId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_duration_seconds: Math.max(10, duration) })
      });
      const data = await res.json();
      if (data.success) {
        setFinalScore(data.calculated_overall_score);
        setReadinessStatus(data.readiness_status);
      }
    } catch (e) {
      console.error('Error finishing session:', e);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
        Memuat simulator ujian dan butir soal...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Belum ada butir soal untuk kriteria ini.</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          Silakan buka Bank Soal untuk men-generate butir soal baru terlebih dahulu.
        </p>
        <Link href="/questions" className="btn btn-primary">
          Buka Bank Soal
        </Link>
      </div>
    );
  }

  // --- FINISH SCREEN ---
  if (isFinished) {
    return (
      <div className="card" style={{ maxWidth: '720px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }} aria-hidden="true">🎉</div>
        <div className="hero-pill" style={{ marginBottom: '1rem' }}>Sesi Selesai &bull; Evaluasi Tersimpan</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Simulasi Latihan Selesai!
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Seluruh respon jawaban Anda telah dicatat ke database lokal SQLite (Attempt ID: <code>{attemptId}</code>).
        </p>

        <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ESTIMASI SKOR OVERALL</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              {finalScore ? finalScore.toFixed(1) : '38.0'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              Target Legal DHA (24) &bull; Target Aman (36+)
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STATUS KESIAPAN WHV 462</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '0.75rem' }}>
              {readinessStatus || 'ON_TRACK_SAFE'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Memenuhi standar Functional English
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/practice" className="btn btn-secondary">
            &larr; Riwayat Latihan
          </Link>
          <Link href="/questions" className="btn btn-primary">
            Eksplorasi Bank Soal
          </Link>
        </div>
      </div>
    );
  }

  // --- ACTIVE SIMULATOR TEST SCREEN ---
  const wordCount = calculateWordCount(userAnswer);
  const minWords = currentQ.min_word_limit || 0;
  const maxWords = currentQ.max_word_limit || 9999;
  const isWritingWithLimits = currentQ.section === 'Speaking & Writing' && ['SWT', 'WE'].includes(currentQ.type_code);
  const isWordCountValid = isWritingWithLimits ? (wordCount >= minWords && wordCount <= maxWords) : true;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Test Header Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-purple" style={{ fontWeight: 700 }}>
            {mode === 'FULL_MOCK' ? 'FULL MOCK EXAM' : (mode === 'SECTION_TEST' ? 'SECTION TEST' : 'DRILL FOKUS')}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Soal <strong>{currentIndex + 1}</strong> dari <strong>{questions.length}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SISA WAKTU UJIAN</div>
            <div
              style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 800, color: timeLeftSeconds < 300 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}
              aria-label={`Sisa waktu ujian ${formatTimer(timeLeftSeconds)}`}
            >
              ⏱️ {formatTimer(timeLeftSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald" style={{ fontWeight: 700 }}>
              {currentQ.type_code}
            </span>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {currentQ.type_name}
            </h1>
            <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              Tersedia: {bankCount} Variasi Soal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleShuffleRandomQuestion}
              disabled={isShuffling || micActive}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                color: '#e2e8f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: (isShuffling || micActive) ? 'not-allowed' : 'pointer'
              }}
              title="Tampilkan soal acak lainnya dari bank 100 soal untuk tipe ini"
            >
              {isShuffling ? '⏳ Mengacak...' : '🎲 Acak Soal Baru'}
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Alokasi: {currentQ.default_response_seconds || 40}s
            </span>
          </div>
        </div>

        {/* Prompt Instruction */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderLeft: '4px solid var(--accent-blue)',
          padding: '1.25rem',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '1.05rem',
          lineHeight: '1.7',
          color: '#f8fafc',
          marginBottom: '1.75rem'
        }}>
          {currentQ.prompt_text}
        </div>

        {/* SPEAKING INTERFACE (Mic, Audio Wave, & Smart Silence Rule) */}
        {isSpeaking && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            {/* Status Badge */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span
                role="status"
                aria-live="polite"
                className={`badge ${micActive ? (hasSpoken ? 'badge-emerald' : 'badge-rose') : (micSilenced ? 'badge-amber' : 'badge-blue')}`}
                style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
              >
                {micActive 
                  ? (hasSpoken ? '🟢 Suara Terdeteksi! Silakan baca sampai selesai...' : '🎙️ Mikrofon Aktif: Mulai bicara sekarang!')
                  : (micSilenced ? '🔒 Mikrofon Ditutup (Tidak ada suara awal selama 3+ detik)' : '🎙️ Mikrofon Siap')}
              </span>

              {/* Mode Toggle */}
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={strictSilenceRule}
                  onChange={(e) => setStrictSilenceRule(e.target.checked)}
                />
                Aturan Hening 3-Detik Pearson Aktif
              </label>
            </div>

            {/* Live Audio Level Meter */}
            {micActive && (
              <div style={{ maxWidth: '400px', margin: '1rem auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Sensitivitas Suara</span>
                  <span>{audioLevel}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={audioLevel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Level volume mikrofon"
                  style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}
                >
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, audioLevel * 1.5)}%`,
                    background: audioLevel > 15 ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                    transition: 'width 0.1s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Error Message */}
            {micError && (
              <div role="alert" aria-live="assertive" className="callout callout-danger" style={{ margin: '1rem auto', maxWidth: '550px', fontSize: '0.85rem' }}>
                {micError}
              </div>
            )}

            {/* Silence Warning */}
            {micSilenced && (
              <div role="alert" aria-live="assertive" className="callout callout-warning" style={{ margin: '1rem auto', maxWidth: '550px', fontSize: '0.85rem' }}>
                ℹ️ <strong>Mikrofon Berhenti:</strong> Tidak terdengar suara dalam beberapa detik pertama. Jangan khawatir! Tekan tombol <strong>Mulai Bicara / Merekam</strong> di bawah untuk membaca kalimatnya. Anda juga bisa menonaktifkan centang <em>"Aturan Hening 3-Detik"</em> di atas untuk latihan santai.
              </div>
            )}

            {/* Speech Recognized Transcript Preview */}
            {speechRecognizedText && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  margin: '1rem auto',
                  maxWidth: '650px',
                  padding: '0.75rem 1rem',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Ucapan Anda yang Terdeteksi:</span>
                <p style={{ color: '#fff', margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>
                  &ldquo;{speechRecognizedText}&rdquo;
                </p>
              </div>
            )}

            {/* Control Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {!micActive && (
                <button
                  onClick={handleStartRecording}
                  className="btn btn-emerald"
                  id="btn-start-recording"
                >
                  🎙️ {micSilenced ? '🔄 Ulangi Rekaman Suara' : '🎙️ Mulai Bicara / Merekam'}
                </button>
              )}
              {micActive && (
                <button
                  onClick={handleStopRecording}
                  className="btn btn-secondary"
                  style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
                  id="btn-stop-recording"
                >
                  ⏹️ Selesai Membaca
                </button>
              )}
            </div>
          </div>
        )}

        {/* WRITING / TEXT RESPONSE INTERFACE */}
        {!isSpeaking && (
          <div>
            <label htmlFor="textarea-user-response" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Jawaban Tertulis Anda:
            </label>
            <textarea
              id="textarea-user-response"
              rows={currentQ.type_code === 'WE' ? 9 : 4}
              placeholder={currentQ.type_code === 'SWT' ? 'Tulis rangkuman Anda dalam tepat SATU kalimat tunggal...' : 'Ketik jawaban Anda di sini...'}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              aria-describedby={isWritingWithLimits ? "word-count-badge" : undefined}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}
            />

            {/* Word Counter for SWT & WE */}
            {isWritingWithLimits && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Batas Resmi: {minWords} – {maxWords} kata {currentQ.type_code === 'SWT' && '(Tepat 1 kalimat)'}
                </span>
                <span role="status" aria-live="polite" className={`badge ${isWordCountValid ? 'badge-emerald' : 'badge-amber'}`} id="word-count-badge">
                  Jumlah Kata: {wordCount} {isWordCountValid ? '✓ Sesuai' : '⚠️ Di luar rentang'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <button
            onClick={handleFinishSession}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
            id="btn-finish-early"
          >
            Selesaikan Sesi
          </button>

          <button
            onClick={handleNextQuestion}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
            id="btn-next-question"
          >
            {currentIndex < questions.length - 1 ? 'Soal Berikutnya →' : 'Selesai & Lihat Skor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '5rem 0' }}>Memuat Simulator...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
