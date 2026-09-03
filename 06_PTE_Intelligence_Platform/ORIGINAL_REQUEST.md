# Original User Request

## Initial Request — 2026-09-03T20:07:36Z

Use a full team of agents with parallel sub-task division.
Optimize the scrolling performance of the Executive Readiness Dashboard (`src/app/dashboard/page.tsx`) to achieve a stable 60 FPS by eliminating CSS repaint bottlenecks, code-splitting and memoizing the visualization component with `next/dynamic` (`ssr: false`) and `React.memo`, and executing analytics aggregations directly on the SQLite database server-side.

Working directory: d:/Hazza/Data Pribadi/ABROAD/06_PTE_Intelligence_Platform
Integrity mode: development

## Requirements

### R1. CSS Repaint Bottleneck Elimination
- Remove `backdrop-filter: blur(...)` from `.card` in `src/app/globals.css`; replace it with a solid or static high-opacity dark background color (`#0f172a` / `rgba(15, 23, 42, 0.96)`) to prevent GPU rasterization thrashing during scrolling.
- Retain subtle glassmorphism only on the top sticky navigation bar (`.header-wrapper`).
- Implement `content-visibility: auto` with appropriate `contain-intrinsic-size` for below-the-fold container sections (specifically the Backup Console and Quick Access Module Hub) to skip off-screen rendering cycles.

### R2. Visualization Component Refactoring (Dynamic Import & Memoization)
- Create a dedicated, native lightweight SVG visualization component (e.g., `src/components/dashboard/SkillRadarChart.tsx` or `SkillPerformanceChart.tsx`) displaying the 4 core skills balance without adding external third-party dependencies.
- Load this visualization component dynamically into `src/app/dashboard/page.tsx` using `next/dynamic` with `{ ssr: false }` to avoid blocking the initial page hydration.
- Wrap the component in `React.memo` so that scrolling and unrelated dashboard state updates (e.g., backup actions) do not trigger chart re-renders.

### R3. Server-Side SQLite Data Aggregation
- Refactor data computation in `src/app/api/dashboard/route.ts` and `src/lib/services/readiness.ts` so that performance statistics (`COUNT`, `AVG`, `SUM`) are calculated directly via SQLite aggregation functions instead of loading raw attempt arrays into Node.js for client-side or JavaScript loop processing.
- Query `recent_attempts` using a SQL `LIMIT 5` clause.
- Ensure fallback baseline values are maintained if the `attempts` table contains zero records.

### R4. Performance Smoke Testing & Verification
- Execute project build (`npm run build`) and lint verification (`npm run lint`) to confirm zero TypeScript and syntax regressions.
- Verify that dashboard UI visual structure, styling, and responsiveness remain intact.
- Perform a scrolling performance smoke test to confirm steady 60 FPS scrolling and the absence of layout shift or paint bottlenecks.

## Acceptance Criteria

### CSS & Scrolling Smoothness
- [ ] `.card` in `src/app/globals.css` does not contain `backdrop-filter`.
- [ ] Below-the-fold containers use `content-visibility: auto` and `contain-intrinsic-size`.
- [ ] DevTools / performance profiling confirms steady 60 FPS scrolling without forced reflow or repaint spikes.

### Component Architecture & Code Splitting
- [ ] Visualization component is split into `src/components/dashboard/` and loaded dynamically with `{ ssr: false }`.
- [ ] Component is wrapped in `React.memo` and does not re-render upon window scroll events.

### Database Query Optimization
- [ ] `attempts` scoring metrics are calculated with SQLite `AVG()`, `COUNT()`, `SUM()` in `src/lib/services/readiness.ts`.
- [ ] `/api/dashboard` payload contains only pre-aggregated summary statistics and a max of 5 recent attempts.

### Build & Integrity
- [ ] `npm run build` succeeds without errors or type warnings.
