# Project: Executive Readiness Dashboard Scrolling & Performance Optimization

## Architecture
- **Presentation Layer**: Next.js 15 App Router (`src/app/dashboard/page.tsx`), React 19 client components, modular SVG components (`src/components/dashboard/SkillRadarChart.tsx`), global design tokens (`src/app/globals.css`).
- **Data & Service Layer**: Node.js 24 native SQLite driver (`src/lib/db.ts` via `node:sqlite DatabaseSync`), executive readiness aggregation service (`src/lib/services/readiness.ts`), REST API endpoint (`src/app/api/dashboard/route.ts`).
- **Performance Geometry**: Solid high-opacity card rendering (`rgba(15, 23, 42, 0.96)`), hardware-accelerated sticky navigation blur isolation, off-screen rendering avoidance (`content-visibility: auto`, `contain-intrinsic-size`), code-split client-side dynamic import (`ssr: false`), render isolation (`React.memo` with custom scalar comparator), and C-level SQLite aggregate calculations.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Card Backdrop-Filter Elimination | Remove `backdrop-filter: blur(12px)` from `.card`; replace `--bg-card` with `rgba(15, 23, 42, 0.96)` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Sticky Header Glassmorphism Retention | Retain `backdrop-filter: blur(16px)` exclusively on `.header-wrapper` | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Off-Screen Container Optimization | Add `content-visibility: auto` and `contain-intrinsic-size` to Backup Console and Module Hub | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Grid & Style Support | Add missing `.grid-cols-3` rule in `globals.css` for responsive card layout | M1 | Survey CSS Explorer |
| 5 | Native SVG Radar Chart Component | Create `src/components/dashboard/SkillRadarChart.tsx` using pure SVG diamond trigonometry and zero external dependencies | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Radar Chart Layout Skeleton | Create `src/components/dashboard/SkillRadarChartSkeleton.tsx` with matching geometry to ensure CLS = 0 | M2 | Survey Viz Explorer |
| 7 | Dynamic Import with SSR False | Dynamically import `SkillRadarChart` into `src/app/dashboard/page.tsx` via `next/dynamic` with `{ ssr: false }` | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Render Isolation Memoization | Wrap `SkillRadarChart` in `React.memo` with strict scalar equality check to prevent re-renders on scroll/backup | M2 | ORIGINAL_REQUEST §R2 |
| 9 | SQLite Aggregate Metrics Query | Refactor `readiness.ts` to compute `COUNT`, `AVG`, and `SUM` via SQLite SQL engine | M3 | ORIGINAL_REQUEST §R3 |
| 10 | Recent Attempts Limit 5 | Query `recent_attempts` with `ORDER BY completed_at DESC LIMIT 5` across the SQLite bridge | M3 | ORIGINAL_REQUEST §R3 |
| 11 | Zero-Record Baseline Fallback | Provide robust baseline fallbacks (42, 36, 35, 39, overall 38) when attempts table has 0 completed records | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Route Cache Optimization | Add `export const dynamic = 'force-dynamic'` to `src/app/api/dashboard/route.ts` | M3 | Survey DB Explorer |
| 13 | Build & TypeScript Verification | Run `npm run build` and `npm run lint` to guarantee 0 compiler and linting regressions | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Scrolling Performance Smoke Test | Execute 60 FPS scrolling profile and paint verification test | M4 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | CSS Repaint Bottleneck Elimination | `src/app/globals.css`, `.card`, `.header-wrapper`, off-screen container classes | none | DONE (Worker: 468895cd) |
| M2 | Visualization Component Refactoring | `SkillRadarChart.tsx`, `SkillRadarChartSkeleton.tsx`, `page.tsx` dynamic import & memo | M1 | DONE (Worker: 206bf5b6) |
| M3 | Server-Side SQLite Data Aggregation | `src/lib/services/readiness.ts`, `src/app/api/dashboard/route.ts` | none | DONE (Worker: 1183b99e) |
| M4 | Performance Verification & Smoke Test | Build, Lint, Visual QA, and 60 FPS profiling | M1, M2, M3 | DONE (Reviewers, Challengers, Auditor) |

## Code Layout
- `src/app/globals.css`: Global styles, CSS custom properties, `.card`, `.header-wrapper`, `.grid-cols-3`, `.dashboard-backup-section`, `.dashboard-hub-section`.
- `src/components/dashboard/SkillRadarChart.tsx`: Native SVG 4-axis radar chart displaying core skills balance with DHA benchmarks.
- `src/components/dashboard/SkillRadarChartSkeleton.tsx`: Zero-CLS loading skeleton placeholder for dynamic import.
- `src/app/dashboard/page.tsx`: Executive dashboard page layout, dynamic import integration, container section classes.
- `src/lib/services/readiness.ts`: Readiness calculation service executing SQL aggregate queries.
- `src/app/api/dashboard/route.ts`: API route returning aggregated dashboard metrics and max 5 recent attempts.
- `scripts/verify_perf_smoke.js`: Smoke test script to verify database output, build status, and scroll stability.

## Interface Contracts
### Dashboard Data API (`/api/dashboard`)
```typescript
interface DashboardResponse {
  success: boolean;
  data: {
    status: 'OPTIMAL' | 'GOOD' | 'CRITICAL';
    confidence: number;
    metrics: {
      total_exercises: number;
      responses_evaluated: number;
      schedules_active: number;
    };
    performance: {
      overall_score: number;
      speaking_score: number;
      writing_score: number;
      reading_score: number;
      listening_score: number;
      total_attempts: number;
      total_practice_minutes: number;
    };
    recent_attempts: Array<{
      attempt_id: string;
      session_mode: string;
      calculated_overall_score: number;
      speaking_score: number;
      writing_score: number;
      reading_score: number;
      listening_score: number;
      total_duration_seconds: number;
      readiness_status: string;
      completed_at?: string;
    }>;
    backups: Array<{
      id: string;
      filename: string;
      size_kb: number;
      created_at: string;
    }>;
  };
}
```

### SkillRadarChart Component Interface
```typescript
interface SkillRadarChartProps {
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  overallScore?: number;
  safeTarget?: number;      // default: 36
  legalMinimum?: number;    // default: 24
}
```
