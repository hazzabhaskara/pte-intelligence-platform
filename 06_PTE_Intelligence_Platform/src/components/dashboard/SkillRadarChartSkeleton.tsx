import React from 'react';

export function SkillRadarChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`card ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        minHeight: '380px',
        justifyContent: 'space-between',
        position: 'relative'
      }}
      role="status"
      aria-live="polite"
      aria-label="Memuat visualisasi radar keterampilan..."
    >
      <style>{`
        @keyframes radarSkeletonPulse {
          0%, 100% { opacity: 0.35; transform: rotate(45deg) scale(0.98); }
          50% { opacity: 0.75; transform: rotate(45deg) scale(1.02); }
        }
      `}</style>

      {/* Header Placeholder */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: '1.2rem', width: '220px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }} />
        <div style={{ height: '1.2rem', width: '80px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px' }} />
      </div>

      {/* Pulsing Placeholder Wireframe Diamond */}
      <div
        style={{
          width: '200px',
          height: '200px',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          transform: 'rotate(45deg)',
          borderRadius: '8px',
          margin: '2rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'radarSkeletonPulse 2s infinite ease-in-out'
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            border: '1px dashed rgba(16, 185, 129, 0.25)',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Legend Placeholder */}
      <div style={{ height: '0.8rem', width: '280px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }} />
    </div>
  );
}

export default SkillRadarChartSkeleton;
