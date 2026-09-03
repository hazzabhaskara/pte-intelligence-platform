'use client';

import React, { useMemo } from 'react';

export interface SkillRadarChartProps {
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  safeTarget?: number;     // default: 36
  legalMinimum?: number;   // default: 24
  overallScore?: number;   // default: 38
  className?: string;
}

const CX = 180;
const CY = 180;
const MAX_RADIUS = 120;
const MAX_SCORE = 90;

function scoreToRadius(score: number): number {
  const clamped = Math.max(0, Math.min(MAX_SCORE, score));
  return (clamped / MAX_SCORE) * MAX_RADIUS;
}

function SkillRadarChartBase({
  speaking = 42,
  writing = 36,
  reading = 35,
  listening = 39,
  safeTarget = 36,
  legalMinimum = 24,
  overallScore = 38,
  className = ''
}: SkillRadarChartProps) {
  // Precompute polygon points using useMemo keyed to scalar primitives
  const {
    userPolygonPoints,
    safePolygonPoints,
    legalPolygonPoints,
    maxPolygonPoints,
    vertexPoints
  } = useMemo(() => {
    const rSpk = scoreToRadius(speaking);
    const rWri = scoreToRadius(writing);
    const rLis = scoreToRadius(listening);
    const rRea = scoreToRadius(reading);

    const rSafe = scoreToRadius(safeTarget);
    const rLegal = scoreToRadius(legalMinimum);
    const rMax = MAX_RADIUS;

    const userPts = [
      `${CX},${(CY - rSpk).toFixed(1)}`,
      `${(CX + rWri).toFixed(1)},${CY}`,
      `${CX},${(CY + rLis).toFixed(1)}`,
      `${(CX - rRea).toFixed(1)},${CY}`
    ].join(' ');

    const safePts = [
      `${CX},${(CY - rSafe).toFixed(1)}`,
      `${(CX + rSafe).toFixed(1)},${CY}`,
      `${CX},${(CY + rSafe).toFixed(1)}`,
      `${(CX - rSafe).toFixed(1)},${CY}`
    ].join(' ');

    const legalPts = [
      `${CX},${(CY - rLegal).toFixed(1)}`,
      `${(CX + rLegal).toFixed(1)},${CY}`,
      `${CX},${(CY + rLegal).toFixed(1)}`,
      `${(CX - rLegal).toFixed(1)},${CY}`
    ].join(' ');

    const maxPts = [
      `${CX},${CY - rMax}`,
      `${CX + rMax},${CY}`,
      `${CX},${CY + rMax}`,
      `${CX - rMax},${CY}`
    ].join(' ');

    const vertices = [
      { name: 'Speaking', x: CX, y: CY - rSpk, score: speaking, color: 'var(--accent-blue)' },
      { name: 'Writing', x: CX + rWri, y: CY, score: writing, color: 'var(--accent-purple)' },
      { name: 'Listening', x: CX, y: CY + rLis, score: listening, color: 'var(--accent-emerald)' },
      { name: 'Reading', x: CX - rRea, y: CY, score: reading, color: 'var(--accent-cyan)' }
    ];

    return {
      userPolygonPoints: userPts,
      safePolygonPoints: safePts,
      legalPolygonPoints: legalPts,
      maxPolygonPoints: maxPts,
      vertexPoints: vertices
    };
  }, [speaking, writing, reading, listening, safeTarget, legalMinimum]);

  return (
    <div
      className={`card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        minHeight: '380px',
        position: 'relative'
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <span>🕸️</span> Keseimbangan 4 Keterampilan (Radar Skill Balance)
        </h3>
        <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
          OVERALL: {overallScore}
        </span>
      </div>

      <svg
        viewBox="0 0 360 360"
        style={{ width: '100%', maxWidth: '340px', height: 'auto', overflow: 'visible' }}
        role="img"
        aria-label={`Radar Keseimbangan Keterampilan PTE: Speaking ${speaking}, Writing ${writing}, Listening ${listening}, Reading ${reading}. Target aman ${safeTarget}, batas legal ${legalMinimum}.`}
      >
        <title>Radar Keseimbangan 4 Keterampilan PTE Academic</title>
        <desc>
          Grafik radar menunjukkan skor Speaking ({speaking}), Writing ({writing}), Listening ({listening}), dan Reading ({reading}) dibandingkan target aman visa WHV 462 ({safeTarget}) dan batas legal ({legalMinimum}).
        </desc>

        <defs>
          <linearGradient id="radarScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.30" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Max Boundary (90) */}
        <polygon
          points={maxPolygonPoints}
          fill="rgba(255, 255, 255, 0.02)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />

        {/* Mid Reference (60) */}
        <polygon
          points={[
            `${CX},${CY - scoreToRadius(60)}`,
            `${CX + scoreToRadius(60)},${CY}`,
            `${CX},${CY + scoreToRadius(60)}`,
            `${CX - scoreToRadius(60)},${CY}`
          ].join(' ')}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
        />

        {/* Safe Target Benchmark (36) */}
        <polygon
          points={safePolygonPoints}
          fill="none"
          stroke="rgba(16, 185, 129, 0.6)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Legal Minimum Benchmark (24) */}
        <polygon
          points={legalPolygonPoints}
          fill="none"
          stroke="rgba(245, 158, 11, 0.5)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />

        {/* Cross-Axis Lines */}
        <line x1={CX} y1={CY - MAX_RADIUS} x2={CX} y2={CY + MAX_RADIUS} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
        <line x1={CX - MAX_RADIUS} y1={CY} x2={CX + MAX_RADIUS} y2={CY} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

        {/* User Score Polygon */}
        <polygon
          points={userPolygonPoints}
          fill="url(#radarScoreGradient)"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#radarGlow)"
        />

        {/* Vertex Dots */}
        {vertexPoints.map((v, i) => (
          <circle
            key={i}
            cx={v.x}
            cy={v.y}
            r="4.5"
            fill={v.color}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}

        {/* Skill Labels & Numbers Outside Apexes */}
        {/* Speaking (Top) */}
        <text x={CX} y={CY - MAX_RADIUS - 16} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">
          🎙️ Speaking
        </text>
        <text x={CX} y={CY - MAX_RADIUS - 3} textAnchor="middle" fill="var(--accent-blue)" fontSize="13" fontWeight="800">
          {speaking}
        </text>

        {/* Writing (Right) */}
        <text x={CX + MAX_RADIUS + 12} y={CY - 4} textAnchor="start" fill="var(--text-primary)" fontSize="11" fontWeight="700">
          ✍️ Writing
        </text>
        <text x={CX + MAX_RADIUS + 12} y={CY + 13} textAnchor="start" fill="var(--accent-purple)" fontSize="13" fontWeight="800">
          {writing}
        </text>

        {/* Listening (Bottom) */}
        <text x={CX} y={CY + MAX_RADIUS + 18} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">
          🎧 Listening
        </text>
        <text x={CX} y={CY + MAX_RADIUS + 32} textAnchor="middle" fill="var(--accent-emerald)" fontSize="13" fontWeight="800">
          {listening}
        </text>

        {/* Reading (Left) */}
        <text x={CX - MAX_RADIUS - 12} y={CY - 4} textAnchor="end" fill="var(--text-primary)" fontSize="11" fontWeight="700">
          📖 Reading
        </text>
        <text x={CX - MAX_RADIUS - 12} y={CY + 13} textAnchor="end" fill="var(--accent-cyan)" fontSize="13" fontWeight="800">
          {reading}
        </text>
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '0.75rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }} />
          Skor Saat Ini
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '12px', height: '2px', borderTop: '2px dashed var(--accent-emerald)' }} />
          Target Aman ({safeTarget}+)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '12px', height: '2px', borderTop: '2px dashed var(--accent-amber)' }} />
          Batas Legal 462 ({legalMinimum})
        </span>
      </div>
    </div>
  );
}

/**
 * Custom equality comparator for React.memo.
 * Strictly checks scalar primitive numbers and strings so that scrolling
 * and unrelated dashboard state updates (e.g., backup actions) never trigger re-renders.
 */
export function arePropsEqual(
  prev: SkillRadarChartProps,
  next: SkillRadarChartProps
): boolean {
  return (
    prev.speaking === next.speaking &&
    prev.writing === next.writing &&
    prev.reading === next.reading &&
    prev.listening === next.listening &&
    prev.safeTarget === next.safeTarget &&
    prev.legalMinimum === next.legalMinimum &&
    prev.overallScore === next.overallScore &&
    prev.className === next.className
  );
}

export const SkillRadarChart = React.memo(SkillRadarChartBase, arePropsEqual);
export default SkillRadarChart;
